<?php
/**
 * Global Search API for iMigrate CRM
 *
 * Search across leads, cases, notes, emails, tasks
 * POST { q: "query" } → { ok, results: [{type, id, title, snippet, leadKey}] }
 */
header('Content-Type: application/json; charset=utf-8');

@include __DIR__ . '/admin-config.php';

$q = trim(strtolower((string) ($_GET['q'] ?? $_POST['q'] ?? '')));
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

// 1. LEADS
$leads = load_ndjson($dir . '/leads.ndjson');
foreach ($leads as $lead) {
    if (fuzzy_match($lead['name'] ?? '', $q) ||
        fuzzy_match($lead['email'] ?? '', $q) ||
        fuzzy_match($lead['phone'] ?? '', $q) ||
        fuzzy_match($lead['occupation'] ?? '', $q)) {
        $results[] = [
            'type' => 'lead',
            'id' => $lead['ckey'] ?? '',
            'title' => $lead['name'] ?? 'Unknown',
            'snippet' => ($lead['email'] ?? '') . ' · ' . ($lead['stage'] ?? ''),
            'stage' => $lead['stage'] ?? '',
            'email' => $lead['email'] ?? '',
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

// Sort by type (leads first, then others), limit to 30
usort($results, function($a, $b) {
    $typeOrder = ['lead' => 0, 'case' => 1, 'note' => 2, 'task' => 3, 'email' => 4];
    return ($typeOrder[$a['type']] ?? 99) - ($typeOrder[$b['type']] ?? 99);
});

$results = array_slice($results, 0, 30);

echo json_encode(['ok' => true, 'results' => $results]);
