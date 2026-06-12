<?php
/**
 * Call log for iMigrate CRM (leads/calls.ndjson).
 *
 * Stores call records linked to leads by ckey and/or email. Each call includes:
 * - timing (date, duration)
 * - outcome (scheduled, completed, missed)
 * - notes and assigned consultant
 *
 * Actions (require admin password):
 *   'list'     -> { ok, calls: [...] }
 *   'add'      -> { ckey|email, date, duration, outcome, consultant, notes } -> { ok, id }
 *   'edit'     -> { id, ... (any field) }
 *   'delete'   -> { id }
 *   'by'       -> { ckey|email } -> { ok, calls: [...] }
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

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 100000) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid request']);
    exit;
}
$p = json_decode($raw, true);
if (!is_array($p)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Malformed request']);
    exit;
}

if (!hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''))) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

$dir = __DIR__ . '/leads';
if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
    @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
}
$file = $dir . '/calls.ndjson';

function calls_load($file) {
    $rows = [];
    if (is_file($file)) {
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $r = json_decode($line, true);
            if (is_array($r)) $rows[] = $r;
        }
    }
    return $rows;
}

function calls_save($file, $rows) {
    $out = '';
    foreach ($rows as $r) $out .= json_encode($r) . "\n";
    return @file_put_contents($file, $out, LOCK_EX) !== false;
}

function call_id() {
    return 'C-' . date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 6);
}

function call_ckey($email, $fallbackId) {
    $email = strtolower(trim((string) $email));
    return $email !== '' ? $email : 'id:' . $fallbackId;
}

$action = $p['action'] ?? 'list';
$rows = calls_load($file);
$author = substr(trim((string) ($p['author'] ?? 'Consultant')), 0, 60);
if ($author === '') $author = 'Consultant';

if ($action === 'list') {
    usort($rows, function ($a, $b) { return strcmp($b['date'] ?? '', $a['date'] ?? ''); });
    echo json_encode(['ok' => true, 'calls' => $rows]);
    exit;
}

if ($action === 'by') {
    $key = trim((string) ($p['key'] ?? ''));
    if ($key === '') $key = strtolower(trim((string) ($p['email'] ?? '')));
    $out = array_values(array_filter($rows, function ($r) use ($key) {
        return ($r['ckey'] ?? '') === $key || strtolower((string) ($r['leadEmail'] ?? '')) === $key;
    }));
    usort($out, function ($a, $b) { return strcmp($b['date'] ?? '', $a['date'] ?? ''); });
    echo json_encode(['ok' => true, 'calls' => $out]);
    exit;
}

if ($action === 'add') {
    $email = (string) ($p['email'] ?? '');
    $key = trim((string) ($p['key'] ?? ''));
    if ($key === '') $key = call_ckey($email, call_id());

    $rec = [
        'id' => call_id(),
        'ckey' => $key,
        'leadEmail' => strtolower(trim($email)),
        'leadName' => substr((string) ($p['leadName'] ?? ''), 0, 120),
        'date' => substr((string) ($p['date'] ?? date('Y-m-d')), 0, 10),
        'time' => substr((string) ($p['time'] ?? date('H:i')), 0, 5),
        'duration' => substr((string) ($p['duration'] ?? '15'), 0, 10),
        'outcome' => substr((string) ($p['outcome'] ?? 'completed'), 0, 20),
        'consultant' => substr((string) ($p['consultant'] ?? $author), 0, 60),
        'notes' => substr((string) ($p['notes'] ?? ''), 0, 2000),
        'createdAt' => date('c'),
    ];
    $rows[] = $rec;
    if (!calls_save($file, $rows)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Could not save (check folder permissions)']);
        exit;
    }
    echo json_encode(['ok' => true, 'id' => $rec['id']]);
    exit;
}

if ($action === 'edit') {
    $id = (string) ($p['id'] ?? '');
    $found = false;
    foreach ($rows as &$r) {
        if (($r['id'] ?? '') === $id) {
            $found = true;
            if (isset($p['date'])) $r['date'] = substr((string) $p['date'], 0, 10);
            if (isset($p['time'])) $r['time'] = substr((string) $p['time'], 0, 5);
            if (isset($p['duration'])) $r['duration'] = substr((string) $p['duration'], 0, 10);
            if (isset($p['outcome'])) $r['outcome'] = substr((string) $p['outcome'], 0, 20);
            if (isset($p['notes'])) $r['notes'] = substr((string) $p['notes'], 0, 2000);
            break;
        }
    }
    unset($r);
    if (!$found) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Call not found']);
        exit;
    }
    if (!calls_save($file, $rows)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Could not save']);
        exit;
    }
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'delete') {
    $id = (string) ($p['id'] ?? '');
    $rows = array_values(array_filter($rows, function ($r) use ($id) { return ($r['id'] ?? '') !== $id; }));
    if (!calls_save($file, $rows)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Could not save']);
        exit;
    }
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
