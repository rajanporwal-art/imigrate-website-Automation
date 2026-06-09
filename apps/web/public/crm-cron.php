<?php
/**
 * Scheduled-email dispatcher for the iMigrate CRM.
 *
 * Hostinger cron job (recommended every 5 minutes):
 *   php /home/USER/domains/imigratesolution.com/public_html/crm-cron.php
 * or via URL with the secret token:
 *   curl "https://www.imigratesolution.com/crm-cron.php?key=CRON_SECRET"
 *
 * Set $CRON_SECRET in admin-config.php. Fires due scheduled emails by calling
 * crm-email.php's run-scheduled action internally.
 */
@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }
$CRON_SECRET = isset($CRON_SECRET) ? $CRON_SECRET : '';

header('Content-Type: application/json; charset=utf-8');

// CLI is always allowed; web access requires the secret.
$isCli = (php_sapi_name() === 'cli');
if (!$isCli) {
    $key = (string) ($_GET['key'] ?? '');
    if ($CRON_SECRET === '' || !hash_equals($CRON_SECRET, $key)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Forbidden']);
        exit;
    }
}

// Reuse the email endpoint's scheduled runner via an internal request.
$payload = json_encode(['action' => 'run-scheduled', 'password' => $EDIT_PASSWORD]);
$ctx = stream_context_create(['http' => [
    'method' => 'POST',
    'header' => "Content-Type: application/json\r\n",
    'content' => $payload,
    'timeout' => 25,
]]);
$proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'www.imigratesolution.com';
$res = @file_get_contents($proto . '://' . $host . '/crm-email.php', false, $ctx);

echo $res !== false ? $res : json_encode(['ok' => false, 'error' => 'Could not reach crm-email.php']);
