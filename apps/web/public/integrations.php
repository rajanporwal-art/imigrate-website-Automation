<?php
/**
 * integrations.php — unified integration connection manager for the Admin Portal.
 *
 * Lets admins connect third-party integrations from Portal → Integrations by
 * entering credentials, instead of editing files on the server. Gated by the
 * shared service key (svc = $EDIT_PASSWORD). Credentials live in the protected,
 * deploy-excluded auth/ directory; for HubSpot and Microsoft 365 the canonical
 * config files the rest of the app already reads (hubspot.json, m365-config.php)
 * are written too, so saving here actually activates the integration.
 *
 * POST JSON { svc, action, connector?, fields? }
 *   'status'      -> per-connector configured state (secrets masked)
 *   'save'        -> { connector, fields } -> store + write canonical files
 *   'disconnect'  -> { connector } -> clear credentials
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') { http_response_code(405); echo json_encode(['ok' => false, 'error' => 'Method not allowed']); exit; }
$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 200000) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Invalid request size']); exit; }
$p = json_decode($raw, true);
if (!is_array($p) || !hash_equals($EDIT_PASSWORD, (string) ($p['svc'] ?? $p['password'] ?? ''))) {
    http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Not authorized']); exit;
}

$ROOT = __DIR__;
$dir = $ROOT . '/auth';
if (!is_dir($dir)) { @mkdir($dir, 0755, true); @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n"); }
$STORE = $dir . '/integrations.json';

/* connector → field list; required fields decide "configured"; secret fields are masked. */
$FIELDS = [
    'hubspot'        => ['portalId', 'formGuid', 'notifyEmail'],
    'm365'           => ['client_id', 'client_secret', 'tenant', 'redirect_uri'],
    'google'         => ['apiKey', 'measurementId'],
    'mailchimp'      => ['apiKey', 'serverPrefix', 'audienceId'],
    'activecampaign' => ['apiUrl', 'apiKey'],
    'whatsapp'       => ['phoneNumberId', 'accessToken', 'businessId'],
    'email'          => ['senderName', 'senderEmail', 'notifyEmail'],
];
$REQUIRED = [
    'hubspot' => ['portalId', 'formGuid'], 'm365' => ['client_id', 'client_secret'],
    'google' => ['apiKey'], 'mailchimp' => ['apiKey'], 'activecampaign' => ['apiUrl', 'apiKey'],
    'whatsapp' => ['phoneNumberId', 'accessToken'], 'email' => ['senderEmail'],
];
$SECRET = ['client_secret' => 1, 'apiKey' => 1, 'accessToken' => 1];

function ig_load($f) { if (is_file($f)) { $d = json_decode((string) file_get_contents($f), true); return is_array($d) ? $d : []; } return []; }
function ig_save($f, $d) { return @file_put_contents($f, json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false; }
function ig_configured($vals, $req) { foreach ($req as $k) { if (empty($vals[$k])) return false; } return true; }
function ig_mask($v) { $v = (string) $v; return $v === '' ? '' : ('••••' . substr($v, -4)); }

$store = ig_load($STORE);
$action = (string) ($p['action'] ?? 'status');

if ($action === 'status') {
    // Canonical, deploy-persistent state — the portal must reflect the REAL
    // connection (the files the app actually uses), not just what was typed into
    // the portal form. These files are all excluded from deploys, so a connection
    // made here (or in the CRM) survives every deploy.
    $m365Configured = false; $m365Connected = false;
    if (is_file($ROOT . '/m365-lib.php')) {
        require_once $ROOT . '/m365-lib.php';
        if (function_exists('m365_is_configured')) $m365Configured = m365_is_configured(); // m365-config.php has creds
        if (function_exists('m365_is_connected')) $m365Connected = m365_is_connected();   // leads/m365-tokens.json has refresh token
    }
    $hsEnabled = false;
    if (is_file($ROOT . '/hubspot.json')) {
        $hs = json_decode((string) file_get_contents($ROOT . '/hubspot.json'), true) ?: [];
        $hsEnabled = !empty($hs['enabled']) && !empty($hs['portalId']) && !empty($hs['formGuid']);
    }

    $out = [];
    foreach ($FIELDS as $conn => $fields) {
        $vals = is_array($store[$conn] ?? null) ? $store[$conn] : [];
        $shown = [];
        foreach ($fields as $k) { $shown[$k] = isset($SECRET[$k]) ? ig_mask($vals[$k] ?? '') : (string) ($vals[$k] ?? ''); }
        // "configured" = required creds present in the portal store OR in the canonical file.
        $configured = ig_configured($vals, $REQUIRED[$conn] ?? []);
        if ($conn === 'm365') $configured = $configured || $m365Configured;
        if ($conn === 'hubspot') $configured = $configured || $hsEnabled;
        // "connected" = the integration is actually live/usable right now.
        $connected = $configured;
        if ($conn === 'm365') $connected = $m365Connected;          // requires completed OAuth sign-in
        if ($conn === 'hubspot') $connected = $hsEnabled || $configured;
        $out[$conn] = ['configured' => $configured, 'connected' => $connected, 'fields' => $shown];
    }
    echo json_encode(['ok' => true, 'connectors' => $out, 'm365Configured' => $m365Configured, 'm365Connected' => $m365Connected, 'm365ConnectUrl' => '/m365.php?action=connect']);
    exit;
}

if ($action === 'save') {
    $conn = (string) ($p['connector'] ?? '');
    if (!isset($FIELDS[$conn])) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Unknown connector']); exit; }
    $in = is_array($p['fields'] ?? null) ? $p['fields'] : [];
    $vals = is_array($store[$conn] ?? null) ? $store[$conn] : [];
    foreach ($FIELDS[$conn] as $k) {
        if (!array_key_exists($k, $in)) continue;
        $v = trim((string) $in[$k]);
        // For secret fields, an empty submit keeps the previously-stored value.
        if ($v === '' && isset($SECRET[$k]) && !empty($vals[$k])) continue;
        $vals[$k] = substr($v, 0, 4000);
    }
    if (!ig_configured($vals, $REQUIRED[$conn] ?? [])) {
        http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Please complete the required fields.']); exit;
    }
    $store[$conn] = $vals;
    ig_save($STORE, $store);

    // Side-effects: write the canonical files the rest of the app reads.
    if ($conn === 'hubspot') {
        $hs = is_file($ROOT . '/hubspot.json') ? (json_decode((string) file_get_contents($ROOT . '/hubspot.json'), true) ?: []) : [];
        $hs['enabled'] = true;
        $hs['portalId'] = $vals['portalId'];
        $hs['formGuid'] = $vals['formGuid'];
        if (!empty($vals['notifyEmail'])) $hs['notifyEmail'] = $vals['notifyEmail'];
        @file_put_contents($ROOT . '/hubspot.json', json_encode($hs, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
    }
    if ($conn === 'm365') {
        $php = "<?php\n/* Written by Portal → Integrations → Microsoft 365. */\n\$M365 = [\n"
            . "    'client_id'     => " . var_export($vals['client_id'] ?? '', true) . ",\n"
            . "    'client_secret' => " . var_export($vals['client_secret'] ?? '', true) . ",\n"
            . "    'tenant'        => " . var_export($vals['tenant'] ?? 'common', true) . ",\n"
            . "    'redirect_uri'  => " . var_export($vals['redirect_uri'] ?: 'https://www.imigratesolution.com/m365.php?action=callback', true) . ",\n"
            . "    'scopes'        => 'offline_access User.Read Mail.Send Mail.Read Calendars.ReadWrite Files.ReadWrite',\n];\n";
        // Write to the deploy-proof auth/ directory so the M365 connection persists
        // across deploys (root-level files are not reliably preserved by the mirror).
        @file_put_contents($dir . '/m365-config.php', $php, LOCK_EX);
        @file_put_contents($ROOT . '/m365-config.php', $php, LOCK_EX); // legacy mirror (best-effort)
    }
    echo json_encode(['ok' => true, 'configured' => true, 'connector' => $conn]);
    exit;
}

if ($action === 'disconnect') {
    $conn = (string) ($p['connector'] ?? '');
    if (!isset($FIELDS[$conn])) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Unknown connector']); exit; }
    unset($store[$conn]);
    ig_save($STORE, $store);
    if ($conn === 'hubspot' && is_file($ROOT . '/hubspot.json')) {
        $hs = json_decode((string) file_get_contents($ROOT . '/hubspot.json'), true) ?: [];
        $hs['enabled'] = false;
        @file_put_contents($ROOT . '/hubspot.json', json_encode($hs, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
    }
    if ($conn === 'm365') { @unlink($dir . '/m365-config.php'); @unlink($ROOT . '/m365-config.php'); }
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
