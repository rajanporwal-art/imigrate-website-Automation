<?php
/**
 * Server-side password check for the admin dashboard gate.
 *
 * The admin UI used to reveal itself purely client-side (any input unlocked
 * the editor). This endpoint validates the password against the single source
 * of truth in admin-config.php so anonymous users cannot open the dashboard.
 *
 * Returns {"ok":true} only when the password is correct.
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
$pw = is_array($payload) ? (string) ($payload['password'] ?? '') : '';

/* ---- per-IP brute-force rate limiting ---- */
$RL_MAX = 12;        // max failed attempts...
$RL_WINDOW = 900;    // ...within 15 minutes, then lock out for the window.
$ip = substr((string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? ''), 0, 64);
$rlDir = __DIR__ . '/leads';
if (!is_dir($rlDir)) { @mkdir($rlDir, 0755, true); }
$rlFile = $rlDir . '/.ratelimit.json';
$rl = is_file($rlFile) ? (json_decode((string) @file_get_contents($rlFile), true) ?: []) : [];
$now = time();
// Prune stale IP records to keep the file small.
foreach ($rl as $k => $v) { if (($v['t'] ?? 0) + $RL_WINDOW < $now) unset($rl[$k]); }
$mine = $rl[$ip] ?? ['n' => 0, 't' => $now];
if (($mine['t'] + $RL_WINDOW) >= $now && $mine['n'] >= $RL_MAX) {
    $retry = ($mine['t'] + $RL_WINDOW) - $now;
    header('Retry-After: ' . max(1, $retry));
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'Too many attempts. Please try again in a few minutes.']);
    exit;
}

// Constant-time comparison; small delay to slow brute-force attempts.
if ($pw === '' || !hash_equals($EDIT_PASSWORD, $pw)) {
    // Record the failed attempt (reset the window if it had elapsed).
    $mine = (($mine['t'] + $RL_WINDOW) < $now) ? ['n' => 1, 't' => $now] : ['n' => ($mine['n'] + 1), 't' => $mine['t']];
    $rl[$ip] = $mine;
    @file_put_contents($rlFile, json_encode($rl), LOCK_EX);
    usleep(400000);
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

// Success — clear this IP's failure counter.
if (isset($rl[$ip])) { unset($rl[$ip]); @file_put_contents($rlFile, json_encode($rl), LOCK_EX); }

echo json_encode(['ok' => true]);
