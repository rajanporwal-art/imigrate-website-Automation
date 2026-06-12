<?php
/**
 * File upload handler for iMigrate CRM (local disk storage).
 *
 * Handles multipart file uploads, stores to leads/uploads/, returns file metadata.
 * Production should validate: file type, size limits, virus scanning.
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }

// For file uploads, password may come via POST field instead of JSON
$pw = (string) ($_POST['password'] ?? $_GET['password'] ?? '');
if (!hash_equals($EDIT_PASSWORD, $pw)) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

$dir = __DIR__ . '/leads';
$uploadDir = $dir . '/uploads';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
    @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'No file or upload error']);
    exit;
}

$file = $_FILES['file'];
$originalName = basename($file['name']);
$size = (int) $file['size'];
$type = $file['type'];

// Validate size (max 50MB)
if ($size > 50 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'File too large (max 50MB)']);
    exit;
}

// Generate safe filename
$ext = pathinfo($originalName, PATHINFO_EXTENSION);
$safeName = 'upload-' . date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 8) . '.' . preg_replace('/[^a-z0-9]/', '', strtolower($ext));
$filePath = $uploadDir . '/' . $safeName;

if (!move_uploaded_file($file['tmp_name'], $filePath)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not save file']);
    exit;
}

// Make file readable only by web server
chmod($filePath, 0640);

echo json_encode([
    'ok' => true,
    'filename' => $safeName,
    'originalName' => $originalName,
    'size' => $size,
    'type' => $type,
    'uploadedAt' => date('c'),
]);
