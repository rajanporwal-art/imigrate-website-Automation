<?php
/**
 * CRM data backup & restore (point-in-time snapshots of the record store).
 *
 * Snapshots every CRM data file (leads/*.ndjson + leads/*.json) into
 * leads/backups/<timestamp>/, keeping the most recent N. Designed to run
 * automatically BEFORE every deployment (called from CI) and optionally on a
 * daily cron, so lead records, notes, tasks, reports, emails, documents-index,
 * pipeline stages and overrides can always be restored.
 *
 * NOTE: CRM data already lives outside the deploy path (leads/ is excluded from
 * FTP deploys), so deployments cannot overwrite it. These snapshots are an extra
 * safety net + an explicit restore/rollback path.
 *
 * SNAPSHOT (no record mutation):
 *   GET  ?action=snapshot&key=<CRON_SECRET>     (for CI / cron)
 *   POST { password, action:'snapshot' }        (admin)
 * ADMIN (POST JSON { password, action }):
 *   'list'    -> { ok, backups:[ { ts, files, bytes } ] }
 *   'restore' -> { ts } restore a snapshot (auto-snapshots current state first)
 *   'prune'   -> keep newest N (default 30)
 */
@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }
$CRON_SECRET = isset($CRON_SECRET) ? $CRON_SECRET : '';
$KEEP = 30;

$dir = __DIR__ . '/leads';
$backupRoot = $dir . '/backups';
if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
if (!is_dir($backupRoot)) { @mkdir($backupRoot, 0755, true); }
@file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$p = [];
$authAdmin = false;
$authCron = false;

if ($method === 'POST') {
    $p = json_decode((string) file_get_contents('php://input'), true) ?: [];
    $authAdmin = hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''));
}
if (isset($_GET['key']) && $CRON_SECRET !== '') {
    $authCron = hash_equals($CRON_SECRET, (string) $_GET['key']);
}
$action = $p['action'] ?? ($_GET['action'] ?? 'snapshot');

if (!$authAdmin && !$authCron) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Not authorized']);
    exit;
}

/* Data files that make up the CRM record store. */
function data_files($dir) {
    $out = [];
    foreach (glob($dir . '/*.ndjson') ?: [] as $f) $out[] = $f;
    foreach (glob($dir . '/*.json') ?: [] as $f) $out[] = $f;
    return $out;
}

function make_snapshot($dir, $backupRoot) {
    $ts = date('Ymd-His');
    $dest = $backupRoot . '/' . $ts;
    if (!is_dir($dest)) @mkdir($dest, 0755, true);
    $files = 0; $bytes = 0;
    foreach (data_files($dir) as $f) {
        $name = basename($f);
        if (@copy($f, $dest . '/' . $name)) { $files++; $bytes += (int) @filesize($f); }
    }
    @file_put_contents($dest . '/_manifest.json', json_encode(['ts' => $ts, 'at' => date('c'), 'files' => $files, 'bytes' => $bytes]));
    return ['ts' => $ts, 'files' => $files, 'bytes' => $bytes];
}

function list_snapshots($backupRoot) {
    $out = [];
    foreach (glob($backupRoot . '/*', GLOB_ONLYDIR) ?: [] as $d) {
        $m = @json_decode((string) @file_get_contents($d . '/_manifest.json'), true);
        $out[] = ['ts' => basename($d), 'files' => $m['files'] ?? count(glob($d . '/*') ?: []), 'bytes' => $m['bytes'] ?? 0, 'at' => $m['at'] ?? ''];
    }
    usort($out, fn($a, $b) => strcmp($b['ts'], $a['ts']));
    return $out;
}

function prune_snapshots($backupRoot, $keep) {
    $snaps = list_snapshots($backupRoot);
    $removed = 0;
    foreach (array_slice($snaps, $keep) as $s) {
        $d = $backupRoot . '/' . $s['ts'];
        foreach (glob($d . '/*') ?: [] as $f) @unlink($f);
        if (@rmdir($d)) $removed++;
    }
    return $removed;
}

if ($action === 'snapshot') {
    $snap = make_snapshot($dir, $backupRoot);
    prune_snapshots($backupRoot, $KEEP);
    echo json_encode(['ok' => true, 'snapshot' => $snap]);
    exit;
}

if ($action === 'list') {
    if (!$authAdmin) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Admin only']); exit; }
    echo json_encode(['ok' => true, 'backups' => list_snapshots($backupRoot)]);
    exit;
}

if ($action === 'prune') {
    if (!$authAdmin) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Admin only']); exit; }
    $keep = max(1, (int) ($p['keep'] ?? $KEEP));
    echo json_encode(['ok' => true, 'removed' => prune_snapshots($backupRoot, $keep)]);
    exit;
}

if ($action === 'restore') {
    if (!$authAdmin) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Admin only']); exit; }
    $ts = preg_replace('/[^0-9\-]/', '', (string) ($p['ts'] ?? ''));
    $src = $backupRoot . '/' . $ts;
    if ($ts === '' || !is_dir($src)) { http_response_code(404); echo json_encode(['ok' => false, 'error' => 'Snapshot not found']); exit; }
    // Safety: snapshot current state before overwriting.
    $pre = make_snapshot($dir, $backupRoot);
    $restored = 0;
    foreach (glob($src . '/*.ndjson') ?: [] as $f) { if (@copy($f, $dir . '/' . basename($f))) $restored++; }
    foreach (glob($src . '/*.json') ?: [] as $f) { if (basename($f) === '_manifest.json') continue; if (@copy($f, $dir . '/' . basename($f))) $restored++; }
    echo json_encode(['ok' => true, 'restored' => $restored, 'from' => $ts, 'safetySnapshot' => $pre['ts']]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
