<?php
/**
 * CRM email store + sender for the iMigrate CRM (leads/emails.ndjson).
 *
 * Sends from inside a lead profile, stores a copy, and tracks opens/clicks
 * (via crm-track.php). When Microsoft 365 is connected (m365-lib.php present
 * and tokens valid) mail routes through Microsoft Graph; otherwise it falls
 * back to PHP mail() on shared hosting.
 *
 * GATED (admin password):
 *   'send'         -> { ckey, to, subject, html, scheduleAt? } -> send now or schedule
 *   'list'         -> { ok, emails:[ summary ] }      (newest first, no html)
 *   'by'           -> { ckey|email } -> { ok, emails:[ full ] }
 *   'run-scheduled'-> dispatch any due scheduled emails (called by crm-cron.php)
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
$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 400000) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Invalid request']); exit; }
$p = json_decode($raw, true);
if (!is_array($p) || !hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''))) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

$dir = __DIR__ . '/leads';
if (!is_dir($dir)) { @mkdir($dir, 0755, true); @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n"); }
$file = $dir . '/emails.ndjson';

function em_load($file) {
    $rows = [];
    if (is_file($file)) foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $l) { $r = json_decode($l, true); if (is_array($r)) $rows[] = $r; }
    return $rows;
}
function em_save($file, $rows) { $o = ''; foreach ($rows as $r) $o .= json_encode($r) . "\n"; return @file_put_contents($file, $o, LOCK_EX) !== false; }
function em_id() { return 'E-' . date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 6); }
function em_summary($r) { $s = $r; unset($s['html']); $s['opens'] = count($r['opens'] ?? []); $s['clicks'] = count($r['clicks'] ?? []); return $s; }

function em_base() {
    $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'www.imigratesolution.com';
    return $proto . '://' . $host;
}

/* Insert a tracking pixel and wrap http links for click tracking. */
function em_instrument($html, $id) {
    $base = em_base();
    $pixel = '<img src="' . $base . '/crm-track.php?e=' . urlencode($id) . '&t=open" width="1" height="1" alt="" style="display:none">';
    $html = preg_replace_callback('/href="(https?:\/\/[^"]+)"/i', function ($m) use ($base, $id) {
        return 'href="' . $base . '/crm-track.php?e=' . urlencode($id) . '&t=click&u=' . urlencode($m[1]) . '"';
    }, $html);
    if (stripos($html, '</body>') !== false) return str_ireplace('</body>', $pixel . '</body>', $html);
    return $html . $pixel;
}

/* Try Microsoft Graph first; fall back to PHP mail(). Returns 'graph'|'mail'|false. */
function em_dispatch($to, $toName, $subject, $html) {
    if (is_file(__DIR__ . '/m365-lib.php')) {
        require_once __DIR__ . '/m365-lib.php';
        if (function_exists('m365_send_mail') && m365_is_connected()) {
            if (m365_send_mail($to, $subject, $html)) return 'graph';
        }
    }
    $fromDomain = 'imigratesolution.com';
    $fromAddr = 'no-reply@' . $fromDomain;
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= 'From: iMigrate Migration Solutions <' . $fromAddr . ">\r\n";
    $headers .= 'Reply-To: contact@' . $fromDomain . "\r\n";
    $toHeader = $toName !== '' ? ($toName . ' <' . $to . '>') : $to;
    return @mail($toHeader, $subject, $html, $headers, '-f' . $fromAddr) ? 'mail' : false;
}

$action = $p['action'] ?? 'list';
$rows = em_load($file);

if ($action === 'list') {
    usort($rows, fn($a, $b) => strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? ''));
    echo json_encode(['ok' => true, 'emails' => array_map('em_summary', $rows)]);
    exit;
}

if ($action === 'by') {
    $key = trim((string) ($p['key'] ?? $p['ckey'] ?? ''));
    if ($key === '') $key = strtolower(trim((string) ($p['email'] ?? '')));
    $out = array_values(array_filter($rows, fn($r) => ($r['ckey'] ?? '') === $key || strtolower((string) ($r['to'] ?? '')) === $key));
    usort($out, fn($a, $b) => strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? ''));
    echo json_encode(['ok' => true, 'emails' => $out]);
    exit;
}

if ($action === 'send') {
    $to = trim(str_replace(["\r", "\n"], '', (string) ($p['to'] ?? '')));
    $subject = trim(str_replace(["\r", "\n"], '', (string) ($p['subject'] ?? '')));
    $bodyHtml = (string) ($p['html'] ?? '');
    if (!filter_var($to, FILTER_VALIDATE_EMAIL) || $subject === '' || $bodyHtml === '') {
        http_response_code(400); echo json_encode(['ok' => false, 'error' => 'A valid recipient, subject and body are required']); exit;
    }
    $id = em_id();
    $scheduleAt = trim((string) ($p['scheduleAt'] ?? ''));
    $isFuture = $scheduleAt !== '' && strtotime($scheduleAt) !== false && strtotime($scheduleAt) > time();
    $rec = [
        'id' => $id,
        'ckey' => substr((string) ($p['ckey'] ?? ''), 0, 160),
        'to' => $to,
        'toName' => substr((string) ($p['toName'] ?? ''), 0, 120),
        'subject' => substr($subject, 0, 240),
        'html' => substr($bodyHtml, 0, 300000),
        'template' => substr((string) ($p['template'] ?? ''), 0, 60),
        'author' => substr((string) ($p['author'] ?? 'Consultant'), 0, 60),
        'opens' => [], 'clicks' => [],
        'createdAt' => date('c'),
    ];
    if ($isFuture) {
        $rec['status'] = 'scheduled';
        $rec['scheduleAt'] = date('c', strtotime($scheduleAt));
        $rows[] = $rec; em_save($file, $rows);
        echo json_encode(['ok' => true, 'id' => $id, 'status' => 'scheduled', 'scheduleAt' => $rec['scheduleAt']]);
        exit;
    }
    $sendHtml = em_instrument($bodyHtml, $id);
    $via = em_dispatch($to, $rec['toName'], $subject, $sendHtml);
    $rec['status'] = $via ? 'sent' : 'failed';
    $rec['via'] = $via ?: '';
    $rec['sentAt'] = date('c');
    $rows[] = $rec; em_save($file, $rows);
    echo json_encode(['ok' => (bool) $via, 'id' => $id, 'status' => $rec['status'], 'via' => $rec['via'],
        'error' => $via ? null : 'Send failed (mail() may be limited on this host; connect Microsoft 365 for reliable delivery)']);
    exit;
}

if ($action === 'run-scheduled') {
    $now = time(); $sent = 0;
    foreach ($rows as &$r) {
        if (($r['status'] ?? '') !== 'scheduled') continue;
        if (empty($r['scheduleAt']) || strtotime($r['scheduleAt']) > $now) continue;
        $via = em_dispatch($r['to'], $r['toName'] ?? '', $r['subject'], em_instrument($r['html'], $r['id']));
        $r['status'] = $via ? 'sent' : 'failed'; $r['via'] = $via ?: ''; $r['sentAt'] = date('c');
        if ($via) $sent++;
    }
    unset($r);
    em_save($file, $rows);
    echo json_encode(['ok' => true, 'sent' => $sent]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
