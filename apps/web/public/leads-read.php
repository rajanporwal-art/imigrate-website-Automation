<?php
/**
 * Password-protected leads reader for the admin dashboard.
 *  action "list"  -> returns all captured leads (newest first)
 *  action "retry" -> re-attempts HubSpot sync for any unsynced leads
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$payload = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($payload) || !hash_equals($EDIT_PASSWORD, (string) ($payload['password'] ?? ''))) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

$file = __DIR__ . '/leads/leads.ndjson';
$leads = [];
$needsHeal = false;
if (is_file($file)) {
    $content = (string) file_get_contents($file);
    $trim = ltrim($content);
    if ($trim !== '' && $trim[0] === '[') {
        // The store was written as a single JSON array (e.g. pretty-printed by a
        // tool/restore) instead of NDJSON. Parse it and self-heal to NDJSON so
        // line-by-line reads AND future appends work again.
        $arr = json_decode($content, true);
        if (is_array($arr)) { foreach ($arr as $row) { if (is_array($row)) $leads[] = $row; } $needsHeal = true; }
    } else {
        // Normal NDJSON — tolerate CR/LF/CRLF line endings.
        foreach (preg_split('/\r\n|\r|\n/', $content) as $line) {
            $line = trim($line);
            if ($line === '') continue;
            $row = json_decode($line, true);
            if (is_array($row)) $leads[] = $row;
        }
    }
    // One-time normalisation back to clean NDJSON when the format was off.
    if ($needsHeal && $leads) {
        $out = '';
        foreach ($leads as $l) $out .= json_encode($l) . "\n";
        @file_put_contents($file, $out, LOCK_EX);
    }
}

$action = $payload['action'] ?? 'list';

if ($action === 'retry') {
    require __DIR__ . '/hubspot-lib.php';
    $cfgPath = __DIR__ . '/hubspot.json';
    $cfg = is_file($cfgPath) ? json_decode((string) file_get_contents($cfgPath), true) : null;
    $retried = 0; $synced = 0;
    if (is_array($cfg) && !empty($cfg['enabled'])) {
        foreach ($leads as $idx => $lead) {
            if (!empty($lead['hubspotSynced'])) continue;
            $retried++;
            $body = hs_build_body($lead['fields'] ?? [], $lead['formName'] ?? '', $lead['context'] ?? [], $cfg);
            $code = hs_submit($cfg, $body);
            if ($code !== null && $code >= 200 && $code < 300) { $leads[$idx]['hubspotSynced'] = true; $synced++; }
        }
        $out = '';
        foreach ($leads as $l) $out .= json_encode($l) . "\n";
        @file_put_contents($file, $out, LOCK_EX);
    }
    echo json_encode(['ok' => true, 'retried' => $retried, 'synced' => $synced]);
    exit;
}

// Default: list (newest first)
echo json_encode(['ok' => true, 'leads' => array_reverse($leads)]);
