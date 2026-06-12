<?php
/**
 * Per-lead CRM metadata for the iMigrate CRM.
 *
 * Stores pipeline stage, internal notes, editable field OVERRIDES and an
 * ACTIVITY timeline, decoupled from individual lead submissions so they survive
 * new form submissions from the same person. Stored in leads/crm-meta.ndjson.
 *
 * Records are keyed by a stable "ckey":
 *   - the lowercased email when present
 *   - otherwise "id:<firstSubmissionId>" so no-email (AI) leads still work.
 * (Legacy rows keyed by email continue to load unchanged.)
 *
 * POST { password, action, key|email, ... }
 *   'list'        -> { ok, meta: { "<ckey>": { ... } } }
 *   'set-stage'   -> { key, stage }                 (logs activity)
 *   'save-fields' -> { key, fields:{...} }          (editable overrides + activity)
 *   'add-note'    -> { key, note, author? }
 *   'edit-note'   -> { key, noteId, note }
 *   'delete-note' -> { key, noteId }
 *   'log'         -> { key, event, detail? }        (manual activity entry)
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

function meta_key($row) {
    if (!empty($row['key'])) return (string) $row['key'];
    if (!empty($row['email'])) return strtolower(trim((string) $row['email']));
    return '';
}
function load_meta($file) {
    $meta = [];
    if (is_file($file)) {
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $row = json_decode($line, true);
            if (!is_array($row)) continue;
            $k = meta_key($row);
            if ($k !== '') { $row['key'] = $k; $meta[$k] = $row; }
        }
    }
    return $meta;
}
function save_meta($file, $meta) {
    $out = '';
    foreach ($meta as $row) $out .= json_encode($row) . "\n";
    return @file_put_contents($file, $out, LOCK_EX) !== false;
}
function new_id() { return date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 6); }

function log_activity(&$rec, $event, $detail, $author) {
    $rec['activity'][] = [
        'id' => new_id(),
        'event' => substr((string) $event, 0, 60),
        'detail' => substr((string) $detail, 0, 400),
        'author' => $author,
        'at' => date('c'),
    ];
    if (count($rec['activity']) > 500) $rec['activity'] = array_slice($rec['activity'], -500);
}

$action = $p['action'] ?? 'list';
$meta = load_meta($file);

if ($action === 'list') {
    echo json_encode(['ok' => true, 'meta' => (object) $meta]);
    exit;
}

if ($action === 'migrate-stages') {
    // Safe in-place migration: legacy stage names → new 15 standardised statuses.
    // Protected: 'Signed Up' and 'Lost Lead' are never overwritten.
    // A full backup is taken before any mutations.
    $map = [
        'Contact Attempted'       => 'Pending Call',
        'CV Requested'            => 'Pending CV / Resume',
        'CV Received'             => 'Pending Appointment',
        'Assessment Completed'    => 'Under Assessment',
        'Lead Assessed'           => 'Under Assessment',
        'Consultation Booked'     => 'Appointment Scheduled',
        'Consultation Completed'  => 'Pending Follow-up',
        'Qualified'               => 'Under Assessment',
        'Agreement Sent'          => 'Signed Up',
        'Payment Received'        => 'Signed Up',
        'Application Preparation' => 'Signed Up',
        'Application Submitted'   => 'Signed Up',
        'Visa Approved'           => 'Signed Up',
        'Lost Opportunity'        => 'Lost Lead',
    ];
    // These statuses must never be changed by migration.
    $protected = ['Signed Up', 'Lost Lead'];
    $dry = !empty($p['dryRun']);
    $changes = [];
    foreach ($meta as $k => &$rec) {
        $stage = $rec['stage'] ?? 'New Lead';
        if (isset($map[$stage]) && !in_array($stage, $protected, true)) {
            $newStage = $map[$stage];
            $changes[] = [
                'key'  => $k,
                'name' => ($rec['overrides']['fullName'] ?? ($rec['overrides']['name'] ?? '')),
                'from' => $stage,
                'to'   => $newStage,
            ];
            if (!$dry) {
                $rec['stage']          = $newStage;
                $rec['stageAt']        = date('c');
                $rec['stageChangedBy'] = 'System (Migration)';
                log_activity($rec, 'Stage migrated', $stage . ' → ' . $newStage, 'System (Migration)');
            }
        }
    }
    unset($rec);
    if ($dry) {
        echo json_encode(['ok' => true, 'total' => count($meta), 'changes' => $changes]);
        exit;
    }
    // Safety backup before any writes.
    $backupDir = $dir . '/backups';
    if (!is_dir($backupDir)) @mkdir($backupDir, 0755, true);
    $ts = date('Ymd-His');
    $bkDest = $backupDir . '/' . $ts;
    @mkdir($bkDest, 0755, true);
    foreach (glob($dir . '/*.ndjson') ?: [] as $f) @copy($f, $bkDest . '/' . basename($f));
    foreach (glob($dir . '/*.json')   ?: [] as $f) @copy($f, $bkDest . '/' . basename($f));
    @file_put_contents($bkDest . '/_manifest.json', json_encode([
        'ts'      => $ts,
        'at'      => date('c'),
        'reason'  => 'pre-stage-migration',
        'changes' => count($changes),
    ]));
    save_meta($file, $meta);
    echo json_encode(['ok' => true, 'migrated' => count($changes), 'changes' => $changes, 'backupTs' => $ts]);
    exit;
}

// Resolve the stable contact key (prefer explicit "key", fall back to email).
$key = trim((string) ($p['key'] ?? ''));
if ($key === '') $key = strtolower(trim((string) ($p['email'] ?? '')));
if ($key === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing contact key']);
    exit;
}

if (!isset($meta[$key])) {
    $meta[$key] = [
        'key' => $key,
        'email' => strtolower(trim((string) ($p['email'] ?? (strpos($key, 'id:') === 0 ? '' : $key)))),
        'stage' => 'New Lead',
        'notes' => [],
        'overrides' => [],
        'activity' => [],
    ];
}
if (!isset($meta[$key]['notes']) || !is_array($meta[$key]['notes'])) $meta[$key]['notes'] = [];
if (!isset($meta[$key]['overrides']) || !is_array($meta[$key]['overrides'])) $meta[$key]['overrides'] = [];
if (!isset($meta[$key]['activity']) || !is_array($meta[$key]['activity'])) $meta[$key]['activity'] = [];

$author = substr(trim((string) ($p['author'] ?? 'Consultant')), 0, 60);
if ($author === '') $author = 'Consultant';

if ($action === 'set-stage') {
    $prev = $meta[$key]['stage'] ?? 'New Lead';
    $stage = substr((string) ($p['stage'] ?? 'New Lead'), 0, 60);
    $meta[$key]['stage']          = $stage;
    $meta[$key]['stageAt']        = date('c');
    $meta[$key]['stageChangedBy'] = $author;
    if ($prev !== $stage) log_activity($meta[$key], 'Stage changed', $prev . ' → ' . $stage, $author);

} elseif ($action === 'save-fields') {
    // Any lead/user-input field is editable. Keys are validated to a safe
    // character set; values are length-capped. Original submissions are never
    // mutated — edits are stored as overrides + logged to the activity timeline.
    $fields = isset($p['fields']) && is_array($p['fields']) ? $p['fields'] : [];
    $changed = [];
    $count = 0;
    foreach ($fields as $k => $v) {
        if (++$count > 80) break;
        if (!preg_match('/^[A-Za-z0-9 _:\-]{1,40}$/', (string) $k)) continue;
        $new = is_scalar($v) ? substr((string) $v, 0, 500) : '';
        $old = isset($meta[$key]['overrides'][$k]) ? (string) $meta[$key]['overrides'][$k] : null;
        $meta[$key]['overrides'][$k] = $new;
        if ($old !== $new) $changed[] = $k;
    }
    if ($changed) {
        // Prefer a human-readable change summary from the client when provided.
        $detail = isset($p['detail']) && is_string($p['detail']) ? substr($p['detail'], 0, 400) : implode(', ', $changed);
        log_activity($meta[$key], 'Fields updated', $detail, $author);
    }

} elseif ($action === 'add-note') {
    $note = trim(substr((string) ($p['note'] ?? ''), 0, 4000));
    if ($note !== '') {
        $meta[$key]['notes'][] = ['id' => new_id(), 'text' => $note, 'author' => $author, 'at' => date('c')];
        log_activity($meta[$key], 'Note added', mb_substr($note, 0, 80), $author);
    }

} elseif ($action === 'edit-note') {
    $noteId = (string) ($p['noteId'] ?? '');
    $note = trim(substr((string) ($p['note'] ?? ''), 0, 4000));
    foreach ($meta[$key]['notes'] as &$n) {
        if (($n['id'] ?? '') === $noteId) { $n['text'] = $note; $n['editedAt'] = date('c'); break; }
    }
    unset($n);
    log_activity($meta[$key], 'Note edited', '', $author);

} elseif ($action === 'delete-note') {
    $noteId = (string) ($p['noteId'] ?? '');
    $meta[$key]['notes'] = array_values(array_filter(
        $meta[$key]['notes'],
        function ($n) use ($noteId) { return ($n['id'] ?? '') !== $noteId; }
    ));
    log_activity($meta[$key], 'Note deleted', '', $author);

} elseif ($action === 'log') {
    log_activity($meta[$key], (string) ($p['event'] ?? 'Activity'), (string) ($p['detail'] ?? ''), $author);

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
echo json_encode(['ok' => true, 'meta' => $meta[$key]]);
