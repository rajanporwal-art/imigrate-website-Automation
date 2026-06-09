<?php
/**
 * Simple task / follow-up store for the iMigrate CRM (leads/crm-tasks.ndjson).
 * POST { password, action, ... }
 *   'list'   -> { ok, tasks: [...] }
 *   'add'    -> { title, due, priority, leadEmail, type } -> creates a task
 *   'update' -> { id, status?, ...fields } -> updates a task
 *   'delete' -> { id }
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
$file = $dir . '/crm-tasks.ndjson';

function load_tasks($file) {
    $rows = [];
    if (is_file($file)) {
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $r = json_decode($line, true);
            if (is_array($r)) $rows[] = $r;
        }
    }
    return $rows;
}
function save_tasks($file, $rows) {
    $out = '';
    foreach ($rows as $r) $out .= json_encode($r) . "\n";
    return @file_put_contents($file, $out, LOCK_EX) !== false;
}

$action = $p['action'] ?? 'list';
$tasks = load_tasks($file);

if ($action === 'list') {
    echo json_encode(['ok' => true, 'tasks' => $tasks]);
    exit;
}

if ($action === 'add') {
    $task = [
        'id' => date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 6),
        'title' => substr(trim((string) ($p['title'] ?? '')), 0, 200),
        'type' => substr((string) ($p['type'] ?? 'Follow-up'), 0, 40),
        'due' => substr((string) ($p['due'] ?? ''), 0, 20),
        'priority' => substr((string) ($p['priority'] ?? 'Normal'), 0, 20),
        'leadEmail' => substr((string) ($p['leadEmail'] ?? ''), 0, 120),
        'ckey' => substr((string) ($p['ckey'] ?? ''), 0, 160),
        'assignedTo' => substr((string) ($p['assignedTo'] ?? ($p['author'] ?? '')), 0, 60),
        'status' => substr((string) ($p['status'] ?? 'Open'), 0, 20),
        'createdAt' => date('c'),
    ];
    if ($task['title'] === '') { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Title required']); exit; }
    $tasks[] = $task;
} elseif ($action === 'update') {
    $id = (string) ($p['id'] ?? '');
    $found = false;
    foreach ($tasks as &$t) {
        if (($t['id'] ?? '') === $id) {
            foreach (['title', 'due', 'priority', 'status', 'type', 'leadEmail', 'ckey', 'assignedTo'] as $k) {
                if (isset($p[$k])) $t[$k] = substr((string) $p[$k], 0, 200);
            }
            $found = true; break;
        }
    }
    unset($t);
    if (!$found) { http_response_code(404); echo json_encode(['ok' => false, 'error' => 'Task not found']); exit; }
} elseif ($action === 'delete') {
    $id = (string) ($p['id'] ?? '');
    $tasks = array_values(array_filter($tasks, fn($t) => ($t['id'] ?? '') !== $id));
} else {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Unknown action']);
    exit;
}

if (!save_tasks($file, $tasks)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not save tasks']);
    exit;
}
echo json_encode(['ok' => true, 'tasks' => $tasks]);
