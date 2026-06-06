<?php
/**
 * Saves the website's editable content (content.json).
 * Used by /admin.html. Works on standard Hostinger PHP hosting.
 *
 * SECURITY: change the password below before deploying.
 */

// Password is set in admin-config.php (single source of truth).
@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 200000) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid request size']);
    exit;
}

$payload = json_decode($raw, true);
if (!is_array($payload) || !isset($payload['password']) || !isset($payload['content'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Malformed request']);
    exit;
}

if (!hash_equals($EDIT_PASSWORD, (string) $payload['password'])) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

$content = $payload['content'];
if (!is_array($content)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid content']);
    exit;
}

// Which file to write — restricted to a safe allowlist.
$allowed = ['content.json', 'blog.json', 'faqs.json', 'hubspot.json', 'forms.json'];
$file = isset($payload['file']) ? basename((string) $payload['file']) : 'content.json';
if (!in_array($file, $allowed, true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'File not allowed']);
    exit;
}

$json = json_encode(
    $content,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
);
if ($json === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not encode content']);
    exit;
}

$path = __DIR__ . '/' . $file;

// Keep a one-step backup before overwriting.
if (is_file($path)) {
    @copy($path, $path . '.backup');
}

if (file_put_contents($path, $json, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Could not write ' . $file . '. In Hostinger File Manager, set this file\'s permissions to 644 (writable by owner).',
    ]);
    exit;
}

echo json_encode(['ok' => true]);
