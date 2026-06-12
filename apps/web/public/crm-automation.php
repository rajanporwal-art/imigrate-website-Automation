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

$autoFile  = $dir . '/automations.json';
$logFile   = $dir . '/automation-log.ndjson';
$notifFile = $dir . '/notifications.ndjson';

/* ---------- configurable rules engine (Trigger → Condition → Action) ---------- */
function rules_load($f) { if (is_file($f)) { $d = json_decode((string) file_get_contents($f), true); return is_array($d) ? $d : []; } return []; }
function rules_save($f, $d) { return @file_put_contents($f, json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false; }
function autolog($f, $row) { @file_put_contents($f, json_encode($row) . "\n", FILE_APPEND | LOCK_EX); }
function rule_cond_ok($rule, $ctx) {
    if (!empty($rule['stage']) && ($ctx['stage'] ?? '') !== $rule['stage']) return false;
    if (!empty($rule['condCat']) && ($ctx['cat'] ?? '') !== $rule['condCat']) return false;
    if (!empty($rule['condSource']) && ($ctx['source'] ?? '') !== $rule['condSource']) return false;
    return true;
}
function exec_action($a, $ctx, $dir, $notifFile) {
    $type = (string) ($a['type'] ?? '');
    $name = $ctx['name']; $email = $ctx['email']; $key = $ctx['key'];
    $fill = function ($s) use ($ctx) { return str_replace(['{{name}}', '{{occupation}}', '{{stage}}'], [$ctx['name'], $ctx['occupation'] ?? '', $ctx['stage'] ?? ''], (string) $s); };
    if ($type === 'task') {
        $title = $fill($a['title'] ?? ('Task: ' . $name));
        $due = date('Y-m-d', strtotime('+' . max(0, (int) ($a['dueDays'] ?? 1)) . ' days'));
        add_task_once($dir, $title, (string) ($a['taskType'] ?? 'Follow-up'), $due, (string) ($a['priority'] ?? 'Normal'), $email, $key);
        return 'Created task: ' . $title;
    }
    if ($type === 'notification') {
        $msg = $fill($a['message'] ?? '');
        @file_put_contents($notifFile, json_encode(['id' => auto_id(), 'at' => date('c'), 'message' => $msg, 'ckey' => $key, 'lead' => $name, 'read' => false]) . "\n", FILE_APPEND | LOCK_EX);
        return 'Notification: ' . $msg;
    }
    if ($type === 'send-email') {
        $subject = $fill($a['subject'] ?? ('Update for ' . $name));
        $body    = $fill($a['body'] ?? '<p>Hi {{name}},</p><p>Following up on your immigration inquiry.</p><p>Warm regards,<br>iMigrate Migration Solutions</p>');
        if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) && is_file(__DIR__ . '/crm-email.php')) {
            $payload = json_encode(['action' => 'send', 'password' => $EDIT_PASSWORD, 'ckey' => $key, 'to' => $email, 'toName' => $name, 'subject' => $subject, 'html' => $body, 'author' => 'Automation', 'template' => 'automation']);
            $ctx2 = stream_context_create(['http' => ['method' => 'POST', 'header' => "Content-Type: application/json\r\n", 'content' => $payload, 'timeout' => 15]]);
            $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host  = $_SERVER['HTTP_HOST'] ?? 'www.imigratesolution.com';
            @file_get_contents($proto . '://' . $host . '/crm-email.php', false, $ctx2);
        }
        return 'Email sent to ' . $email . ': ' . $subject;
    }
    if ($type === 'webhook') {
        $url = (string) ($a['url'] ?? '');
        if ($url !== '' && function_exists('curl_init') && preg_match('#^https?://#i', $url)) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_TIMEOUT => 8, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode(['event' => $ctx['trigger'] ?? '', 'stage' => $ctx['stage'] ?? '', 'lead' => $name, 'email' => $email, 'cat' => $ctx['cat'] ?? '', 'at' => date('c')])]);
            curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
            return 'Webhook → ' . $url . ' (HTTP ' . $code . ')';
        }
        return 'Webhook skipped (missing/invalid URL)';
    }
    return '';
}
function run_user_rules($autoFile, $logFile, $notifFile, $dir, $trigger, $ctx) {
    $out = [];
    foreach (rules_load($autoFile) as $rule) {
        if (empty($rule['enabled'])) continue;
        if (($rule['trigger'] ?? 'Status Changed') !== $trigger) continue;
        if (!rule_cond_ok($rule, $ctx)) continue;
        foreach (($rule['actions'] ?? []) as $a) {
            $res = exec_action($a, $ctx, $dir, $notifFile);
            if ($res) { $out[] = $res; autolog($logFile, ['at' => date('c'), 'rule' => $rule['name'] ?? '', 'trigger' => $trigger, 'lead' => $ctx['name'], 'action' => $res]); }
        }
    }
    return $out;
}

$action  = (string) ($p['action'] ?? 'run');
$trigger = (string) ($p['trigger'] ?? 'Status Changed');

/* ---- TIME-BASED INACTIVITY CHECK (run from cron) ---- */
if ($action === 'check-inactivity') {
    $checkKey = (string) ($p['checkKey'] ?? '');
    if ($checkKey !== ($CRON_SECRET ?? '')) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Forbidden']);
        exit;
    }
    // Load all leads and check for inactivity
    $leads = [];
    if (is_file($dir . '/leads.ndjson')) {
        foreach (file($dir . '/leads.ndjson', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $l) {
            $r = json_decode($l, true);
            if (is_array($r)) $leads[] = $r;
        }
    }
    $actionsRun = 0;
    foreach ($leads as $lead) {
        $lastAct = $lead['lastActivity'] ?? $lead['createdAt'] ?? date('c');
        $hoursSince = (time() - strtotime($lastAct)) / 3600;
        $daysSince = $hoursSince / 24;
        // Check rules with inactivity triggers
        $rules = rules_load($autoFile);
        foreach ($rules as $rule) {
            if (empty($rule['enabled'])) continue;
            // "Days Since Activity" trigger
            if (($rule['trigger'] ?? '') === 'Days Since Activity') {
                $threshold = (int) ($rule['daysThreshold'] ?? 7);
                if ($daysSince >= $threshold && $daysSince < ($threshold + 1)) {
                    // This lead just hit the threshold
                    $ctx = ['stage' => $lead['stage'] ?? '', 'name' => $lead['name'] ?? '', 'email' => $lead['email'] ?? '', 'key' => $lead['ckey'] ?? '', 'trigger' => 'Days Since Activity', 'cat' => $lead['scoreCategory'] ?? '', 'source' => $lead['source'] ?? '', 'occupation' => $lead['occupation'] ?? ''];
                    foreach (($rule['actions'] ?? []) as $a) {
                        $res = exec_action($a, $ctx, $dir, $notifFile);
                        if ($res) { $actionsRun++; autolog($logFile, ['at' => date('c'), 'rule' => $rule['name'] ?? '', 'trigger' => 'Days Since Activity', 'lead' => $ctx['name'], 'action' => $res]); }
                    }
                }
            }
        }
    }
    echo json_encode(['ok' => true, 'checked' => count($leads), 'actionsRun' => $actionsRun]);
    exit;
}

/* ---- rule management + logs (Automation Center) ---- */
if ($action === 'rules-list') { echo json_encode(['ok' => true, 'rules' => rules_load($autoFile)]); exit; }
if ($action === 'rule-save') {
    $rules = rules_load($autoFile);
    $in = is_array($p['rule'] ?? null) ? $p['rule'] : [];
    $id = (string) ($in['id'] ?? '');
    $rule = [
        'id' => $id ?: ('R-' . auto_id()),
        'name' => substr(trim((string) ($in['name'] ?? 'Rule')), 0, 80) ?: 'Rule',
        'enabled' => isset($in['enabled']) ? (bool) $in['enabled'] : true,
        'trigger' => substr((string) ($in['trigger'] ?? 'Status Changed'), 0, 40),
        'stage' => substr((string) ($in['stage'] ?? ''), 0, 60),
        'condCat' => substr((string) ($in['condCat'] ?? ''), 0, 20),
        'condSource' => substr((string) ($in['condSource'] ?? ''), 0, 20),
        'actions' => is_array($in['actions'] ?? null) ? array_slice($in['actions'], 0, 10) : [],
        'updatedAt' => date('c'),
    ];
    $idx = null; foreach ($rules as $i => $r) if (($r['id'] ?? '') === $id) $idx = $i;
    if ($idx === null) $rules[] = $rule; else $rules[$idx] = $rule;
    rules_save($autoFile, $rules);
    echo json_encode(['ok' => true, 'id' => $rule['id']]); exit;
}
if ($action === 'rule-delete') {
    $rules = array_values(array_filter(rules_load($autoFile), fn($r) => ($r['id'] ?? '') !== (string) ($p['id'] ?? '')));
    rules_save($autoFile, $rules);
    echo json_encode(['ok' => true]); exit;
}
if ($action === 'log') {
    $r = []; if (is_file($logFile)) foreach (array_reverse(file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES)) as $l) { $x = json_decode($l, true); if (is_array($x)) $r[] = $x; if (count($r) >= 150) break; }
    echo json_encode(['ok' => true, 'log' => $r]); exit;
}
if ($action === 'notifications') {
    $r = []; if (is_file($notifFile)) foreach (array_reverse(file($notifFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES)) as $l) { $x = json_decode($l, true); if (is_array($x)) $r[] = $x; if (count($r) >= 100) break; }
    echo json_encode(['ok' => true, 'notifications' => $r]); exit;
}

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
$ctx = ['stage' => $stage, 'name' => $name, 'email' => $email, 'key' => $key, 'trigger' => $trigger, 'cat' => (string) ($p['cat'] ?? ''), 'source' => (string) ($p['source'] ?? ''), 'points' => (int) ($p['points'] ?? 0), 'occupation' => substr((string) ($p['occupation'] ?? ''), 0, 80)];

/* ---------- built-in automation rules (Trigger: Status Changed) ---------- */
if ($trigger === 'Status Changed')
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

/* ---------- user-defined rules (Automation Center) ---------- */
$actions = array_merge($actions, run_user_rules($autoFile, $logFile, $notifFile, $dir, $trigger, $ctx));

echo json_encode(['ok' => true, 'stage' => $stage, 'trigger' => $trigger, 'actions' => $actions]);
