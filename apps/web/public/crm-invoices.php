<?php
/**
 * crm-invoices.php — Invoices & Payments for the iMigrate CRM.
 *
 * Non-destructive, layered on the existing lead store. An invoice links to a
 * lead (ckey/email) and optionally a visa case (caseId). Totals are computed
 * server-side from line items; payments are recorded against an invoice and the
 * status is derived (Paid / Partially Paid / etc). Data lives in the protected,
 * deploy-excluded leads/ directory.
 *
 * POST JSON { password, action, ... }
 *   'list'           -> { ok, invoices:[ ...with amountPaid ] }
 *   'invoice-save'   -> { invoice }  upsert (assigns number when new)
 *   'invoice-delete' -> { id }
 *   'payment-add'    -> { invoiceId, payment:{amount,date,method,ref} }
 *   'payment-delete' -> { invoiceId, paymentId }
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
$invF = $dir . '/invoices.ndjson';

function i_load($f) { $r = []; if (is_file($f)) foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $l) { $x = json_decode($l, true); if (is_array($x)) $r[] = $x; } return $r; }
function i_save($f, $rows) { $o = ''; foreach ($rows as $r) $o .= json_encode($r) . "\n"; return @file_put_contents($f, $o, LOCK_EX) !== false; }
function i_id() { return 'INV-' . date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 5); }
function i_str($v, $n = 200) { return substr(trim((string) $v), 0, $n); }
function i_num($v) { return round((float) preg_replace('/[^0-9.\-]/', '', (string) $v), 2); }
function i_amount_paid($inv) { $s = 0; foreach (($inv['payments'] ?? []) as $pay) $s += (float) ($pay['amount'] ?? 0); return round($s, 2); }
function i_total($inv) { $s = 0; foreach (($inv['items'] ?? []) as $it) $s += (float) ($it['amount'] ?? 0); return round($s, 2); }
function i_status($inv) {
    $total = i_total($inv); $paid = i_amount_paid($inv);
    if ($total > 0 && $paid >= $total) return 'Paid';
    if ($paid > 0 && $paid < $total) return 'Partially Paid';
    $manual = $inv['status'] ?? 'Draft';
    if (in_array($manual, ['Cancelled', 'Draft', 'Sent'], true)) {
        if ($manual === 'Sent' && !empty($inv['dueDate']) && strtotime($inv['dueDate']) < strtotime('today')) return 'Overdue';
        return $manual;
    }
    return 'Sent';
}
function i_next_number($rows) {
    $max = 0;
    foreach ($rows as $r) { if (preg_match('/(\d+)$/', (string) ($r['number'] ?? ''), $m)) { $n = (int) $m[1]; if ($n > $max) $max = $n; } }
    return 'INV-' . str_pad((string) ($max + 1), 4, '0', STR_PAD_LEFT);
}
function i_public($inv) {
    $inv['amountPaid'] = i_amount_paid($inv);
    $inv['total'] = i_total($inv);
    $inv['derivedStatus'] = i_status($inv);
    return $inv;
}

$action = (string) ($p['action'] ?? 'list');

if ($action === 'list') {
    $rows = array_map('i_public', i_load($invF));
    usort($rows, fn($a, $b) => strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? ''));
    echo json_encode(['ok' => true, 'invoices' => $rows]);
    exit;
}

if ($action === 'invoice-save') {
    $in = is_array($p['invoice'] ?? null) ? $p['invoice'] : [];
    $rows = i_load($invF);
    $id = (string) ($in['id'] ?? '');
    $items = [];
    foreach ((array) ($in['items'] ?? []) as $it) { $d = i_str($it['desc'] ?? '', 200); $a = i_num($it['amount'] ?? 0); if ($d !== '' || $a != 0) $items[] = ['desc' => $d, 'amount' => $a]; }
    $idx = null; foreach ($rows as $i => $r) if (($r['id'] ?? '') === $id) $idx = $i;
    $base = $idx !== null ? $rows[$idx] : [];
    $rec = array_merge($base, [
        'id' => $id ?: i_id(),
        'number' => $base['number'] ?? i_next_number($rows),
        'ckey' => i_str($in['ckey'] ?? ($base['ckey'] ?? ''), 160),
        'clientName' => i_str($in['clientName'] ?? ($base['clientName'] ?? ''), 120),
        'email' => strtolower(i_str($in['email'] ?? ($base['email'] ?? ''), 160)),
        'caseId' => i_str($in['caseId'] ?? ($base['caseId'] ?? ''), 60),
        'currency' => i_str($in['currency'] ?? ($base['currency'] ?? 'RM'), 8) ?: 'RM',
        'items' => $items,
        'status' => i_str($in['status'] ?? ($base['status'] ?? 'Draft'), 30),
        'issueDate' => i_str($in['issueDate'] ?? ($base['issueDate'] ?? date('Y-m-d')), 20),
        'dueDate' => i_str($in['dueDate'] ?? ($base['dueDate'] ?? ''), 20),
        'notes' => i_str($in['notes'] ?? ($base['notes'] ?? ''), 4000),
        'payments' => $base['payments'] ?? [],
        'updatedAt' => date('c'),
    ]);
    if ($idx === null) { $rec['createdAt'] = date('c'); $rows[] = $rec; } else { $rec['createdAt'] = $base['createdAt'] ?? date('c'); $rows[$idx] = $rec; }
    i_save($invF, $rows);
    echo json_encode(['ok' => true, 'invoice' => i_public($rec)]);
    exit;
}

if ($action === 'invoice-delete') {
    $rows = array_values(array_filter(i_load($invF), fn($r) => ($r['id'] ?? '') !== (string) ($p['id'] ?? '')));
    i_save($invF, $rows);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'payment-add') {
    $rows = i_load($invF);
    $iid = (string) ($p['invoiceId'] ?? '');
    $pay = is_array($p['payment'] ?? null) ? $p['payment'] : [];
    $amt = i_num($pay['amount'] ?? 0);
    if ($amt <= 0) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Payment amount must be positive']); exit; }
    $idx = null; foreach ($rows as $i => $r) if (($r['id'] ?? '') === $iid) $idx = $i;
    if ($idx === null) { http_response_code(404); echo json_encode(['ok' => false, 'error' => 'Invoice not found']); exit; }
    $rows[$idx]['payments'] = $rows[$idx]['payments'] ?? [];
    $rows[$idx]['payments'][] = ['id' => 'PAY-' . substr(md5(uniqid('', true)), 0, 8), 'amount' => $amt, 'date' => i_str($pay['date'] ?? date('Y-m-d'), 20), 'method' => i_str($pay['method'] ?? 'Bank Transfer', 40), 'ref' => i_str($pay['ref'] ?? '', 80), 'at' => date('c')];
    $rows[$idx]['updatedAt'] = date('c');
    $nowPaid = i_amount_paid($rows[$idx]) >= i_total($rows[$idx]) && i_total($rows[$idx]) > 0;
    i_save($invF, $rows);
    echo json_encode(['ok' => true, 'invoice' => i_public($rows[$idx]), 'nowPaid' => $nowPaid]);
    exit;
}

if ($action === 'payment-delete') {
    $rows = i_load($invF);
    $iid = (string) ($p['invoiceId'] ?? ''); $pid = (string) ($p['paymentId'] ?? '');
    foreach ($rows as &$r) { if (($r['id'] ?? '') === $iid) { $r['payments'] = array_values(array_filter($r['payments'] ?? [], fn($x) => ($x['id'] ?? '') !== $pid)); $r['updatedAt'] = date('c'); } }
    unset($r);
    i_save($invF, $rows);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
