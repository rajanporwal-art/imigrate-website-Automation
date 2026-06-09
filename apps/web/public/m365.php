<?php
/**
 * Microsoft 365 OAuth + Graph action endpoint for the iMigrate CRM.
 *
 * OAuth (browser GET):
 *   ?action=connect           -> redirect to Microsoft sign-in
 *   ?action=callback&code=..  -> exchange code, store tokens, return to CRM
 *
 * Gated actions (POST JSON { password, action }):
 *   'status'    -> connection / health
 *   'send'      -> { to, subject, html }
 *   'messages'  -> { top?, search? }  inbox read
 *   'event'     -> { subject, start, end, attendee?, body? }  calendar
 *   'onedrive'  -> { name, content(base64), folder? }  upload/backup
 *   'disconnect'-> remove stored tokens
 */
@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }
require_once __DIR__ . '/m365-lib.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

/* ---------- Browser OAuth flow ---------- */
if ($method === 'GET') {
    $a = $_GET['action'] ?? '';
    if (!m365_is_configured()) {
        header('Content-Type: text/html; charset=utf-8');
        echo '<p style="font-family:sans-serif">Microsoft 365 is not configured yet. Copy <code>m365-config.example.php</code> to <code>m365-config.php</code> and add your Azure app credentials.</p>';
        exit;
    }
    if ($a === 'connect') {
        header('Location: ' . m365_authorize_url('crm'));
        exit;
    }
    if ($a === 'callback') {
        $code = (string) ($_GET['code'] ?? '');
        $ok = $code !== '' && m365_exchange_code($code);
        header('Content-Type: text/html; charset=utf-8');
        echo '<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;text-align:center;padding:40px">'
            . ($ok ? '<h2>✅ Microsoft 365 connected</h2><p>You can close this tab and return to the CRM.</p>'
                   : '<h2>❌ Connection failed</h2><p>Please try connecting again from CRM → Settings.</p>')
            . '<p><a href="/crm.html">Back to CRM</a></p>'
            . '<script>setTimeout(function(){location.href="/crm.html"},2500)</script></body>';
        exit;
    }
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Unknown GET action']);
    exit;
}

/* ---------- Gated POST actions ---------- */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
$p = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($p) || !hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''))) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}
$action = $p['action'] ?? 'status';

if ($action === 'status') {
    echo json_encode(['ok' => true, 'status' => m365_status(), 'connectUrl' => '/m365.php?action=connect']);
    exit;
}

if (!m365_is_connected()) {
    echo json_encode(['ok' => false, 'error' => 'Microsoft 365 not connected', 'status' => m365_status()]);
    exit;
}

if ($action === 'send') {
    $ok = m365_send_mail((string) ($p['to'] ?? ''), (string) ($p['subject'] ?? ''), (string) ($p['html'] ?? ''));
    echo json_encode(['ok' => $ok]);
    exit;
}
if ($action === 'messages') {
    $msgs = m365_list_messages((int) ($p['top'] ?? 15), (string) ($p['search'] ?? ''));
    echo json_encode(['ok' => true, 'messages' => $msgs]);
    exit;
}
if ($action === 'event') {
    $ev = m365_create_event((string) ($p['subject'] ?? 'Consultation'), (string) ($p['start'] ?? ''), (string) ($p['end'] ?? ''), (string) ($p['attendee'] ?? ''), (string) ($p['body'] ?? ''));
    echo json_encode(['ok' => (bool) $ev, 'event' => $ev]);
    exit;
}
if ($action === 'onedrive') {
    $content = base64_decode((string) ($p['content'] ?? ''), true);
    if ($content === false) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Invalid content']); exit; }
    $res = m365_onedrive_upload((string) ($p['name'] ?? 'backup.txt'), $content, (string) ($p['folder'] ?? 'iMigrate CRM'));
    echo json_encode(['ok' => (bool) $res, 'file' => $res]);
    exit;
}
if ($action === 'disconnect') {
    @unlink(m365_token_file());
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
