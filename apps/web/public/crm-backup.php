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

function make_snapshot($dir, $backupRoot, $type = 'manual') {
    $ts = date('Ymd-His');
    $dest = $backupRoot . '/' . $ts;
    if (!is_dir($dest)) @mkdir($dest, 0755, true);
    $files = 0; $bytes = 0;
    foreach (data_files($dir) as $f) {
        $name = basename($f);
        if (@copy($f, $dest . '/' . $name)) { $files++; $bytes += (int) @filesize($f); }
    }
    @file_put_contents($dest . '/_manifest.json', json_encode(['ts' => $ts, 'at' => date('c'), 'files' => $files, 'bytes' => $bytes, 'type' => $type]));
    return ['ts' => $ts, 'files' => $files, 'bytes' => $bytes, 'type' => $type];
}

function snap_leadcount($d) {
    $f = $d . '/leads.ndjson';
    if (!is_file($f)) return 0;
    $n = 0;
    foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) { if (trim($line) !== '') $n++; }
    return $n;
}
/* Integrity: every non-empty leads.ndjson line must be valid JSON. Empty store is valid. */
function snap_integrity($d) {
    $f = $d . '/leads.ndjson';
    if (!is_file($f)) return true;
    foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        if (trim($line) === '') continue;
        if (json_decode($line, true) === null) return false;
    }
    return true;
}
function snap_time($ts) { $dt = DateTime::createFromFormat('Ymd-His', substr($ts, 0, 15)); return $dt ? $dt->getTimestamp() : @strtotime(substr($ts, 0, 8)); }
function list_snapshots($backupRoot) {
    $out = [];
    foreach (glob($backupRoot . '/*', GLOB_ONLYDIR) ?: [] as $d) {
        $m = @json_decode((string) @file_get_contents($d . '/_manifest.json'), true);
        $out[] = ['ts' => basename($d), 'files' => $m['files'] ?? count(glob($d . '/*') ?: []), 'bytes' => $m['bytes'] ?? 0, 'at' => $m['at'] ?? '', 'type' => $m['type'] ?? 'manual', 'leads' => snap_leadcount($d), 'valid' => snap_integrity($d)];
    }
    usort($out, fn($a, $b) => strcmp($b['ts'], $a['ts']));
    return $out;
}

/* Take a daily snapshot only if the newest one is older than ~24h (zero-config auto-backup). */
function maybe_auto_snapshot($dir, $backupRoot) {
    $snaps = list_snapshots($backupRoot);
    $newest = $snaps[0] ?? null;
    if ($newest && (time() - snap_time($newest['ts'])) < 86400) return null; // fresh enough
    return make_snapshot($dir, $backupRoot, 'daily');
}

/* Tiered retention: keep ALL from the last 14 days, one per week for ~12 weeks,
   one per month for ~12 months; drop the rest. Newest in each bucket is kept. */
function prune_tiered($backupRoot) {
    $snaps = list_snapshots($backupRoot); // newest first
    $now = time(); $keep = []; $seenWeek = []; $seenMonth = []; $removed = 0;
    foreach ($snaps as $s) {
        $t = snap_time($s['ts']); $ageDays = ($now - $t) / 86400;
        if ($ageDays <= 14) { $keep[$s['ts']] = 1; continue; }
        if ($ageDays <= 90) { $wk = date('oW', $t); if (empty($seenWeek[$wk])) { $seenWeek[$wk] = 1; $keep[$s['ts']] = 1; } continue; }
        if ($ageDays <= 366) { $mo = date('Ym', $t); if (empty($seenMonth[$mo])) { $seenMonth[$mo] = 1; $keep[$s['ts']] = 1; } continue; }
    }
    foreach ($snaps as $s) {
        if (!empty($keep[$s['ts']])) continue;
        $d = $backupRoot . '/' . $s['ts'];
        foreach (glob($d . '/*') ?: [] as $f) @unlink($f);
        if (@rmdir($d)) $removed++;
    }
    return $removed;
}

if ($action === 'snapshot') {
    $snap = make_snapshot($dir, $backupRoot, $authCron ? 'pre-deploy' : 'manual');
    prune_tiered($backupRoot);
    echo json_encode(['ok' => true, 'snapshot' => $snap]);
    exit;
}

/* Zero-config automatic daily backup — called on CRM load; cheap + idempotent. */
if ($action === 'auto') {
    $snap = maybe_auto_snapshot($dir, $backupRoot);
    if ($snap) prune_tiered($backupRoot);
    echo json_encode(['ok' => true, 'snapshot' => $snap, 'created' => (bool) $snap]);
    exit;
}

/* Download a snapshot as a single JSON bundle (off-server copy). Admin only. */
if ($action === 'download') {
    if (!$authAdmin) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Admin only']); exit; }
    $ts = preg_replace('/[^0-9\-]/', '', (string) ($p['ts'] ?? ''));
    $src = $backupRoot . '/' . $ts;
    if ($ts === '' || !is_dir($src)) { http_response_code(404); echo json_encode(['ok' => false, 'error' => 'Snapshot not found']); exit; }
    $bundle = ['ts' => $ts, 'exportedAt' => date('c'), 'files' => []];
    foreach (glob($src . '/*') ?: [] as $f) {
        $name = basename($f);
        if ($name === '_manifest.json') continue;
        $bundle['files'][$name] = (string) @file_get_contents($f);
    }
    header('Content-Disposition: attachment; filename="imigrate-crm-backup-' . $ts . '.json"');
    echo json_encode($bundle, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'list') {
    if (!$authAdmin) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Admin only']); exit; }
    echo json_encode(['ok' => true, 'backups' => list_snapshots($backupRoot), 'current' => ['leads' => snap_leadcount($dir)]]);
    exit;
}

if ($action === 'prune') {
    if (!$authAdmin) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Admin only']); exit; }
    echo json_encode(['ok' => true, 'removed' => prune_tiered($backupRoot)]);
    exit;
}

if ($action === 'restore') {
    if (!$authAdmin) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Admin only']); exit; }
    $ts = preg_replace('/[^0-9\-]/', '', (string) ($p['ts'] ?? ''));
    $src = $backupRoot . '/' . $ts;
    if ($ts === '' || !is_dir($src)) { http_response_code(404); echo json_encode(['ok' => false, 'error' => 'Snapshot not found']); exit; }
    // Safety: snapshot current state before overwriting.
    $pre = make_snapshot($dir, $backupRoot, 'pre-restore');
    $restored = 0;
    foreach (glob($src . '/*.ndjson') ?: [] as $f) { if (@copy($f, $dir . '/' . basename($f))) $restored++; }
    foreach (glob($src . '/*.json') ?: [] as $f) { if (basename($f) === '_manifest.json') continue; if (@copy($f, $dir . '/' . basename($f))) $restored++; }
    echo json_encode(['ok' => true, 'restored' => $restored, 'from' => $ts, 'safetySnapshot' => $pre['ts']]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
