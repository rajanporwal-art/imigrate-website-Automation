<?php
/**
 * Saves the website's editable content.
 * Used by /admin.html. Works on standard Hostinger PHP hosting.
 *
 * DURABILITY: writes to cms-overrides/<file> instead of the root file.
 * The root file is the repo-shipped seed (updated on each deploy); the
 * override is never touched by deploys (FTP exclude), so CMS edits are
 * permanent. The website SPA reads override → root → compiled defaults
 * via cmsFetchJson(), so published changes are always visible.
 *
 * SECURITY: password is set in admin-config.php / auth/secrets.php.
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

// DURABILITY: write to cms-overrides/ instead of the root file.
// cms-overrides/ is excluded from FTP deploys, so these edits survive
// every deployment. The website reads override → root → defaults.
$ovDir = __DIR__ . '/cms-overrides';
if (!is_dir($ovDir)) { @mkdir($ovDir, 0755, true); }
$path = $ovDir . '/' . $file;

// Also snapshot into cms-versions/ for rollback capability.
$verRoot = __DIR__ . '/cms-versions';
$domain = pathinfo($file, PATHINFO_FILENAME);
$verDir = $verRoot . '/' . $domain;
if (!is_dir($verDir)) { @mkdir($verDir, 0755, true); }
if (is_file($path)) {
    $ts = date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 4);
    @copy($path, $verDir . '/' . $ts . '.json');
    @file_put_contents($verDir . '/index.ndjson',
        json_encode(['ts' => $ts, 'editor' => 'Admin (legacy)', 'at' => date('c'), 'bytes' => (int) @filesize($path), 'note' => 'pre-save']) . "\n",
        FILE_APPEND | LOCK_EX);
}

if (file_put_contents($path, $json, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Could not write ' . $file . '. Check permissions on cms-overrides/ directory.',
    ]);
    exit;
}

echo json_encode(['ok' => true, 'persisted_to' => 'cms-overrides/' . $file]);
