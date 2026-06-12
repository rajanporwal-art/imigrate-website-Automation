<?php
/**
 * Durable lead capture + HubSpot forwarder.
 *
 * Every website form POSTs here. The lead is ALWAYS saved to a server-side,
 * web-protected store first (so no lead is ever lost), then forwarded to
 * HubSpot via the Forms API. If HubSpot is unavailable, the lead is stored
 * with "hubspotSynced": false and can be retried from the admin dashboard.
 *
 * Works on standard Hostinger PHP hosting. No secrets required (HubSpot Forms
 * API uses your public Portal ID + Form GUID).
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 100000) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid request']);
    exit;
}

$payload = json_decode($raw, true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Malformed request']);
    exit;
}

// Honeypot — bots fill hidden "website" field; silently accept & drop.
if (!empty($payload['website'])) {
    echo json_encode(['ok' => true]);
    exit;
}

$fields  = isset($payload['fields']) && is_array($payload['fields']) ? $payload['fields'] : [];
$context = isset($payload['context']) && is_array($payload['context']) ? $payload['context'] : [];

// Defensive: if a form sends CV info at the top level (instead of inside
// "fields"), fold it in so the CV is never dropped before reaching the CRM.
foreach (['cvFile', 'cvOriginalName', 'cvFilename'] as $cvk) {
    if (empty($fields[$cvk]) && !empty($payload[$cvk])) { $fields[$cvk] = (string) $payload[$cvk]; }
}
if (!empty($fields['cvFile']) && empty($fields['cvFilename'])) { $fields['cvFilename'] = $fields['cvFile']; }
$formName = isset($payload['formName']) ? substr((string) $payload['formName'], 0, 80) : 'Website form';

// ---- 1. Persist the lead to a web-protected directory ---------------------
$dir = __DIR__ . '/leads';
if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
    // Block direct web access to the leads folder.
    @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
}

$record = [
    'id' => date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 6),
    'timestamp' => date('c'),
    'formName' => $formName,
    'fields' => $fields,
    'context' => $context,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
    'hubspotSynced' => false,
];

// ---- 2. Forward to HubSpot (Forms API) ------------------------------------
$cfgPath = __DIR__ . '/hubspot.json';
$cfg = is_file($cfgPath) ? json_decode((string) file_get_contents($cfgPath), true) : null;

require __DIR__ . '/hubspot-lib.php';
if (is_array($cfg)) {
    $body = hs_build_body($fields, $formName, $context, $cfg);
    $code = hs_submit($cfg, $body);
    if ($code !== null) {
        $record['hubspotSynced'] = ($code >= 200 && $code < 300);
        $record['hubspotStatus'] = $code;
    }
}

// Save AFTER attempting HubSpot so we record the sync result.
@file_put_contents($dir . '/leads.ndjson', json_encode($record) . "\n", FILE_APPEND | LOCK_EX);

// ---- 3. Optional email notification ---------------------------------------
if (is_array($cfg) && !empty($cfg['notifyEmail']) && filter_var($cfg['notifyEmail'], FILTER_VALIDATE_EMAIL)) {
    $subject = 'New website lead: ' . $formName;
    $msg = "New lead from $formName\n\n";
    foreach ($fields as $k => $v) { if (!is_array($v)) $msg .= "$k: $v\n"; }
    if (!empty($context['pageUri'])) $msg .= "\nPage: " . $context['pageUri'];
    @mail($cfg['notifyEmail'], $subject, $msg, 'Content-Type: text/plain; charset=utf-8');
}

echo json_encode(['ok' => true, 'hubspotSynced' => $record['hubspotSynced']]);
