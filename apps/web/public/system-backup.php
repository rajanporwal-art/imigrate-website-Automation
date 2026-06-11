<?php
/**
 * system-backup.php — unified, dual-destination backup & recovery for the whole
 * iMigrate admin platform (CRM + Portal + CMS overrides + config + integrations).
 *
 * WHAT IS BACKED UP (the full durable state — the same set that is excluded from
 * deploys, so deploys never touch it):
 *   leads/            CRM records, notes, tasks, reports, cases, invoices,
 *                     automations, m365 OAuth tokens, ratelimit, etc.
 *   auth/             portal users + integrations.json (all connector creds)
 *   ai-data/          Claude API key + AI drafts/config
 *   cms-overrides/    durable CMS content edits
 *   cms-versions/     CMS version history
 *   hubspot.json      HubSpot portal/form config
 *   m365-config.php   Microsoft 365 Azure app credentials
 *   forms.json        form definitions
 *
 * DUAL STORAGE (independent — one failing never blocks the other):
 *   1. Hostinger server : system-backups/<ts>/ (+ a live mirror in system-backups/latest/)
 *   2. OneDrive         : one JSON bundle per backup in "iMigrate System Backups"
 *
 * SAFETY:
 *   - Never overwrites a populated backup/mirror with an empty one.
 *   - Every restore snapshots current state first (pre-restore) => reversible.
 *   - Tiered retention + capped granular history keeps the store bounded.
 *   - Every event is written to an append-only audit log.
 *
 * AUTH:  POST JSON { password|svc, action, ... }  (admin)  OR  ?key=<CRON_SECRET> (CI/cron)
 *
 * ACTIONS:
 *   change            throttled real-time backup (server + OneDrive) after a CRM/portal change
 *   snapshot          force a full server snapshot now
 *   onedrive-backup   force a full OneDrive bundle now
 *   backup-now        force BOTH now
 *   list              list server snapshots (newest first)
 *   onedrive-list     list OneDrive bundles
 *   restore           { ts }   restore/rollback from a server snapshot
 *   onedrive-restore  { file } restore/rollback from a OneDrive bundle
 *   download          { ts }   download a server snapshot as one JSON bundle
 *   audit             recent audit-log entries
 *   prune             apply retention now
 *   status            quick health (last server/onedrive backup, counts)
 */

@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }
$CRON_SECRET = isset($CRON_SECRET) ? $CRON_SECRET : '';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$ROOT       = __DIR__;
$BK         = $ROOT . '/system-backups';
$MIRROR     = $BK . '/latest';
$AUDIT      = $BK . '/audit.ndjson';
$STATE      = $BK . '/.state.json';
if (!is_dir($BK)) { @mkdir($BK, 0755, true); }
@file_put_contents($BK . '/.htaccess', "Require all denied\nDeny from all\n");

/* ---- durable sources (relative to web root). Small text/JSON only for the
   frequent on-change backup; media is large and handled by full snapshots. ---- */
$CORE_DIRS  = ['leads', 'auth', 'ai-data', 'cms-overrides', 'cms-versions'];
$CORE_FILES = ['hubspot.json', 'm365-config.php', 'forms.json'];
/* never recurse into our own backups or volatile junk */
$SKIP_DIRS  = ['backups', 'system-backups'];
$SKIP_RE    = '/(\.bak$|\.prewrite\.bak$|\.ratelimit\.json$|\.htaccess$|~$)/';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$p = [];
$authAdmin = false; $authCron = false;
if ($method === 'POST') {
    $p = json_decode((string) file_get_contents('php://input'), true) ?: [];
    $authAdmin = hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? $p['svc'] ?? ''));
}
if (isset($_GET['key']) && $CRON_SECRET !== '') { $authCron = hash_equals($CRON_SECRET, (string) $_GET['key']); }
$action = $p['action'] ?? ($_GET['action'] ?? 'status');
if (!$authAdmin && !$authCron) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Not authorized']); exit; }

/* ----------------------------------------------------------------- helpers */

function state_load($f) { return is_file($f) ? (json_decode((string) @file_get_contents($f), true) ?: []) : []; }
function state_save($f, $s) { @file_put_contents($f, json_encode($s), LOCK_EX); }

function audit_log($file, $event, $detail = []) {
    $row = ['at' => date('c'), 'event' => $event, 'ip' => substr((string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? ''), 0, 64)] + $detail;
    @file_put_contents($file, json_encode($row, JSON_UNESCAPED_SLASHES) . "\n", FILE_APPEND | LOCK_EX);
}

/* Recursively collect [relpath => abspath] for every durable source file. */
function gather_sources($root, $dirs, $files, $skipDirs, $skipRe) {
    $out = [];
    foreach ($files as $f) { $abs = $root . '/' . $f; if (is_file($abs)) $out[$f] = $abs; }
    foreach ($dirs as $d) {
        $base = $root . '/' . $d;
        if (!is_dir($base)) continue;
        $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::SELF_FIRST);
        foreach ($it as $fi) {
            if (!$fi->isFile()) continue;
            $abs = $fi->getPathname();
            $rel = ltrim(str_replace($root, '', $abs), '/');
            $parts = explode('/', $rel);
            $skip = false;
            foreach ($parts as $seg) { if (in_array($seg, $skipDirs, true)) { $skip = true; break; } }
            if ($skip) continue;
            if (preg_match($skipRe, $rel)) continue;
            $out[$rel] = $abs;
        }
    }
    return $out;
}

/* Total meaningful bytes — used to detect "do we have data worth protecting?" */
function sources_bytes($map) { $n = 0; foreach ($map as $abs) { $n += (int) @filesize($abs); } return $n; }
function leads_count($root) {
    $f = $root . '/leads/leads.ndjson';
    if (!is_file($f)) return 0;
    $n = 0; foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $l) { if (trim($l) !== '') $n++; }
    return $n;
}
function leads_valid($root) {
    $f = $root . '/leads/leads.ndjson';
    if (!is_file($f)) return true;
    foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $l) { if (trim($l) === '') continue; if (json_decode($l, true) === null) return false; }
    return true;
}
function snap_time($ts) { $dt = DateTime::createFromFormat('Ymd-His', substr($ts, 0, 15)); return $dt ? $dt->getTimestamp() : @strtotime(substr($ts, 0, 8)); }

/* Write a file, creating parent dirs. */
function put_file($dest, $content) {
    $dir = dirname($dest);
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    return @file_put_contents($dest, $content, LOCK_EX) !== false;
}

/* ---- SERVER snapshot ------------------------------------------------------ */
function make_server_snapshot($root, $bk, $map, $type) {
    $ts = date('Ymd-His');
    $dest = $bk . '/' . $ts;
    @mkdir($dest, 0755, true);
    $files = 0; $bytes = 0;
    foreach ($map as $rel => $abs) {
        if (put_file($dest . '/' . $rel, (string) @file_get_contents($abs))) { $files++; $bytes += (int) @filesize($abs); }
    }
    $manifest = ['ts' => $ts, 'at' => date('c'), 'type' => $type, 'files' => $files, 'bytes' => $bytes,
                 'leads' => leads_count($root), 'leadsValid' => leads_valid($root)];
    @file_put_contents($dest . '/_manifest.json', json_encode($manifest));
    return $manifest;
}

/* Always-current server MIRROR (second independent on-server copy). Empty-guarded. */
function update_mirror($root, $mirror, $map) {
    if (!is_dir($mirror)) @mkdir($mirror, 0755, true);
    // Guard: if the new state has no leads but the mirror already holds leads, keep the mirror.
    $newLeads = leads_count($root);
    $mf = $mirror . '/leads/leads.ndjson';
    $hadLeads = 0; if (is_file($mf)) { foreach (file($mf, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $l) { if (trim($l) !== '') $hadLeads++; } }
    if ($newLeads === 0 && $hadLeads > 0) return ['ok' => false, 'skipped' => 'would empty mirror'];
    $files = 0;
    foreach ($map as $rel => $abs) { if (put_file($mirror . '/' . $rel, (string) @file_get_contents($abs))) $files++; }
    @file_put_contents($mirror . '/_manifest.json', json_encode(['at' => date('c'), 'files' => $files, 'leads' => $newLeads]));
    return ['ok' => true, 'files' => $files];
}

function list_server_snapshots($bk) {
    $out = [];
    foreach (glob($bk . '/*', GLOB_ONLYDIR) ?: [] as $d) {
        $name = basename($d);
        if ($name === 'latest') continue;
        $m = @json_decode((string) @file_get_contents($d . '/_manifest.json'), true) ?: [];
        $out[] = ['ts' => $name, 'at' => $m['at'] ?? '', 'type' => $m['type'] ?? 'manual',
                  'files' => $m['files'] ?? 0, 'bytes' => $m['bytes'] ?? 0,
                  'leads' => $m['leads'] ?? 0, 'valid' => $m['leadsValid'] ?? true];
    }
    usort($out, fn($a, $b) => strcmp($b['ts'], $a['ts']));
    return $out;
}

/* Retention: keep ALL <=2 days, newest 40 'change', one/day <=14d, one/week <=90d,
   one/month <=12mo. */
function prune_server($bk) {
    $snaps = list_server_snapshots($bk); $now = time();
    $keep = []; $seenDay = []; $seenWeek = []; $seenMonth = []; $changeKept = 0; $removed = 0;
    foreach ($snaps as $s) {
        $t = snap_time($s['ts']); $age = ($now - $t) / 86400; $isChange = $s['type'] === 'change';
        if ($age <= 2) { $keep[$s['ts']] = 1; continue; }
        if ($isChange) { if ($changeKept < 40) { $changeKept++; $keep[$s['ts']] = 1; } continue; }
        if ($age <= 14) { $d = date('Ymd', $t); if (empty($seenDay[$d])) { $seenDay[$d] = 1; $keep[$s['ts']] = 1; } continue; }
        if ($age <= 90) { $w = date('oW', $t); if (empty($seenWeek[$w])) { $seenWeek[$w] = 1; $keep[$s['ts']] = 1; } continue; }
        if ($age <= 366) { $mo = date('Ym', $t); if (empty($seenMonth[$mo])) { $seenMonth[$mo] = 1; $keep[$s['ts']] = 1; } continue; }
    }
    foreach ($snaps as $s) {
        if (!empty($keep[$s['ts']])) continue;
        $d = $bk . '/' . $s['ts'];
        $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($d, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($it as $fi) { $fi->isDir() ? @rmdir($fi->getPathname()) : @unlink($fi->getPathname()); }
        if (@rmdir($d)) $removed++;
    }
    return $removed;
}

/* ---- ONEDRIVE bundle ------------------------------------------------------ */
function onedrive_push_full($root, $map) {
    if (!is_file($root . '/m365-lib.php')) return ['ok' => false, 'error' => 'Microsoft 365 not configured'];
    require_once $root . '/m365-lib.php';
    if (!function_exists('m365_is_connected') || !m365_is_connected()) return ['ok' => false, 'error' => 'Microsoft 365 not connected'];
    $bundle = ['source' => 'iMigrate System Backup', 'exportedAt' => date('c'), 'leads' => leads_count($root), 'files' => []];
    foreach ($map as $rel => $abs) { $bundle['files'][$rel] = base64_encode((string) @file_get_contents($abs)); }
    $name = 'imigrate-system-' . date('Ymd-His') . '.json';
    $res = m365_onedrive_upload($name, json_encode($bundle, JSON_UNESCAPED_SLASHES), 'iMigrate System Backups');
    return $res ? ['ok' => true, 'file' => $name, 'count' => count($bundle['files'])] : ['ok' => false, 'error' => 'OneDrive upload failed'];
}
function onedrive_list_full($root) {
    if (!is_file($root . '/m365-lib.php')) return null;
    require_once $root . '/m365-lib.php';
    if (!function_exists('m365_is_connected') || !m365_is_connected()) return null;
    $files = function_exists('m365_onedrive_list') ? m365_onedrive_list('iMigrate System Backups') : [];
    $out = [];
    foreach ($files as $f) { if (substr((string) ($f['name'] ?? ''), -5) !== '.json') continue; $out[] = ['name' => $f['name'], 'size' => (int) ($f['size'] ?? 0), 'modified' => $f['lastModifiedDateTime'] ?? '']; }
    return $out;
}

/* Restore a [rel => content] map into the web root. Empty-guarded + reversible. */
function restore_map($root, $bk, $map, $files) {
    // Safety: snapshot current state first.
    $curMap = $GLOBALS['__cur_map'];
    $pre = make_server_snapshot($root, $bk, $curMap, 'pre-restore');
    $restored = 0; $skipped = 0;
    foreach ($files as $rel => $content) {
        $rel = ltrim((string) $rel, '/');
        if ($rel === '' || strpos($rel, '..') !== false) { $skipped++; continue; }
        // never restore our own backup folder or htaccess junk
        if (preg_match('#^(system-backups|leads/backups)/#', $rel)) { $skipped++; continue; }
        // Guard: do not overwrite a populated leads file with an empty one.
        if (substr($rel, -len_leads()) === 'leads/leads.ndjson' && trim((string) $content) === '') { $skipped++; continue; }
        if (put_file($root . '/' . $rel, (string) $content)) $restored++; else $skipped++;
    }
    return ['restored' => $restored, 'skipped' => $skipped, 'pre' => $pre['ts']];
}
function len_leads() { return strlen('leads/leads.ndjson'); }

/* ----------------------------------------------------------------- dispatch */
$map = gather_sources($ROOT, $CORE_DIRS, $CORE_FILES, $SKIP_DIRS, $SKIP_RE);
$GLOBALS['__cur_map'] = $map;
$hasData = leads_count($ROOT) > 0 || sources_bytes($map) > 64;
$state = state_load($STATE);
$now = time();

if ($action === 'status') {
    echo json_encode(['ok' => true,
        'leads' => leads_count($ROOT), 'leadsValid' => leads_valid($ROOT),
        'sources' => count($map), 'bytes' => sources_bytes($map),
        'lastServer' => $state['lastServer'] ?? null,
        'lastOnedrive' => $state['lastOnedrive'] ?? null,
        'serverSnapshots' => count(list_server_snapshots($BK))]);
    exit;
}

/* Real-time, throttled, dual backup after any change. */
if ($action === 'change') {
    if (!$hasData) { echo json_encode(['ok' => true, 'skipped' => 'no data']); exit; }
    $MIRROR_THROTTLE = 15; $SNAP_THROTTLE = 45; $OD_THROTTLE = 300;
    $did = ['mirror' => false, 'snapshot' => false, 'onedrive' => false];
    // 1) always-current server mirror (second independent copy); lightly throttled
    if (($now - (int) ($state['lastMirror'] ?? 0)) >= $MIRROR_THROTTLE) {
        $mr = update_mirror($ROOT, $MIRROR, $map); $did['mirror'] = !empty($mr['ok']); $state['lastMirror'] = $now;
    }
    // 2) throttled point-in-time server snapshot
    if (($now - (int) ($state['lastServer'] ?? 0)) >= $SNAP_THROTTLE) {
        $snap = make_server_snapshot($ROOT, $BK, $map, 'change'); prune_server($BK);
        $state['lastServer'] = $now; $state['lastServerTs'] = $snap['ts']; $did['snapshot'] = true;
        audit_log($AUDIT, 'backup.server', ['type' => 'change', 'ts' => $snap['ts'], 'leads' => $snap['leads'], 'reason' => (string) ($p['reason'] ?? '')]);
    }
    // 3) throttled OneDrive bundle (independent of server outcome)
    if (($now - (int) ($state['lastOnedrive'] ?? 0)) >= $OD_THROTTLE) {
        $res = onedrive_push_full($ROOT, $map);
        if (!empty($res['ok'])) { $state['lastOnedrive'] = $now; $state['lastOnedriveFile'] = $res['file']; $did['onedrive'] = true; audit_log($AUDIT, 'backup.onedrive', ['file' => $res['file'], 'count' => $res['count']]); }
    }
    state_save($STATE, $state);
    echo json_encode(['ok' => true, 'did' => $did]);
    exit;
}

if ($action === 'snapshot' || $action === 'backup-now') {
    $snap = $hasData ? make_server_snapshot($ROOT, $BK, $map, $authCron ? 'pre-deploy' : 'manual') : null;
    if ($snap) { update_mirror($ROOT, $MIRROR, $map); prune_server($BK); $state['lastServer'] = $now; $state['lastServerTs'] = $snap['ts']; audit_log($AUDIT, 'backup.server', ['type' => $snap['type'], 'ts' => $snap['ts'], 'leads' => $snap['leads']]); }
    $od = null;
    if ($action === 'backup-now') { $od = onedrive_push_full($ROOT, $map); if (!empty($od['ok'])) { $state['lastOnedrive'] = $now; $state['lastOnedriveFile'] = $od['file']; audit_log($AUDIT, 'backup.onedrive', ['file' => $od['file'], 'count' => $od['count']]); } }
    state_save($STATE, $state);
    echo json_encode(['ok' => (bool) ($snap || (!empty($od['ok']))), 'server' => $snap, 'onedrive' => $od, 'noData' => !$hasData]);
    exit;
}

if ($action === 'onedrive-backup') {
    $od = onedrive_push_full($ROOT, $map);
    if (!empty($od['ok'])) { $state['lastOnedrive'] = $now; $state['lastOnedriveFile'] = $od['file']; state_save($STATE, $state); audit_log($AUDIT, 'backup.onedrive', ['file' => $od['file'], 'count' => $od['count']]); }
    else http_response_code(400);
    echo json_encode($od);
    exit;
}

if ($action === 'list') {
    echo json_encode(['ok' => true, 'backups' => list_server_snapshots($BK), 'current' => ['leads' => leads_count($ROOT)],
        'lastServer' => $state['lastServer'] ?? null, 'lastOnedrive' => $state['lastOnedrive'] ?? null, 'lastOnedriveFile' => $state['lastOnedriveFile'] ?? null]);
    exit;
}

if ($action === 'onedrive-list') {
    $files = onedrive_list_full($ROOT);
    if ($files === null) { echo json_encode(['ok' => false, 'error' => 'Microsoft 365 not connected']); exit; }
    echo json_encode(['ok' => true, 'files' => $files]);
    exit;
}

if ($action === 'audit') {
    $n = max(1, min(500, (int) ($p['limit'] ?? 100)));
    $rows = is_file($AUDIT) ? array_slice(array_filter(array_map('trim', file($AUDIT) ?: [])), -$n) : [];
    $out = []; foreach (array_reverse($rows) as $r) { $j = json_decode($r, true); if ($j) $out[] = $j; }
    echo json_encode(['ok' => true, 'events' => $out]);
    exit;
}

if ($action === 'prune') { $r = prune_server($BK); audit_log($AUDIT, 'prune', ['removed' => $r]); echo json_encode(['ok' => true, 'removed' => $r]); exit; }

/* Restore / rollback from a SERVER snapshot. */
if ($action === 'restore') {
    if (!$authAdmin) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Admin only']); exit; }
    $ts = preg_replace('/[^0-9\-]/', '', (string) ($p['ts'] ?? ''));
    $src = $BK . '/' . $ts;
    if ($ts === '' || !is_dir($src)) { http_response_code(404); echo json_encode(['ok' => false, 'error' => 'Snapshot not found']); exit; }
    $files = [];
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($src, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $fi) { if (!$fi->isFile()) continue; $rel = ltrim(str_replace($src, '', $fi->getPathname()), '/'); if ($rel === '_manifest.json') continue; $files[$rel] = (string) @file_get_contents($fi->getPathname()); }
    $r = restore_map($ROOT, $BK, $map, $files);
    audit_log($AUDIT, 'restore.server', ['from' => $ts, 'restored' => $r['restored'], 'pre' => $r['pre']]);
    echo json_encode(['ok' => true, 'restored' => $r['restored'], 'skipped' => $r['skipped'], 'from' => $ts, 'safetySnapshot' => $r['pre']]);
    exit;
}

/* Restore / rollback from a ONEDRIVE bundle. */
if ($action === 'onedrive-restore') {
    if (!$authAdmin) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Admin only']); exit; }
    $name = basename((string) ($p['file'] ?? ''));
    if ($name === '' || substr($name, -5) !== '.json') { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Invalid backup file']); exit; }
    if (!is_file($ROOT . '/m365-lib.php')) { echo json_encode(['ok' => false, 'error' => 'Microsoft 365 not configured']); exit; }
    require_once $ROOT . '/m365-lib.php';
    if (!function_exists('m365_is_connected') || !m365_is_connected()) { echo json_encode(['ok' => false, 'error' => 'Microsoft 365 not connected']); exit; }
    $raw = function_exists('m365_onedrive_download') ? m365_onedrive_download($name, 'iMigrate System Backups') : null;
    if ($raw === null) { http_response_code(502); echo json_encode(['ok' => false, 'error' => 'Could not download from OneDrive']); exit; }
    $bundle = json_decode($raw, true);
    if (!is_array($bundle) || empty($bundle['files']) || !is_array($bundle['files'])) { http_response_code(422); echo json_encode(['ok' => false, 'error' => 'Not a valid system bundle']); exit; }
    $files = [];
    foreach ($bundle['files'] as $rel => $b64) { $files[$rel] = base64_decode((string) $b64, true); }
    $r = restore_map($ROOT, $BK, $map, $files);
    audit_log($AUDIT, 'restore.onedrive', ['from' => $name, 'restored' => $r['restored'], 'pre' => $r['pre']]);
    echo json_encode(['ok' => true, 'restored' => $r['restored'], 'skipped' => $r['skipped'], 'from' => $name, 'safetySnapshot' => $r['pre'], 'exportedAt' => $bundle['exportedAt'] ?? '']);
    exit;
}

if ($action === 'download') {
    if (!$authAdmin) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Admin only']); exit; }
    $ts = preg_replace('/[^0-9\-]/', '', (string) ($p['ts'] ?? ''));
    $src = $BK . '/' . $ts;
    if ($ts === '' || !is_dir($src)) { http_response_code(404); echo json_encode(['ok' => false, 'error' => 'Snapshot not found']); exit; }
    $bundle = ['ts' => $ts, 'exportedAt' => date('c'), 'files' => []];
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($src, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $fi) { if (!$fi->isFile()) continue; $rel = ltrim(str_replace($src, '', $fi->getPathname()), '/'); if ($rel === '_manifest.json') continue; $bundle['files'][$rel] = base64_encode((string) @file_get_contents($fi->getPathname())); }
    header('Content-Disposition: attachment; filename="imigrate-system-' . $ts . '.json"');
    echo json_encode($bundle, JSON_UNESCAPED_SLASHES);
    exit;
}

/* Import leads (recovery / migration). Append-only + de-duplicated; never
   truncates. Used to recover leads from HubSpot or an exported bundle. */
if ($action === 'import-leads') {
    if (!$authAdmin) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Admin only']); exit; }
    $incoming = $p['leads'] ?? null;
    if (!is_array($incoming) || !count($incoming)) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'No leads provided']); exit; }
    $leadsDir = $ROOT . '/leads';
    if (!is_dir($leadsDir)) { @mkdir($leadsDir, 0755, true); @file_put_contents($leadsDir . '/.htaccess', "Require all denied\nDeny from all\n"); }
    $leadsFile = $leadsDir . '/leads.ndjson';
    // Snapshot current state first (reversible), then append only NEW leads.
    if ($hasData) make_server_snapshot($ROOT, $BK, $map, 'pre-import');
    $haveHid = []; $haveEmail = [];
    if (is_file($leadsFile)) {
        foreach (file($leadsFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
            $j = json_decode($line, true); if (!is_array($j)) continue;
            if (!empty($j['hubspotId'])) $haveHid[(string) $j['hubspotId']] = 1;
            $em = strtolower((string) ($j['fields']['email'] ?? '')); if ($em !== '') $haveEmail[$em] = 1;
        }
    }
    $VALID_STAGES = ['New Lead','Pending Call','Pending CV / Resume','Pending Appointment','Appointment Scheduled','Pending Follow-up','Under Assessment','Future Lead','No Answer – Follow-up Sent','No Pickup – Email/WhatsApp Sent','Does Not Qualify','Signed Up','Lost Lead','Duplicate Lead','Invalid Lead / Spam'];
    $added = 0; $skipped = 0; $out = ''; $stageByEmail = []; $activityByEmail = [];
    foreach ($incoming as $rec) {
        if (!is_array($rec)) { $skipped++; continue; }
        $hid = (string) ($rec['hubspotId'] ?? ''); $em = strtolower((string) ($rec['fields']['email'] ?? ''));
        if (($hid !== '' && isset($haveHid[$hid])) || ($em !== '' && isset($haveEmail[$em]))) { $skipped++; continue; }
        if ($hid !== '') $haveHid[$hid] = 1; if ($em !== '') $haveEmail[$em] = 1;
        // Capture optional pipeline-stage + activity hints, then strip from the stored record.
        $stg = (string) ($rec['_stage'] ?? ''); unset($rec['_stage']);
        if ($em !== '' && $stg !== '' && in_array($stg, $VALID_STAGES, true)) $stageByEmail[$em] = $stg;
        $act = (isset($rec['_activity']) && is_array($rec['_activity'])) ? $rec['_activity'] : []; unset($rec['_activity']);
        if ($em !== '' && $act) $activityByEmail[$em] = $act;
        $out .= json_encode($rec, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"; $added++;
    }
    if ($out !== '') @file_put_contents($leadsFile, $out, FILE_APPEND | LOCK_EX);
    // Set pipeline stage + note activity for the imported leads (crm-meta), without
    // clobbering any stage already set, and de-duplicating note entries.
    $metaSet = 0; $notesAdded = 0;
    if ($stageByEmail || $activityByEmail) {
        $metaFile = $leadsDir . '/crm-meta.ndjson';
        $meta = [];
        if (is_file($metaFile)) {
            foreach (file($metaFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
                $j = json_decode($line, true); if (!is_array($j)) continue;
                $k = strtolower(trim((string) ($j['key'] ?? $j['email'] ?? ''))); if ($k === '') continue;
                $meta[$k] = $j;
            }
        }
        foreach ($stageByEmail as $em => $stg) {
            if (isset($meta[$em]) && !empty($meta[$em]['stage'])) continue; // don't overwrite a real stage
            $row = $meta[$em] ?? ['key' => $em, 'overrides' => [], 'activity' => []];
            $row['stage'] = $stg; $row['stageAt'] = date('c'); $row['stageChangedBy'] = 'System (HubSpot recovery)';
            $meta[$em] = $row; $metaSet++;
        }
        foreach ($activityByEmail as $em => $acts) {
            $row = $meta[$em] ?? ['key' => $em, 'overrides' => [], 'activity' => []];
            if (!isset($row['activity']) || !is_array($row['activity'])) $row['activity'] = [];
            $seen = []; foreach ($row['activity'] as $a) $seen[md5((string) ($a['detail'] ?? '') . '|' . (string) ($a['at'] ?? ''))] = 1;
            foreach ($acts as $a) {
                if (!is_array($a)) continue;
                $sig = md5((string) ($a['detail'] ?? '') . '|' . (string) ($a['at'] ?? ''));
                if (isset($seen[$sig])) continue; $seen[$sig] = 1;
                $row['activity'][] = ['id' => substr(md5(uniqid('', true)), 0, 10), 'event' => substr((string) ($a['event'] ?? 'Note'), 0, 60), 'detail' => substr((string) ($a['detail'] ?? ''), 0, 400), 'author' => (string) ($a['author'] ?? 'HubSpot'), 'at' => (string) ($a['at'] ?? date('c'))];
                $notesAdded++;
            }
            usort($row['activity'], fn($x, $y) => strcmp((string) ($x['at'] ?? ''), (string) ($y['at'] ?? '')));
            if (count($row['activity']) > 500) $row['activity'] = array_slice($row['activity'], -500);
            $meta[$em] = $row;
        }
        $mout = ''; foreach ($meta as $row) $mout .= json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
        if ($mout !== '') @file_put_contents($metaFile, $mout, LOCK_EX);
    }
    audit_log($AUDIT, 'import.leads', ['added' => $added, 'skipped' => $skipped, 'stagesSet' => $metaSet, 'notesAdded' => $notesAdded, 'reason' => (string) ($p['reason'] ?? '')]);
    echo json_encode(['ok' => true, 'added' => $added, 'skipped' => $skipped, 'stagesSet' => $metaSet, 'notesAdded' => $notesAdded, 'total' => leads_count($ROOT)]);
    exit;
}

/* Log a deploy event (called from CI before/after deploy). */
if ($action === 'deploy-log') {
    audit_log($AUDIT, 'deploy', ['phase' => (string) ($p['phase'] ?? $_GET['phase'] ?? ''), 'sha' => (string) ($p['sha'] ?? $_GET['sha'] ?? ''), 'leads' => leads_count($ROOT)]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
