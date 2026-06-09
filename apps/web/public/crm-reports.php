<?php
/**
 * AI assessment report store for the iMigrate CRM (leads/reports.ndjson).
 *
 * Reports are persisted with full HTML + summary so consultants can view,
 * preview, download (PDF via print), email, and regenerate them later, and so
 * historical versions are kept (append-only, one record per generation).
 *
 * PUBLIC action (no password — like lead-capture.php), called by the website
 * assessment when a report is generated:
 *   'capture' -> { name, email, occupation, anzsco, points, visas, html,
 *                  source, eligibilityStatus } -> stores v1+ for that contact
 *
 * GATED actions (require admin password):
 *   'list'     -> { ok, reports:[ summary... ] }      (no html, newest first)
 *   'by'       -> { key|email } -> { ok, reports:[ full incl html ] }
 *   'get'      -> { id }        -> { ok, report }      (incl html)
 *   'save'     -> { ... , html } -> stores a new version (Regenerate)
 *   'add-note' -> { id, note, author? }
 *   'delete'   -> { id }
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
if ($raw === false || strlen($raw) > 400000) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid request']);
    exit;
}
$p = json_decode($raw, true);
if (!is_array($p)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Malformed request']);
    exit;
}

$dir = __DIR__ . '/leads';
if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
    @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
}
$file = $dir . '/reports.ndjson';

function rpt_load($file) {
    $rows = [];
    if (is_file($file)) {
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $r = json_decode($line, true);
            if (is_array($r)) $rows[] = $r;
        }
    }
    return $rows;
}
function rpt_save($file, $rows) {
    $out = '';
    foreach ($rows as $r) $out .= json_encode($r) . "\n";
    return @file_put_contents($file, $out, LOCK_EX) !== false;
}
function rpt_id() { return 'R-' . date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 6); }
function rpt_ckey($email, $fallbackId) {
    $email = strtolower(trim((string) $email));
    return $email !== '' ? $email : 'id:' . $fallbackId;
}
function rpt_summary($r) {
    $s = $r;
    unset($s['html']);
    $s['hasHtml'] = !empty($r['html']);
    return $s;
}

$action = $p['action'] ?? 'capture';
$rows = rpt_load($file);

/* ---------- PUBLIC: capture a freshly generated report ---------- */
if ($action === 'capture') {
    if (!empty($p['website'])) { echo json_encode(['ok' => true]); exit; } // honeypot
    $html = (string) ($p['html'] ?? '');
    $email = (string) ($p['email'] ?? '');
    if ($html === '' || (trim($email) === '' && trim((string) ($p['name'] ?? '')) === '')) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Missing report data']);
        exit;
    }
    $id = rpt_id();
    $ckey = rpt_ckey($email, $id);
    $version = 1;
    foreach ($rows as $r) { if (($r['ckey'] ?? '') === $ckey) $version++; }
    $rec = [
        'id' => $id,
        'ckey' => $ckey,
        'leadEmail' => strtolower(trim($email)),
        'name' => substr((string) ($p['name'] ?? ''), 0, 120),
        'occupation' => substr((string) ($p['occupation'] ?? ''), 0, 160),
        'anzsco' => substr((string) ($p['anzsco'] ?? ''), 0, 20),
        'points' => substr((string) ($p['points'] ?? ''), 0, 10),
        'visas' => substr((string) ($p['visas'] ?? ''), 0, 200),
        'eligibilityStatus' => substr((string) ($p['eligibilityStatus'] ?? ''), 0, 240),
        'source' => substr((string) ($p['source'] ?? 'Australia Free Eligibility Check'), 0, 80),
        'version' => $version,
        'origin' => 'auto',
        'html' => substr($html, 0, 300000),
        'notes' => [],
        'at' => date('c'),
    ];
    $rows[] = $rec;
    rpt_save($file, $rows);
    echo json_encode(['ok' => true, 'id' => $id, 'version' => $version]);
    exit;
}

/* ---------- GATED actions ---------- */
if (!hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''))) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}
$author = substr(trim((string) ($p['author'] ?? 'Consultant')), 0, 60);
if ($author === '') $author = 'Consultant';

if ($action === 'list') {
    usort($rows, function ($a, $b) { return strcmp($b['at'] ?? '', $a['at'] ?? ''); });
    echo json_encode(['ok' => true, 'reports' => array_map('rpt_summary', $rows)]);
    exit;
}

if ($action === 'by') {
    $key = trim((string) ($p['key'] ?? ''));
    if ($key === '') $key = strtolower(trim((string) ($p['email'] ?? '')));
    $out = array_values(array_filter($rows, function ($r) use ($key) {
        return ($r['ckey'] ?? '') === $key || strtolower((string) ($r['leadEmail'] ?? '')) === $key;
    }));
    usort($out, function ($a, $b) { return strcmp($b['at'] ?? '', $a['at'] ?? ''); });
    echo json_encode(['ok' => true, 'reports' => $out]);
    exit;
}

if ($action === 'get') {
    $id = (string) ($p['id'] ?? '');
    foreach ($rows as $r) {
        if (($r['id'] ?? '') === $id) { echo json_encode(['ok' => true, 'report' => $r]); exit; }
    }
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'Report not found']);
    exit;
}

if ($action === 'save') {
    $html = (string) ($p['html'] ?? '');
    if ($html === '') { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Missing html']); exit; }
    $email = (string) ($p['email'] ?? '');
    $id = rpt_id();
    $ckey = trim((string) ($p['key'] ?? '')) ?: rpt_ckey($email, $id);
    $version = 1;
    foreach ($rows as $r) { if (($r['ckey'] ?? '') === $ckey) $version++; }
    $rec = [
        'id' => $id,
        'ckey' => $ckey,
        'leadEmail' => strtolower(trim($email)),
        'name' => substr((string) ($p['name'] ?? ''), 0, 120),
        'occupation' => substr((string) ($p['occupation'] ?? ''), 0, 160),
        'anzsco' => substr((string) ($p['anzsco'] ?? ''), 0, 20),
        'points' => substr((string) ($p['points'] ?? ''), 0, 10),
        'visas' => substr((string) ($p['visas'] ?? ''), 0, 200),
        'eligibilityStatus' => substr((string) ($p['eligibilityStatus'] ?? ''), 0, 240),
        'source' => substr((string) ($p['source'] ?? 'CRM regenerate'), 0, 80),
        'version' => $version,
        'origin' => 'regenerated',
        'author' => $author,
        'html' => substr($html, 0, 300000),
        'notes' => [],
        'at' => date('c'),
    ];
    $rows[] = $rec;
    rpt_save($file, $rows);
    echo json_encode(['ok' => true, 'id' => $id, 'version' => $version]);
    exit;
}

if ($action === 'add-note') {
    $id = (string) ($p['id'] ?? '');
    $note = trim(substr((string) ($p['note'] ?? ''), 0, 4000));
    $found = false;
    foreach ($rows as &$r) {
        if (($r['id'] ?? '') === $id) {
            if (!isset($r['notes']) || !is_array($r['notes'])) $r['notes'] = [];
            if ($note !== '') $r['notes'][] = ['text' => $note, 'author' => $author, 'at' => date('c')];
            $found = true; break;
        }
    }
    unset($r);
    if (!$found) { http_response_code(404); echo json_encode(['ok' => false, 'error' => 'Report not found']); exit; }
    rpt_save($file, $rows);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'delete') {
    $id = (string) ($p['id'] ?? '');
    $rows = array_values(array_filter($rows, function ($r) use ($id) { return ($r['id'] ?? '') !== $id; }));
    rpt_save($file, $rows);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
