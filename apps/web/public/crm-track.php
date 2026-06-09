<?php
/**
 * Public open/click tracking for CRM emails.
 *   GET ?e=<emailId>&t=open            -> logs an open, returns a 1x1 GIF
 *   GET ?e=<emailId>&t=click&u=<url>   -> logs a click, redirects to <url>
 * Records are appended to the matching email in leads/emails.ndjson.
 */
$dir = __DIR__ . '/leads';
$file = $dir . '/emails.ndjson';

$id = isset($_GET['e']) ? preg_replace('/[^A-Za-z0-9_\-]/', '', (string) $_GET['e']) : '';
$type = ($_GET['t'] ?? 'open') === 'click' ? 'click' : 'open';
$url = (string) ($_GET['u'] ?? '');

function track_log($file, $id, $type, $url) {
    if ($id === '' || !is_file($file)) return;
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $out = '';
    $entry = ['at' => date('c'), 'ip' => substr((string) ($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45),
              'ua' => substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 200)];
    if ($type === 'click') $entry['url'] = substr($url, 0, 400);
    foreach ($lines as $line) {
        $r = json_decode($line, true);
        if (is_array($r) && ($r['id'] ?? '') === $id) {
            $k = $type === 'click' ? 'clicks' : 'opens';
            if (!isset($r[$k]) || !is_array($r[$k])) $r[$k] = [];
            $r[$k][] = $entry;
            if (empty($r['firstOpenAt']) && $type === 'open') $r['firstOpenAt'] = $entry['at'];
            $out .= json_encode($r) . "\n";
        } else {
            $out .= $line . "\n";
        }
    }
    @file_put_contents($file, $out, LOCK_EX);
}

track_log($file, $id, $type, $url);

if ($type === 'click') {
    // Only redirect to safe absolute http(s) URLs.
    if (filter_var($url, FILTER_VALIDATE_URL) && preg_match('#^https?://#i', $url)) {
        header('Location: ' . $url, true, 302);
    } else {
        header('Location: /', true, 302);
    }
    exit;
}

// 1x1 transparent GIF
header('Content-Type: image/gif');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
echo base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
