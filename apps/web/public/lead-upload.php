<?php
/**
 * Stores an uploaded CV/resume in a web-protected folder and returns the stored
 * filename. Called by the lead form before submitting the lead. Accepts PDF/DOC/DOCX
 * up to 5 MB. The stored file is later attached to the lead record.
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['cv'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'No file']);
    exit;
}

$f = $_FILES['cv'];
if ($f['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Upload failed']);
    exit;
}
if ($f['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'File too large (max 5 MB)']);
    exit;
}

$orig = preg_replace('/[^A-Za-z0-9._-]/', '_', $f['name']);
$ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
$allowed = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
if (!in_array($ext, $allowed, true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Only PDF, DOC, DOCX, JPG or PNG allowed']);
    exit;
}

$dir = __DIR__ . '/leads/uploads';
if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
    @file_put_contents(__DIR__ . '/leads/.htaccess', "Require all denied\nDeny from all\n");
}

$stored = date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 8) . '.' . $ext;
if (!@move_uploaded_file($f['tmp_name'], $dir . '/' . $stored)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not save file (check folder permissions)']);
    exit;
}

echo json_encode(['ok' => true, 'file' => $stored, 'original' => $orig]);
