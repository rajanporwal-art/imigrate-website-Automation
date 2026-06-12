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

$proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host  = $_SERVER['HTTP_HOST'] ?? 'www.imigratesolution.com';

// 1. Dispatch due scheduled emails (crm-email.php)
$ctx1 = stream_context_create(['http' => ['method' => 'POST', 'header' => "Content-Type: application/json\r\n", 'content' => json_encode(['action' => 'run-scheduled', 'password' => $EDIT_PASSWORD]), 'timeout' => 25]]);
$res1 = @file_get_contents($proto . '://' . $host . '/crm-email.php', false, $ctx1);

// 2. Process next batch of marketing campaign sends (marketing.php)
$res2 = @file_get_contents($proto . '://' . $host . '/marketing.php?action=run-batch&key=' . urlencode($CRON_SECRET));

$r1 = $res1 !== false ? json_decode($res1, true) : ['ok' => false, 'error' => 'crm-email.php unreachable'];
$r2 = $res2 !== false ? json_decode($res2, true) : ['ok' => false, 'error' => 'marketing.php unreachable'];

echo json_encode(['ok' => ($r1['ok'] ?? false) || ($r2['ok'] ?? false), 'scheduled_emails' => $r1, 'campaign_sends' => $r2]);
