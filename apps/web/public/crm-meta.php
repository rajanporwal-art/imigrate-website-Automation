<?php
/**
 * Per-lead (by email) CRM metadata for the iMigrate CRM: pipeline stage + notes.
 * Decoupled from individual lead submissions so stage/notes survive new form
 * submissions from the same person. Stored in leads/crm-meta.ndjson.
 *
 * POST { password, action, email, ... }
 *   action 'list'      -> { ok, meta: { "<email>": { stage, notes[] } } }
 *   action 'set-stage' -> { email, stage }
 *   action 'add-note'  -> { email, note }
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
$p = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($p) || !hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''))) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

$dir = __DIR__ . '/leads';
if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
$file = $dir . '/crm-meta.ndjson';

function load_meta($file) {
    $meta = [];
    if (is_file($file)) {
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $row = json_decode($line, true);
            if (is_array($row) && !empty($row['email'])) $meta[strtolower($row['email'])] = $row;
        }
    }
    return $meta;
}
function save_meta($file, $meta) {
    $out = '';
    foreach ($meta as $row) $out .= json_encode($row) . "\n";
    return @file_put_contents($file, $out, LOCK_EX) !== false;
}

$action = $p['action'] ?? 'list';
$meta = load_meta($file);

if ($action === 'list') {
    echo json_encode(['ok' => true, 'meta' => (object) $meta]);
    exit;
}

$email = strtolower(trim((string) ($p['email'] ?? '')));
if ($email === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing email']);
    exit;
}
if (!isset($meta[$email])) $meta[$email] = ['email' => $email, 'stage' => 'New Lead', 'notes' => []];

if ($action === 'set-stage') {
    $meta[$email]['stage'] = substr((string) ($p['stage'] ?? 'New Lead'), 0, 60);
    $meta[$email]['stageAt'] = date('c');
} elseif ($action === 'add-note') {
    $note = trim(substr((string) ($p['note'] ?? ''), 0, 4000));
    if ($note !== '') {
        if (!isset($meta[$email]['notes']) || !is_array($meta[$email]['notes'])) $meta[$email]['notes'] = [];
        $meta[$email]['notes'][] = ['text' => $note, 'at' => date('c')];
    }
} else {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Unknown action']);
    exit;
}

if (!save_meta($file, $meta)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not save (check folder permissions)']);
    exit;
}
echo json_encode(['ok' => true, 'meta' => $meta[$email]]);
