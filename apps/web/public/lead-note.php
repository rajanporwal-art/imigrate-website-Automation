<?php
/**
 * Save an internal admin note/comment against a captured lead.
 * POST { password, id, note }. Updates the lead's "adminNote" in leads.ndjson.
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
if (!is_array($payload) || !hash_equals($EDIT_PASSWORD, (string) ($payload['password'] ?? ''))) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

$id = (string) ($payload['id'] ?? '');
$note = (string) ($payload['note'] ?? '');
if ($id === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing lead id']);
    exit;
}
$note = substr($note, 0, 5000);

$file = __DIR__ . '/leads/leads.ndjson';
if (!is_file($file)) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'No leads file']);
    exit;
}

$lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$found = false;
$out = '';
foreach ($lines as $line) {
    $row = json_decode($line, true);
    if (is_array($row) && ($row['id'] ?? null) === $id) {
        $row['adminNote'] = $note;
        $row['adminNoteAt'] = date('c');
        $found = true;
        $out .= json_encode($row) . "\n";
    } else {
        $out .= $line . "\n";
    }
}

if (!$found) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'Lead not found']);
    exit;
}

if (@file_put_contents($file, $out, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not save note (check file permissions)']);
    exit;
}

echo json_encode(['ok' => true]);
