<?php
/**
 * marketing.php — Email campaign management for the iMigrate Marketing Hub.
 *
 * Campaigns are stored in leads/campaigns.json (deploy-excluded). Recipients
 * are resolved from the live leads store at send time using a segment rule.
 * Sending is batched: the cron fires this file's 'run-batch' action to send
 * up to 20 emails per run, avoiding shared-hosting timeouts.
 *
 * GATED (admin password):
 *   campaign.list    -> { campaigns:[...] }
 *   campaign.save    -> upsert campaign (id optional)
 *   campaign.delete  -> { id }
 *   campaign.preview -> { count, sample:[{name,email}] } based on segment rule
 *   campaign.send    -> queue a campaign for sending (status=queued|scheduled)
 *   campaign.cancel  -> cancel queued/scheduled campaign
 *   stats            -> { sent, opened, clicked, campaigns:[top5] }
 *   run-batch        -> (cron) process next batch of queued sends (no auth via key)
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }
if (!isset($CRON_SECRET))   { $CRON_SECRET   = ''; }

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

/* Allow cron key via GET for run-batch */
$isCronBatch = false;
if ($method === 'GET' && ($_GET['action'] ?? '') === 'run-batch') {
    $key = (string) ($_GET['key'] ?? '');
    if ($CRON_SECRET === '' || !hash_equals($CRON_SECRET, $key)) {
        http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Forbidden']); exit;
    }
    $isCronBatch = true;
}

if (!$isCronBatch) {
    if ($method !== 'POST') { http_response_code(405); echo json_encode(['ok' => false, 'error' => 'Method not allowed']); exit; }
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > 500000) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Invalid request']); exit; }
    $p = json_decode($raw, true);
    if (!is_array($p) || !hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''))) {
        http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Incorrect password']); exit;
    }
}

$leadsDir  = __DIR__ . '/leads';
if (!is_dir($leadsDir)) { @mkdir($leadsDir, 0755, true); @file_put_contents($leadsDir . '/.htaccess', "Require all denied\nDeny from all\n"); }
$campFile  = $leadsDir . '/campaigns.json';
$emailFile = $leadsDir . '/emails.ndjson';

/* ---- helpers ---- */
function mc_load($f) { if (is_file($f)) { $d = json_decode((string) file_get_contents($f), true); return is_array($d) ? $d : []; } return []; }
function mc_save($f, $d) { return @file_put_contents($f, json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false; }
function mc_id() { return 'CAM-' . date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 5); }
function mc_str($v, $n = 200) { return substr(trim((string) $v), 0, $n); }

function mc_leads() {
    $f = __DIR__ . '/leads/leads.ndjson';
    $rows = [];
    if (!is_file($f)) return $rows;
    foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $l) {
        $r = json_decode($l, true);
        if (is_array($r) && !empty($r['email'])) $rows[] = $r;
    }
    return $rows;
}

function mc_segment($leads, $seg) {
    if (!$seg || $seg === 'all') return $leads;
    [$type, $val] = array_pad(explode(':', $seg, 2), 2, '');
    if ($type === 'stage')   return array_values(array_filter($leads, fn($l) => strtolower($l['_stage'] ?? $l['stage'] ?? '') === strtolower($val)));
    if ($type === 'country') return array_values(array_filter($leads, fn($l) => strtolower($l['country'] ?? '') === strtolower($val)));
    if ($type === 'status')  return array_values(array_filter($leads, fn($l) => strtolower($l['status'] ?? '') === strtolower($val)));
    return $leads;
}

function mc_email_stats($emailFile) {
    $sent = $opened = $clicked = 0;
    if (!is_file($emailFile)) return compact('sent','opened','clicked');
    foreach (file($emailFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $l) {
        $r = json_decode($l, true); if (!is_array($r)) continue;
        if (in_array($r['status'] ?? '', ['sent','delivered'])) $sent++;
        if (!empty($r['opens']))  $opened++;
        if (!empty($r['clicks'])) $clicked++;
    }
    return compact('sent','opened','clicked');
}

/* Microsoft Graph / mail dispatch (copied pattern from crm-email.php) */
function mc_dispatch($to, $toName, $subject, $html) {
    if (is_file(__DIR__ . '/m365-lib.php')) {
        require_once __DIR__ . '/m365-lib.php';
        if (function_exists('m365_send_mail') && m365_is_connected()) {
            if (m365_send_mail($to, $subject, $html)) return 'graph';
        }
    }
    $fromAddr  = 'no-reply@imigratesolution.com';
    $headers   = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n";
    $headers  .= 'From: iMigrate Migration Solutions <' . $fromAddr . ">\r\nReply-To: contact@imigratesolution.com\r\n";
    $toHeader  = $toName !== '' ? ($toName . ' <' . $to . '>') : $to;
    return @mail($toHeader, $subject, $html, $headers, '-f' . $fromAddr) ? 'mail' : false;
}

function mc_instrument($html, $id) {
    $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host  = $_SERVER['HTTP_HOST'] ?? 'www.imigratesolution.com';
    $base  = $proto . '://' . $host;
    $pixel = '<img src="' . $base . '/crm-track.php?e=' . urlencode($id) . '&t=open" width="1" height="1" alt="" style="display:none">';
    $html  = preg_replace_callback('/href="(https?:\/\/[^"]+)"/i', fn($m) =>
        'href="' . $base . '/crm-track.php?e=' . urlencode($id) . '&t=click&u=' . urlencode($m[1]) . '"', $html);
    return stripos($html, '</body>') !== false ? str_ireplace('</body>', $pixel . '</body>', $html) : $html . $pixel;
}

function mc_personalise($html, $lead) {
    $name = trim(($lead['firstName'] ?? '') . ' ' . ($lead['lastName'] ?? '')) ?: ($lead['name'] ?? 'there');
    $map  = [
        '{{name}}'       => htmlspecialchars($name, ENT_QUOTES),
        '{{first_name}}' => htmlspecialchars($lead['firstName'] ?? $name, ENT_QUOTES),
        '{{email}}'      => htmlspecialchars($lead['email'] ?? '', ENT_QUOTES),
        '{{country}}'    => htmlspecialchars($lead['country'] ?? '', ENT_QUOTES),
        '{{occupation}}' => htmlspecialchars($lead['occupation'] ?? '', ENT_QUOTES),
        '{{stage}}'      => htmlspecialchars($lead['_stage'] ?? $lead['stage'] ?? '', ENT_QUOTES),
    ];
    return strtr($html, $map);
}

function mc_append_email($emailFile, $rec) {
    @file_put_contents($emailFile, json_encode($rec) . "\n", FILE_APPEND | LOCK_EX);
}

/* ---- run-batch (cron) ---- */
if ($isCronBatch || (isset($p) && ($p['action'] ?? '') === 'run-batch')) {
    $camps = mc_load($campFile);
    $now   = time();
    $totalSent = 0;

    foreach ($camps as &$camp) {
        $status = $camp['status'] ?? 'draft';
        if ($status === 'scheduled' && !empty($camp['scheduleAt']) && strtotime($camp['scheduleAt']) <= $now) {
            $camp['status'] = $status = 'queued';
        }
        if ($status !== 'queued' && $status !== 'sending') continue;

        $camp['status'] = 'sending';
        $leads = mc_segment(mc_leads(), $camp['segment'] ?? 'all');
        $sent  = (int) ($camp['sent']  ?? 0);
        $failed= (int) ($camp['failed']?? 0);
        $total = count($leads);
        $batch = 0;

        for ($i = $sent + $failed; $i < $total && $batch < 20; $i++, $batch++) {
            $lead = $leads[$i];
            $email = strtolower(trim($lead['email'] ?? ''));
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { $failed++; continue; }
            $name = trim(($lead['firstName'] ?? '') . ' ' . ($lead['lastName'] ?? '')) ?: ($lead['name'] ?? '');
            $subj = $camp['subject'] ?? '';
            $html = mc_personalise($camp['html'] ?? '', $lead);
            $eId  = 'CE-' . date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 5);
            $via  = mc_dispatch($email, $name, $subj, mc_instrument($html, $eId));
            mc_append_email($emailFile, [
                'id' => $eId, 'ckey' => $lead['email'] ?? '', 'to' => $email, 'toName' => $name,
                'subject' => $subj, 'html' => '', 'template' => $camp['id'] ?? '', 'author' => 'Campaign',
                'opens' => [], 'clicks' => [], 'status' => $via ? 'sent' : 'failed',
                'via' => $via ?: '', 'sentAt' => date('c'), 'createdAt' => date('c'),
                'campaignId' => $camp['id'] ?? '',
            ]);
            if ($via) { $sent++; $totalSent++; } else { $failed++; }
        }

        $camp['sent']   = $sent;
        $camp['failed'] = $failed;

        if ($sent + $failed >= $total) {
            $camp['status'] = 'sent';
            $camp['sentAt'] = date('c');
        }
    }
    unset($camp);
    mc_save($campFile, $camps);
    echo json_encode(['ok' => true, 'sent' => $totalSent]);
    exit;
}

$action = (string) ($p['action'] ?? 'campaign.list');

/* ---- campaign.list ---- */
if ($action === 'campaign.list') {
    $camps = mc_load($campFile);
    usort($camps, fn($a, $b) => strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? ''));
    echo json_encode(['ok' => true, 'campaigns' => $camps]);
    exit;
}

/* ---- campaign.save ---- */
if ($action === 'campaign.save') {
    $in    = is_array($p['campaign'] ?? null) ? $p['campaign'] : [];
    $camps = mc_load($campFile);
    $id    = mc_str($in['id'] ?? '', 60);
    $rec   = [
        'id'         => $id ?: mc_id(),
        'name'       => mc_str($in['name'] ?? 'Untitled', 200),
        'subject'    => mc_str($in['subject'] ?? '', 240),
        'html'       => substr((string) ($in['html'] ?? ''), 0, 300000),
        'segment'    => mc_str($in['segment'] ?? 'all', 80),
        'status'     => 'draft',
        'scheduleAt' => mc_str($in['scheduleAt'] ?? '', 30),
        'sent'       => 0, 'failed' => 0, 'totalRecipients' => 0,
        'author'     => mc_str($p['author'] ?? 'Admin', 80),
        'createdAt'  => date('c'),
        'updatedAt'  => date('c'),
    ];
    $idx = null; foreach ($camps as $i => $c) if (($c['id'] ?? '') === $id) $idx = $i;
    if ($idx === null) {
        $camps[] = $rec;
    } else {
        $rec['status'] = $camps[$idx]['status'] ?? 'draft';
        $rec['sent']   = $camps[$idx]['sent']   ?? 0;
        $rec['failed'] = $camps[$idx]['failed'] ?? 0;
        $rec['totalRecipients'] = $camps[$idx]['totalRecipients'] ?? 0;
        $rec['createdAt'] = $camps[$idx]['createdAt'] ?? $rec['createdAt'];
        $camps[$idx] = $rec;
    }
    mc_save($campFile, $camps);
    echo json_encode(['ok' => true, 'id' => $rec['id']]);
    exit;
}

/* ---- campaign.delete ---- */
if ($action === 'campaign.delete') {
    $id = mc_str($p['id'] ?? '', 60);
    $camps = array_values(array_filter(mc_load($campFile), fn($c) => ($c['id'] ?? '') !== $id));
    mc_save($campFile, $camps);
    echo json_encode(['ok' => true]);
    exit;
}

/* ---- campaign.preview ---- */
if ($action === 'campaign.preview') {
    $seg   = mc_str($p['segment'] ?? 'all', 80);
    $leads = mc_segment(mc_leads(), $seg);
    $sample = array_slice(array_map(fn($l) => [
        'name'  => trim(($l['firstName'] ?? '') . ' ' . ($l['lastName'] ?? '')) ?: ($l['name'] ?? $l['email'] ?? ''),
        'email' => $l['email'] ?? '',
    ], $leads), 0, 5);
    echo json_encode(['ok' => true, 'count' => count($leads), 'sample' => $sample]);
    exit;
}

/* ---- campaign.send ---- */
if ($action === 'campaign.send') {
    $id    = mc_str($p['id'] ?? '', 60);
    $camps = mc_load($campFile);
    $idx   = null; foreach ($camps as $i => $c) if (($c['id'] ?? '') === $id) $idx = $i;
    if ($idx === null) { http_response_code(404); echo json_encode(['ok' => false, 'error' => 'Campaign not found']); exit; }

    $camp = $camps[$idx];
    if (in_array($camp['status'] ?? '', ['sending', 'sent'])) {
        echo json_encode(['ok' => false, 'error' => 'Campaign already sent or sending']); exit;
    }
    $leads = mc_segment(mc_leads(), $camp['segment'] ?? 'all');
    $scheduleAt = mc_str($p['scheduleAt'] ?? $camp['scheduleAt'] ?? '', 30);
    $isFuture = $scheduleAt !== '' && strtotime($scheduleAt) > time();
    $camps[$idx]['totalRecipients'] = count($leads);
    $camps[$idx]['sent']   = 0;
    $camps[$idx]['failed'] = 0;
    $camps[$idx]['status'] = $isFuture ? 'scheduled' : 'queued';
    if ($isFuture) $camps[$idx]['scheduleAt'] = date('c', strtotime($scheduleAt));
    mc_save($campFile, $camps);
    echo json_encode(['ok' => true, 'queued' => count($leads), 'status' => $camps[$idx]['status']]);
    exit;
}

/* ---- campaign.cancel ---- */
if ($action === 'campaign.cancel') {
    $id    = mc_str($p['id'] ?? '', 60);
    $camps = mc_load($campFile);
    foreach ($camps as &$c) {
        if (($c['id'] ?? '') === $id && in_array($c['status'] ?? '', ['queued', 'scheduled'])) {
            $c['status'] = 'cancelled';
        }
    }
    unset($c);
    mc_save($campFile, $camps);
    echo json_encode(['ok' => true]);
    exit;
}

/* ---- stats ---- */
if ($action === 'stats') {
    $es = mc_email_stats($emailFile);
    $camps = mc_load($campFile);
    usort($camps, fn($a, $b) => strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? ''));
    $top5 = array_slice(array_values(array_filter($camps, fn($c) => in_array($c['status'] ?? '', ['sent','sending']))), 0, 5);
    // Augment each campaign with email stats
    $campStats = array_map(function($c) use ($emailFile) {
        $id = $c['id'] ?? '';
        $opens = $clicks = 0;
        if ($id && is_file($emailFile)) {
            foreach (file($emailFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $l) {
                $r = json_decode($l, true); if (!is_array($r)) continue;
                if (($r['campaignId'] ?? '') !== $id) continue;
                if (!empty($r['opens']))  $opens++;
                if (!empty($r['clicks'])) $clicks++;
            }
        }
        return array_merge($c, ['emailOpens' => $opens, 'emailClicks' => $clicks]);
    }, $top5);
    echo json_encode(['ok' => true,
        'emailsSent'    => $es['sent'],
        'emailsOpened'  => $es['opened'],
        'emailsClicked' => $es['clicked'],
        'campaigns'     => $campStats,
    ]);
    exit;
}

/* ---- lead-summary (for analytics view) ---- */
if ($action === 'lead-summary') {
    $leads = mc_leads();
    echo json_encode(['ok' => true, 'leads' => $leads]);
    exit;
}

/* ---- lead-segments (for UI dropdowns) ---- */
if ($action === 'segments') {
    $leads = mc_leads();
    $stages    = array_unique(array_filter(array_map(fn($l) => $l['_stage'] ?? $l['stage'] ?? '', $leads)));
    $countries = array_unique(array_filter(array_map(fn($l) => $l['country'] ?? '', $leads)));
    sort($stages); sort($countries);
    echo json_encode(['ok' => true, 'stages' => array_values($stages), 'countries' => array_values($countries), 'total' => count($leads)]);
    exit;
}

/* ================================================================
   GENERIC STORE — social posts, email sequences, ad campaigns,
   WhatsApp templates (all keyed by $action prefix).
   ================================================================ */
$STORES = [
    'social'  => $leadsDir . '/social-posts.json',
    'seq'     => $leadsDir . '/email-sequences.json',
    'ads'     => $leadsDir . '/ad-campaigns.json',
    'wa'      => $leadsDir . '/wa-templates.json',
];

function gstore_load($f) { if (is_file($f)) { $d = json_decode((string) file_get_contents($f), true); return is_array($d) ? $d : []; } return []; }
function gstore_save($f, $d) { return @file_put_contents($f, json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false; }
function gstore_id($pfx) { return $pfx . '-' . date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 5); }

foreach ($STORES as $prefix => $storeFile) {
    if ($action === $prefix . '.list') {
        $rows = gstore_load($storeFile);
        usort($rows, fn($a, $b) => strcmp($b['updatedAt'] ?? '', $a['updatedAt'] ?? ''));
        echo json_encode(['ok' => true, 'items' => $rows]); exit;
    }
    if ($action === $prefix . '.save') {
        $in   = is_array($p['item'] ?? null) ? $p['item'] : [];
        $rows = gstore_load($storeFile);
        $id   = mc_str($in['id'] ?? '', 60);
        $in['id']        = $id ?: gstore_id(strtoupper($prefix));
        $in['updatedAt'] = date('c');
        if (!$id) $in['createdAt'] = date('c');
        $in['author'] = mc_str($p['author'] ?? 'Admin', 80);
        // Sanitise strings up to 8000 chars, arrays preserved
        foreach ($in as $k => $v) { if (is_string($v)) $in[$k] = substr($v, 0, 8000); }
        $idx = null; foreach ($rows as $i => $r) if (($r['id'] ?? '') === $id) $idx = $i;
        if ($idx === null) { if ($id) $in['createdAt'] = $in['createdAt'] ?? date('c'); $rows[] = $in; }
        else { $in['createdAt'] = $rows[$idx]['createdAt'] ?? date('c'); $rows[$idx] = $in; }
        gstore_save($storeFile, $rows);
        echo json_encode(['ok' => true, 'id' => $in['id']]); exit;
    }
    if ($action === $prefix . '.delete') {
        $id = mc_str($p['id'] ?? '', 60);
        $rows = array_values(array_filter(gstore_load($storeFile), fn($r) => ($r['id'] ?? '') !== $id));
        gstore_save($storeFile, $rows);
        echo json_encode(['ok' => true]); exit;
    }
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
