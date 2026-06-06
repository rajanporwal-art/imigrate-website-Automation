<?php
/**
 * Password-protected download of a stored CV/resume for the admin dashboard.
 * POST { password, file }. Streams the file from the protected uploads folder.
 */
@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

$payload = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($payload) || !hash_equals($EDIT_PASSWORD, (string) ($payload['password'] ?? ''))) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

$name = basename((string) ($payload['file'] ?? ''));
$path = __DIR__ . '/leads/uploads/' . $name;
if ($name === '' || !is_file($path)) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'File not found']);
    exit;
}

$ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
$types = ['pdf' => 'application/pdf', 'doc' => 'application/msword', 'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
header('Content-Disposition: attachment; filename="' . $name . '"');
header('Content-Length: ' . filesize($path));
readfile($path);
