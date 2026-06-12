<?php
/**
 * CRM document attachments (leads/docs/ + leads/docs.ndjson).
 *
 * Files are tied to a lead (ckey) and stored in a web-protected folder.
 * Supports PDF, DOCX, XLSX, JPG, PNG up to 10 MB.
 *
 * UPLOAD (multipart/form-data): fields password, ckey, leadEmail, file=<binary>
 * JSON (application/json) { password, action }:
 *   'list'     -> { key|ckey } -> { ok, docs:[...] }
 *   'delete'   -> { id }       -> removes record + file
 *   'download' -> { id }       -> streams the file (attachment)
 */
@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }

$dir = __DIR__ . '/leads';
$docsDir = $dir . '/docs';
$metaFile = $dir . '/docs.ndjson';
if (!is_dir($docsDir)) { @mkdir($docsDir, 0755, true); @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n"); }

function d_load($f) { $r = []; if (is_file($f)) foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $l) { $x = json_decode($l, true); if (is_array($x)) $r[] = $x; } return $r; }
function d_save($f, $rows) { $o = ''; foreach ($rows as $x) $o .= json_encode($x) . "\n"; return @file_put_contents($f, $o, LOCK_EX) !== false; }
function d_json($a) { header('Content-Type: application/json; charset=utf-8'); echo json_encode($a); exit; }

$ALLOWED = [
    'pdf' => 'application/pdf',
    'doc' => 'application/msword',
    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls' => 'application/vnd.ms-excel',
    'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png',
];

/* ---------- multipart upload ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    if (!hash_equals($EDIT_PASSWORD, (string) ($_POST['password'] ?? ''))) { http_response_code(403); d_json(['ok' => false, 'error' => 'Incorrect password']); }
    $f = $_FILES['file'];
    if ($f['error'] !== UPLOAD_ERR_OK) d_json(['ok' => false, 'error' => 'Upload failed']);
    if ($f['size'] > 10 * 1024 * 1024) { http_response_code(400); d_json(['ok' => false, 'error' => 'File too large (max 10 MB)']); }
    $orig = preg_replace('/[^A-Za-z0-9._ -]/', '_', $f['name']);
    $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
    if (!isset($ALLOWED[$ext])) { http_response_code(400); d_json(['ok' => false, 'error' => 'Type not allowed (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG)']); }
    $stored = date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 8) . '.' . $ext;
    if (!@move_uploaded_file($f['tmp_name'], $docsDir . '/' . $stored)) { http_response_code(500); d_json(['ok' => false, 'error' => 'Could not save file (check permissions)']); }
    $rows = d_load($metaFile);
    $rec = [
        'id' => 'D-' . date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 6),
        'ckey' => substr((string) ($_POST['ckey'] ?? ''), 0, 160),
        'leadEmail' => substr((string) ($_POST['leadEmail'] ?? ''), 0, 120),
        'stored' => $stored, 'name' => $orig, 'ext' => $ext, 'size' => (int) $f['size'],
        'category' => substr((string) ($_POST['category'] ?? ''), 0, 60),
        'uploadedBy' => substr((string) ($_POST['author'] ?? 'Consultant'), 0, 60),
        'at' => date('c'),
    ];
    $rows[] = $rec; d_save($metaFile, $rows);
    d_json(['ok' => true, 'doc' => $rec]);
}

/* ---------- JSON actions ---------- */
$p = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($p) || !hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''))) { http_response_code(403); d_json(['ok' => false, 'error' => 'Incorrect password']); }
$action = $p['action'] ?? 'list';
$rows = d_load($metaFile);

if ($action === 'list') {
    $key = trim((string) ($p['key'] ?? $p['ckey'] ?? ''));
    if ($key === '') $key = strtolower(trim((string) ($p['email'] ?? '')));
    $out = array_values(array_filter($rows, fn($r) => ($r['ckey'] ?? '') === $key || strtolower((string) ($r['leadEmail'] ?? '')) === $key));
    usort($out, fn($a, $b) => strcmp($b['at'] ?? '', $a['at'] ?? ''));
    d_json(['ok' => true, 'docs' => $out]);
}

/* Global listing of every uploaded document (for the Documents module). */
if ($action === 'all') {
    $out = $rows;
    usort($out, fn($a, $b) => strcmp($b['at'] ?? '', $a['at'] ?? ''));
    d_json(['ok' => true, 'docs' => array_values($out)]);
}

if ($action === 'delete') {
    $id = (string) ($p['id'] ?? '');
    foreach ($rows as $r) if (($r['id'] ?? '') === $id) { @unlink($docsDir . '/' . basename($r['stored'] ?? '')); }
    $rows = array_values(array_filter($rows, fn($r) => ($r['id'] ?? '') !== $id));
    d_save($metaFile, $rows);
    d_json(['ok' => true]);
}

if ($action === 'download') {
    $id = (string) ($p['id'] ?? '');
    foreach ($rows as $r) {
        if (($r['id'] ?? '') === $id) {
            $path = $docsDir . '/' . basename($r['stored'] ?? '');
            if (!is_file($path)) { http_response_code(404); d_json(['ok' => false, 'error' => 'File missing']); }
            header('Content-Type: ' . ($ALLOWED[$r['ext'] ?? ''] ?? 'application/octet-stream'));
            header('Content-Disposition: attachment; filename="' . ($r['name'] ?? $r['stored']) . '"');
            header('Content-Length: ' . filesize($path));
            header('X-Content-Type-Options: nosniff');
            readfile($path);
            exit;
        }
    }
    http_response_code(404); d_json(['ok' => false, 'error' => 'Not found']);
}

http_response_code(400);
d_json(['ok' => false, 'error' => 'Unknown action']);
