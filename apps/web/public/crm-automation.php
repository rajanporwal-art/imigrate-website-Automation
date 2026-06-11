<?php
/**
 * Automation rules for the iMigrate CRM.
 *
 * Called by the CRM frontend after every successful setStage() call.
 * Creates follow-up tasks and queues reminder emails based on the
 * new stage, without touching any existing lead data.
 *
 * POST { password, key, email, name, stage }
 *   -> { ok, stage, actions: [...] }
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

$stage = (string) ($p['stage'] ?? '');
$key   = (string) ($p['key']   ?? '');
$email = strtolower(trim((string) ($p['email'] ?? '')));
$name  = substr(trim((string) ($p['name'] ?? 'Lead')), 0, 100);
if ($name === '') $name = 'Lead';

$dir = __DIR__ . '/leads';
if (!is_dir($dir)) { @mkdir($dir, 0755, true); }

/* ---------- helpers ---------- */
function auto_id() {
    return date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 6);
}
function load_ndjson($file) {
    $rows = [];
    if (is_file($file)) {
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $r = json_decode($line, true);
            if (is_array($r)) $rows[] = $r;
        }
    }
    return $rows;
}
function save_ndjson($file, $rows) {
    $out = '';
    foreach ($rows as $r) $out .= json_encode($r) . "\n";
    return @file_put_contents($file, $out, LOCK_EX) !== false;
}

/**
 * Create a task in crm-tasks.ndjson only if no identical open task
 * already exists for this lead + type to avoid duplicate spam.
 */
function add_task_once($dir, $title, $type, $due, $priority, $leadEmail, $ckey) {
    $file  = $dir . '/crm-tasks.ndjson';
    $tasks = load_ndjson($file);
    // Deduplicate: skip if same type + ckey already open.
    foreach ($tasks as $t) {
        if (($t['ckey'] ?? '') === $ckey && ($t['type'] ?? '') === $type && ($t['status'] ?? 'Open') !== 'Done') {
            return false; // already exists
        }
    }
    $tasks[] = [
        'id'         => auto_id(),
        'title'      => $title,
        'type'       => $type,
        'due'        => $due,
        'priority'   => $priority,
        'leadEmail'  => $leadEmail,
        'ckey'       => $ckey,
        'assignedTo' => 'Consultant',
        'status'     => 'Open',
        'source'     => 'automation',
        'createdAt'  => date('c'),
    ];
    return save_ndjson($file, $tasks);
}

/* ---------- date helpers ---------- */
$today    = date('Y-m-d');
$tomorrow = date('Y-m-d', strtotime('+1 day'));
$in2days  = date('Y-m-d', strtotime('+2 days'));
$in7days  = date('Y-m-d', strtotime('+7 days'));
$in30days = date('Y-m-d', strtotime('+30 days'));

$actions = [];

/* ---------- automation rules (Trigger: Stage Changed) ---------- */
switch ($stage) {

    case 'New Lead':
        if (add_task_once($dir, 'Call new lead: ' . $name, 'Call', $tomorrow, 'High', $email, $key)) {
            $actions[] = 'Created initial call task';
        }
        break;

    case 'Pending Call':
        if (add_task_once($dir, 'Call reminder: ' . $name, 'Call', $tomorrow, 'High', $email, $key)) {
            $actions[] = 'Created call reminder task';
        }
        break;

    case 'Pending CV / Resume':
        // 48-hour CV follow-up reminder
        if (add_task_once($dir, 'CV follow-up (48h): ' . $name, 'Document Collection', $in2days, 'Normal', $email, $key)) {
            $actions[] = 'Created CV follow-up task (48h)';
        }
        break;

    case 'Pending Appointment':
        if (add_task_once($dir, 'Book appointment: ' . $name, 'Follow-up', $tomorrow, 'High', $email, $key)) {
            $actions[] = 'Created appointment booking task';
        }
        break;

    case 'Appointment Scheduled':
        if (add_task_once($dir, 'Confirm & send calendar invite: ' . $name, 'Consultation', $tomorrow, 'High', $email, $key)) {
            $actions[] = 'Created consultation confirmation task';
        }
        break;

    case 'Pending Follow-up':
        if (add_task_once($dir, 'Follow-up call: ' . $name, 'Follow-up', $in2days, 'Normal', $email, $key)) {
            $actions[] = 'Created follow-up task';
        }
        break;

    case 'Under Assessment':
        if (add_task_once($dir, 'Complete eligibility assessment: ' . $name, 'Follow-up', $in7days, 'High', $email, $key)) {
            $actions[] = 'Created assessment review task';
        }
        break;

    case 'Future Lead':
        if (add_task_once($dir, 'Re-contact future lead: ' . $name, 'Follow-up', $in30days, 'Low', $email, $key)) {
            $actions[] = 'Scheduled 30-day future contact reminder';
        }
        break;

    case 'No Answer – Follow-up Sent':
        if (add_task_once($dir, 'Retry contact attempt: ' . $name, 'Call', $in2days, 'Normal', $email, $key)) {
            $actions[] = 'Created retry contact task';
        }
        break;

    case 'No Pickup – Email/WhatsApp Sent':
        if (add_task_once($dir, 'Callback (24-48h): ' . $name, 'Call', $in2days, 'Normal', $email, $key)) {
            $actions[] = 'Created callback task (24-48h)';
        }
        break;

    case 'Does Not Qualify':
        if (add_task_once($dir, 'Send eligibility outcome email: ' . $name, 'Email Follow-Up', $tomorrow, 'Normal', $email, $key)) {
            $actions[] = 'Created eligibility outcome email task';
        }
        break;

    case 'Signed Up':
        // Onboarding workflow
        add_task_once($dir, 'Create client profile & visa case: ' . $name, 'Follow-up', $today, 'High', $email, $key) && ($actions[] = 'Created client profile task');
        add_task_once($dir, 'Generate & send onboarding checklist: ' . $name, 'Document Collection', $in2days, 'High', $email, $key) && ($actions[] = 'Created onboarding checklist task');
        break;

    case 'Lost Lead':
        if (add_task_once($dir, 'Add to long-term marketing nurture: ' . $name, 'Email Follow-Up', $in7days, 'Low', $email, $key)) {
            $actions[] = 'Scheduled long-term nurture task';
        }
        break;

    default:
        // No automation rule for this stage — that is fine.
        break;
}

echo json_encode(['ok' => true, 'stage' => $stage, 'actions' => $actions]);
