<?php
/**
 * File manager for iMigrate CRM (leads/uploads).
 *
 * Stores file metadata (not the binary data itself, which is in the file system).
 * Each file record links to a lead by ckey/email and tracks upload date/user/size.
 *
 * Actions (require admin password):
 *   'list'     -> { ok, files: [...] }
 *   'by'       -> { ckey|email } -> { ok, files: [...] }
 *   'add-meta' -> { ckey|email, filename, size, type } -> stores metadata
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
if ($raw === false || strlen($raw) > 100000) {
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

if (!hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''))) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

$dir = __DIR__ . '/leads';
if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
    @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
}
$file = $dir . '/files.ndjson';

function files_load($file) {
    $rows = [];
    if (is_file($file)) {
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $r = json_decode($line, true);
            if (is_array($r)) $rows[] = $r;
        }
    }
    return $rows;
}

function files_save($file, $rows) {
    $out = '';
    foreach ($rows as $r) $out .= json_encode($r) . "\n";
    return @file_put_contents($file, $out, LOCK_EX) !== false;
}

function file_id() {
    return 'F-' . date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 6);
}

function file_ckey($email, $fallbackId) {
    $email = strtolower(trim((string) $email));
    return $email !== '' ? $email : 'id:' . $fallbackId;
}

$action = $p['action'] ?? 'list';
$rows = files_load($file);
$author = substr(trim((string) ($p['author'] ?? 'Admin')), 0, 60);
if ($author === '') $author = 'Admin';

if ($action === 'list') {
    usort($rows, function ($a, $b) { return strcmp($b['uploadedAt'] ?? '', $a['uploadedAt'] ?? ''); });
    echo json_encode(['ok' => true, 'files' => $rows]);
    exit;
}

if ($action === 'by') {
    $key = trim((string) ($p['key'] ?? ''));
    if ($key === '') $key = strtolower(trim((string) ($p['email'] ?? '')));
    $out = array_values(array_filter($rows, function ($r) use ($key) {
        return ($r['ckey'] ?? '') === $key || strtolower((string) ($r['leadEmail'] ?? '')) === $key;
    }));
    usort($out, function ($a, $b) { return strcmp($b['uploadedAt'] ?? '', $a['uploadedAt'] ?? ''); });
    echo json_encode(['ok' => true, 'files' => $out]);
    exit;
}

if ($action === 'add-meta') {
    $email = (string) ($p['email'] ?? '');
    $key = trim((string) ($p['key'] ?? ''));
    if ($key === '') $key = file_ckey($email, file_id());

    $rec = [
        'id' => file_id(),
        'ckey' => $key,
        'leadEmail' => strtolower(trim($email)),
        'leadName' => substr((string) ($p['leadName'] ?? ''), 0, 120),
        'filename' => substr((string) ($p['filename'] ?? ''), 0, 255),
        'originalName' => substr((string) ($p['originalName'] ?? ''), 0, 255),
        'size' => (int) ($p['size'] ?? 0),
        'type' => substr((string) ($p['type'] ?? 'application/octet-stream'), 0, 100),
        'category' => substr((string) ($p['category'] ?? 'general'), 0, 50),
        'uploadedBy' => $author,
        'uploadedAt' => date('c'),
    ];
    $rows[] = $rec;
    if (!files_save($file, $rows)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Could not save metadata (check permissions)']);
        exit;
    }
    echo json_encode(['ok' => true, 'id' => $rec['id']]);
    exit;
}

if ($action === 'delete') {
    $id = (string) ($p['id'] ?? '');
    $found = false;
    foreach ($rows as $r) {
        if (($r['id'] ?? '') === $id) {
            $found = true;
            // Delete the physical file if it exists
            $uploadDir = $dir . '/uploads';
            $filePath = $uploadDir . '/' . ($r['filename'] ?? '');
            if (is_file($filePath)) @unlink($filePath);
            break;
        }
    }
    $rows = array_values(array_filter($rows, function ($r) use ($id) { return ($r['id'] ?? '') !== $id; }));
    if (!files_save($file, $rows)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Could not delete metadata']);
        exit;
    }
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
