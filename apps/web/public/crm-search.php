<?php
/**
 * Global Search API for iMigrate CRM
 *
 * Search across leads, cases, notes, emails, tasks
 * POST { q: "query" } → { ok, results: [{type, id, title, snippet, leadKey}] }
 */
header('Content-Type: application/json; charset=utf-8');

@include __DIR__ . '/admin-config.php';

// Accept the query from GET, POST form fields, OR a JSON request body.
// The CRM's api() helper sends application/json, which does NOT populate
// $_POST — without this, $q was always empty and search returned nothing.
$__body = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($__body)) $__body = [];
$q = trim(strtolower((string) ($_GET['q'] ?? $_POST['q'] ?? $__body['q'] ?? '')));
if (strlen($q) < 2) {
    echo json_encode(['ok' => true, 'results' => []]);
    exit;
}

$dir = __DIR__ . '/leads';
$results = [];

// Helper: load NDJSON
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

// Helper: fuzzy match + snippet
function fuzzy_match($text, $query) {
    return stripos($text, $query) !== false;
}

function snippet($text, $query, $len = 80) {
    $pos = stripos($text, $query);
    if ($pos === false) return substr($text, 0, $len) . '…';
    $start = max(0, $pos - 20);
    $end = min(strlen($text), $pos + strlen($query) + 60);
    return '…' . substr($text, $start, $end - $start) . '…';
}

// Load lead metadata (stage + soft-delete flag) keyed by ckey, so search can
// show the current stage and hide soft-deleted leads.
$meta = [];
if (is_file($dir . '/crm-meta.ndjson')) {
    foreach (file($dir . '/crm-meta.ndjson', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $row = json_decode($line, true);
        if (is_array($row) && !empty($row['key'])) $meta[$row['key']] = $row;
    }
}

// 1. LEADS
// Lead rows store their data under a `fields` object, and the stable contact
// key (ckey) is DERIVED (email, else "id:<id>") — it is not a top-level column.
// We group submissions by ckey so each contact appears once, matched on the
// latest non-empty value of name / email / mobile / whatsapp / occupation.
$leads = load_ndjson($dir . '/leads.ndjson');
$byKey = [];
foreach ($leads as $lead) {
    $f = is_array($lead['fields'] ?? null) ? $lead['fields'] : [];
    $email = strtolower(trim((string) ($f['email'] ?? '')));
    $ckey = $email !== '' ? $email : ('id:' . ($lead['id'] ?? ''));
    // latest non-empty wins
    $prev = $byKey[$ckey] ?? [];
    $byKey[$ckey] = [
        'ckey' => $ckey,
        'name' => ($f['fullName'] ?? $f['name'] ?? $prev['name'] ?? ''),
        'email' => ($email ?: ($prev['email'] ?? '')),
        'phone' => ($f['phone'] ?? $prev['phone'] ?? ''),
        'whatsapp' => ($f['whatsapp'] ?? $prev['whatsapp'] ?? ''),
        'occupation' => ($f['occupation'] ?? $prev['occupation'] ?? ''),
    ];
}
foreach ($byKey as $c) {
    if (fuzzy_match((string) $c['name'], $q) ||
        fuzzy_match((string) $c['email'], $q) ||
        fuzzy_match((string) $c['phone'], $q) ||
        fuzzy_match((string) $c['whatsapp'], $q) ||
        fuzzy_match((string) $c['occupation'], $q)) {
        $stage = $meta[$c['ckey']]['stage'] ?? ($meta[$c['email']]['stage'] ?? '');
        if (!empty($meta[$c['ckey']]['deleted']) || !empty($meta[$c['email']]['deleted'])) continue; // hide soft-deleted
        $results[] = [
            'type' => 'lead',
            'id' => $c['ckey'],
            'title' => $c['name'] ?: ($c['email'] ?: 'Unknown'),
            'snippet' => trim(($c['email'] ?: $c['phone']) . ($stage ? ' · ' . $stage : '')),
            'stage' => $stage,
            'email' => $c['email'],
        ];
    }
}

// 2. CASES
if (is_file($dir . '/cases.json')) {
    $cases_data = json_decode((string) file_get_contents($dir . '/cases.json'), true);
    if (is_array($cases_data['cases'] ?? null)) {
        foreach ($cases_data['cases'] as $case) {
            if (fuzzy_match($case['clientName'] ?? '', $q) ||
                fuzzy_match($case['visaType'] ?? '', $q) ||
                fuzzy_match($case['fileNumber'] ?? '', $q)) {
                $results[] = [
                    'type' => 'case',
                    'id' => $case['id'] ?? '',
                    'title' => ($case['clientName'] ?? 'Case') . ' — ' . ($case['visaType'] ?? 'Unknown'),
                    'snippet' => ($case['country'] ?? '') . ' · ' . ($case['status'] ?? '') . ' · File: ' . ($case['fileNumber'] ?? '—'),
                    'status' => $case['status'] ?? '',
                ];
            }
        }
    }
}

// 3. NOTES
$notes = load_ndjson($dir . '/crm-notes.ndjson');
foreach ($notes as $note) {
    if (fuzzy_match($note['text'] ?? '', $q)) {
        $leadName = $note['leadName'] ?? 'Unknown';
        $results[] = [
            'type' => 'note',
            'id' => $note['id'] ?? '',
            'title' => 'Note: ' . $leadName,
            'snippet' => snippet($note['text'] ?? '', $q),
            'leadKey' => $note['ckey'] ?? '',
            'createdAt' => $note['createdAt'] ?? '',
        ];
    }
}

// 4. TASKS
$tasks = load_ndjson($dir . '/crm-tasks.ndjson');
foreach ($tasks as $task) {
    if (fuzzy_match($task['title'] ?? '', $q)) {
        $results[] = [
            'type' => 'task',
            'id' => $task['id'] ?? '',
            'title' => $task['title'] ?? 'Task',
            'snippet' => ($task['type'] ?? '') . ' · ' . ($task['status'] ?? '') . ' · Due: ' . ($task['due'] ?? '—'),
            'leadKey' => $task['ckey'] ?? '',
            'status' => $task['status'] ?? '',
        ];
    }
}

// 5. EMAILS
$emails = load_ndjson($dir . '/crm-emails.ndjson');
foreach ($emails as $email) {
    if (fuzzy_match($email['subject'] ?? '', $q) ||
        fuzzy_match($email['to'] ?? '', $q) ||
        fuzzy_match($email['from'] ?? '', $q)) {
        $results[] = [
            'type' => 'email',
            'id' => $email['id'] ?? '',
            'title' => 'Email: ' . ($email['subject'] ?? 'No subject'),
            'snippet' => ($email['to'] ?? '') . ' · ' . ($email['at'] ?? ''),
            'leadKey' => $email['ckey'] ?? '',
            'status' => $email['status'] ?? '',
        ];
    }
}

// 6. DOCUMENTS (uploaded files, tied to a lead by ckey/leadEmail)
$docs = load_ndjson($dir . '/docs.ndjson');
foreach ($docs as $doc) {
    if (fuzzy_match($doc['name'] ?? '', $q) ||
        fuzzy_match($doc['category'] ?? '', $q)) {
        $results[] = [
            'type' => 'document',
            'id' => $doc['id'] ?? '',
            'title' => 'Document: ' . ($doc['name'] ?? 'file'),
            'snippet' => trim((string) ($doc['category'] ?? '') . ' · ' . (($doc['leadEmail'] ?? '') ?: 'unlinked')),
            'leadKey' => $doc['ckey'] ?? (strtolower((string) ($doc['leadEmail'] ?? ''))),
            'status' => '',
        ];
    }
}

// Sort by type (leads first, then others), limit to 30
usort($results, function($a, $b) {
    $typeOrder = ['lead' => 0, 'case' => 1, 'document' => 2, 'note' => 3, 'task' => 4, 'email' => 5];
    return ($typeOrder[$a['type']] ?? 99) - ($typeOrder[$b['type']] ?? 99);
});

$results = array_slice($results, 0, 30);

echo json_encode(['ok' => true, 'results' => $results]);
