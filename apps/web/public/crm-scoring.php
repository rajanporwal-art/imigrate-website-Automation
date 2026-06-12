<?php
/**
 * Lead Scoring Engine for iMigrate CRM
 *
 * Auto-calculate and update lead engagement scores based on:
 * - Email opens (+5)
 * - Email clicks (+10)
 * - Meetings (+30)
 * - Calls (+10)
 * - Replies (+20)
 * - Notes added (+2)
 * - No response penalty (-15 per week)
 *
 * POST { action: 'calculate-score', ckey: 'key' }
 * POST { action: 'log-event', ckey: 'key', event: 'email_open|email_click|call|meeting|reply', value: N }
 */
header('Content-Type: application/json; charset=utf-8');

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

$action = (string) ($p['action'] ?? '');
$ckey = (string) ($p['ckey'] ?? '');

/* ---- log engagement event ---- */
if ($action === 'log-event') {
    $event = (string) ($p['event'] ?? '');
    $scoreMap = [
        'email_open' => 5,
        'email_click' => 10,
        'call' => 10,
        'meeting' => 30,
        'reply' => 20,
        'note' => 2,
    ];
    $points = $scoreMap[$event] ?? 0;
    if (!$points) {
        echo json_encode(['ok' => false, 'error' => 'Unknown event type']);
        exit;
    }

    // Load leads and update score
    $leads = load_ndjson($dir . '/leads.ndjson');
    $updated = false;
    foreach ($leads as &$lead) {
        if (($lead['ckey'] ?? '') === $ckey) {
            $lead['score'] = (int) ($lead['score'] ?? 0) + $points;
            $lead['lastScoreUpdate'] = date('c');
            $updated = true;
            break;
        }
    }
    if ($updated && save_ndjson($dir . '/leads.ndjson', $leads)) {
        echo json_encode(['ok' => true, 'points' => $points, 'action' => $event]);
    } else {
        echo json_encode(['ok' => false, 'error' => 'Update failed']);
    }
    exit;
}

/* ---- calculate score for a lead (full recalc) ---- */
if ($action === 'calculate-score') {
    $leads = load_ndjson($dir . '/leads.ndjson');
    $lead = null;
    $idx = null;
    foreach ($leads as $i => $l) {
        if (($l['ckey'] ?? '') === $ckey) {
            $lead = $l;
            $idx = $i;
            break;
        }
    }
    if (!$lead) {
        echo json_encode(['ok' => false, 'error' => 'Lead not found']);
        exit;
    }

    // Calculate base score from engagement
    $score = 0;
    $emails = load_ndjson($dir . '/crm-emails.ndjson');
    $tasks = load_ndjson($dir . '/crm-tasks.ndjson');
    $notes = load_ndjson($dir . '/crm-notes.ndjson');

    // Count email interactions
    foreach ($emails as $e) {
        if (($e['ckey'] ?? '') === $ckey) {
            if ($e['status'] === 'opened') $score += 5;
            if ($e['clicked']) $score += 10;
            if ($e['replied']) $score += 20;
        }
    }

    // Count tasks (completed)
    foreach ($tasks as $t) {
        if (($t['ckey'] ?? '') === $ckey && ($t['status'] ?? '') === 'Done') {
            if (($t['type'] ?? '') === 'Call') $score += 10;
            if (($t['type'] ?? '') === 'Meeting') $score += 30;
        }
    }

    // Count recent notes
    $oneWeekAgo = date('c', strtotime('-7 days'));
    foreach ($notes as $n) {
        if (($n['ckey'] ?? '') === $ckey && ($n['createdAt'] ?? '') > $oneWeekAgo) {
            $score += 2;
        }
    }

    // Penalty: no activity in X days
    $lastActivity = $lead['lastActivity'] ?? $lead['createdAt'] ?? date('c');
    $daysSinceActivity = (time() - strtotime($lastActivity)) / (24 * 3600);
    if ($daysSinceActivity > 7) {
        $score -= (int) floor($daysSinceActivity / 7) * 15; // -15 per week
    }

    $score = max(0, $score); // Never go below 0

    // Determine category
    $category = 'Cold';
    if ($score >= 50) $category = 'Hot';
    elseif ($score >= 20) $category = 'Warm';
    elseif ($score >= 5) $category = 'Sales Ready';

    // Update lead
    $lead['score'] = $score;
    $lead['scoreCategory'] = $category;
    $lead['lastScoreCalculation'] = date('c');
    $leads[$idx] = $lead;
    save_ndjson($dir . '/leads.ndjson', $leads);

    echo json_encode(['ok' => true, 'ckey' => $ckey, 'score' => $score, 'category' => $category]);
    exit;
}

/* ---- get lead score ---- */
if ($action === 'get-score') {
    $leads = load_ndjson($dir . '/leads.ndjson');
    foreach ($leads as $lead) {
        if (($lead['ckey'] ?? '') === $ckey) {
            echo json_encode(['ok' => true, 'score' => $lead['score'] ?? 0, 'category' => $lead['scoreCategory'] ?? 'Cold']);
            exit;
        }
    }
    echo json_encode(['ok' => false, 'error' => 'Lead not found']);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);
