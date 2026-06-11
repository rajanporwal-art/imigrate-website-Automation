<?php
/**
 * crm-cases.php — Visa application Cases + Companies for the iMigrate CRM.
 *
 * Layered on top of the existing lead store (does not modify leads). A "client"
 * is a lead who signed up; a Case is a visa application tracked through its own
 * status pipeline; a Company is an employer / sponsor / partner entity. Cases
 * link to a lead via ckey/email so all history stays connected.
 *
 * Gated by $EDIT_PASSWORD. Data lives in the protected, deploy-excluded leads/
 * directory, so deployments never touch it.
 *
 * POST JSON { password, action, ... }
 *   'list'           -> { ok, cases:[...], companies:[...] }
 *   'case-save'      -> { case }   upsert
 *   'case-delete'    -> { id }
 *   'company-save'   -> { company} upsert
 *   'company-delete' -> { id }
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok' => false, 'error' => 'Method not allowed']); exit; }
$p = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($p) || !hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''))) {
    http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Incorrect password']); exit;
}

$dir = __DIR__ . '/leads';
if (!is_dir($dir)) { @mkdir($dir, 0755, true); @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n"); }
$casesF = $dir . '/cases.ndjson';
$compF  = $dir . '/companies.ndjson';

function c_load($f) { $r = []; if (is_file($f)) foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $l) { $x = json_decode($l, true); if (is_array($x)) $r[] = $x; } return $r; }
function c_save($f, $rows) { $o = ''; foreach ($rows as $r) $o .= json_encode($r) . "\n"; return @file_put_contents($f, $o, LOCK_EX) !== false; }
function c_id($pfx) { return $pfx . '-' . date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 5); }
function c_str($v, $n = 200) { return substr(trim((string) $v), 0, $n); }

$action = (string) ($p['action'] ?? 'list');

if ($action === 'list') {
    echo json_encode(['ok' => true, 'cases' => c_load($casesF), 'companies' => c_load($compF)]);
    exit;
}

if ($action === 'case-save') {
    $in = is_array($p['case'] ?? null) ? $p['case'] : [];
    $rows = c_load($casesF);
    $id = (string) ($in['id'] ?? '');
    $rec = [
        'id' => $id ?: c_id('CASE'),
        'ckey' => c_str($in['ckey'] ?? '', 160),
        'clientName' => c_str($in['clientName'] ?? '', 120),
        'email' => strtolower(c_str($in['email'] ?? '', 160)),
        'country' => c_str($in['country'] ?? '', 60),
        'visaType' => c_str($in['visaType'] ?? '', 120),
        'companyId' => c_str($in['companyId'] ?? '', 60),
        'status' => c_str($in['status'] ?? 'New Case', 40),
        'targetDate' => c_str($in['targetDate'] ?? '', 20),
        'fee' => c_str($in['fee'] ?? '', 40),
        'notes' => c_str($in['notes'] ?? '', 4000),
        'updatedAt' => date('c'),
    ];
    $idx = null; foreach ($rows as $i => $r) if (($r['id'] ?? '') === $id) $idx = $i;
    if ($idx === null) { $rec['openedAt'] = date('c'); $rows[] = $rec; }
    else { $rec['openedAt'] = $rows[$idx]['openedAt'] ?? date('c'); $rows[$idx] = $rec; }
    c_save($casesF, $rows);
    echo json_encode(['ok' => true, 'id' => $rec['id']]);
    exit;
}

if ($action === 'case-delete') {
    $rows = array_values(array_filter(c_load($casesF), fn($r) => ($r['id'] ?? '') !== (string) ($p['id'] ?? '')));
    c_save($casesF, $rows);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'company-save') {
    $in = is_array($p['company'] ?? null) ? $p['company'] : [];
    $rows = c_load($compF);
    $id = (string) ($in['id'] ?? '');
    $rec = [
        'id' => $id ?: c_id('CO'),
        'name' => c_str($in['name'] ?? '', 140),
        'type' => c_str($in['type'] ?? 'Employer', 40),
        'country' => c_str($in['country'] ?? '', 60),
        'contactName' => c_str($in['contactName'] ?? '', 120),
        'contactEmail' => strtolower(c_str($in['contactEmail'] ?? '', 160)),
        'phone' => c_str($in['phone'] ?? '', 60),
        'notes' => c_str($in['notes'] ?? '', 2000),
        'updatedAt' => date('c'),
    ];
    if ($rec['name'] === '') { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Company name required']); exit; }
    $idx = null; foreach ($rows as $i => $r) if (($r['id'] ?? '') === $id) $idx = $i;
    if ($idx === null) $rows[] = $rec; else $rows[$idx] = $rec;
    c_save($compF, $rows);
    echo json_encode(['ok' => true, 'id' => $rec['id']]);
    exit;
}

if ($action === 'company-delete') {
    $rows = array_values(array_filter(c_load($compF), fn($r) => ($r['id'] ?? '') !== (string) ($p['id'] ?? '')));
    c_save($compF, $rows);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
