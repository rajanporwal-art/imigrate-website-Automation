<?php
/**
 * Serves a stored CV/resume from the web-protected uploads folder for the admin.
 *
 * Two access modes (both keep CVs private — the uploads folder itself is denied):
 *   1. POST { password, file }            → used by the dashboard (View/Download).
 *   2. GET  ?file=NAME&token=HMAC[&dl=1]  → signed "capability" link used in the
 *      CSV export. token = hash_hmac('sha256', file, EDIT_PASSWORD). Lets an
 *      exported CSV contain a working CV link WITHOUT exposing the password.
 *      Add &dl=1 to force download; otherwise the browser may preview (e.g. PDF).
 */
@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$authorized = false;
$forceDownload = true;

if ($method === 'POST') {
    $payload = json_decode((string) file_get_contents('php://input'), true);
    $authorized = is_array($payload) && hash_equals($EDIT_PASSWORD, (string) ($payload['password'] ?? ''));
    $name = is_array($payload) ? basename((string) ($payload['file'] ?? '')) : '';
} else {
    // Signed GET link (used by CSV export).
    $name = basename((string) ($_GET['file'] ?? ''));
    $token = (string) ($_GET['token'] ?? '');
    $expected = hash_hmac('sha256', $name, $EDIT_PASSWORD);
    $authorized = $name !== '' && hash_equals($expected, $token);
    $forceDownload = isset($_GET['dl']); // inline preview by default for GET
}

if (!$authorized) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Not authorized']);
    exit;
}

$path = __DIR__ . '/leads/uploads/' . $name;
if ($name === '' || !is_file($path)) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'File not found']);
    exit;
}

$ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
$types = [
    'pdf'  => 'application/pdf',
    'doc'  => 'application/msword',
    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
header('Content-Disposition: ' . ($forceDownload ? 'attachment' : 'inline') . '; filename="' . $name . '"');
header('Content-Length: ' . filesize($path));
header('X-Content-Type-Options: nosniff');
readfile($path);
