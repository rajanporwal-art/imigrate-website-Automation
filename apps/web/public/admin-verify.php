<?php
/**
 * Server-side password check for the admin dashboard gate.
 *
 * The admin UI used to reveal itself purely client-side (any input unlocked
 * the editor). This endpoint validates the password against the single source
 * of truth in admin-config.php so anonymous users cannot open the dashboard.
 *
 * Returns {"ok":true} only when the password is correct.
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

$payload = json_decode((string) file_get_contents('php://input'), true);
$pw = is_array($payload) ? (string) ($payload['password'] ?? '') : '';

// Constant-time comparison; small delay to slow brute-force attempts.
if ($pw === '' || !hash_equals($EDIT_PASSWORD, $pw)) {
    usleep(400000);
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

echo json_encode(['ok' => true]);
