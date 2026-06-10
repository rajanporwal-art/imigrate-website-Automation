<?php
/**
 * One-off repair: relink orphaned CV uploads to their leads.
 *
 * Before the form/CRM field-name fix, CVs were uploaded to leads/uploads/ but
 * the stored filename was never saved on the lead record. This tool matches an
 * orphaned upload to a lead by TIMESTAMP proximity (the CV is uploaded seconds
 * before the lead is submitted in the same form session) and attaches it
 * NON-DESTRUCTIVELY via a CRM override (cvWebFile/cvWebName in crm-meta) — the
 * original leads.ndjson is never modified.
 *
 * POST JSON { password, action, windowSeconds? }
 *   'scan'  -> dry run: proposed matches + ambiguous/unmatched (no writes)
 *   'apply' -> attach confident matches (single candidate within the window,
 *              lead has no CV, file not already assigned). Snapshots crm-meta first.
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok' => false, 'error' => 'Method not allowed']); exit; }
$p = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($p) || !hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''))) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Incorrect password']); exit; }

$dir = __DIR__ . '/leads';
$uploadsDir = $dir . '/uploads';
$leadsFile = $dir . '/leads.ndjson';
$metaFile = $dir . '/crm-meta.ndjson';
$action = $p['action'] ?? 'scan';
$window = max(30, min(1800, (int) ($p['windowSeconds'] ?? 180)));

if (!is_dir($uploadsDir) || !is_file($leadsFile)) { echo json_encode(['ok' => true, 'matches' => [], 'note' => 'No uploads or leads on file.']); exit; }

/* ---- load leads ---- */
$leads = [];
foreach (file($leadsFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    $r = json_decode($line, true);
    if (is_array($r)) $leads[] = $r;
}

/* ---- files already referenced by a lead are NOT orphans ---- */
$referenced = [];
foreach ($leads as $l) {
    $f = $l['fields'] ?? [];
    foreach (['cvFile', 'cvFilename'] as $k) { if (!empty($f[$k])) $referenced[basename($f[$k])] = true; }
}

/* ---- load crm-meta (to skip already-reconciled + resolve overrides) ---- */
function rc_meta_key($row) { if (!empty($row['key'])) return (string) $row['key']; if (!empty($row['email'])) return strtolower(trim((string) $row['email'])); return ''; }
$meta = [];
if (is_file($metaFile)) foreach (file($metaFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) { $r = json_decode($line, true); if (is_array($r)) { $k = rc_meta_key($r); if ($k !== '') { $r['key'] = $k; $meta[$k] = $r; } } }
foreach ($meta as $m) { $ov = $m['overrides'] ?? []; if (!empty($ov['cvWebFile'])) $referenced[basename($ov['cvWebFile'])] = true; }

/* ---- lead helpers ---- */
function lead_ckey($l) { $email = strtolower(trim((string) (($l['fields'] ?? [])['email'] ?? ''))); return $email !== '' ? $email : 'id:' . ($l['id'] ?? ''); }
function lead_has_cv($l, $meta) {
    $f = $l['fields'] ?? [];
    if (!empty($f['cvFile']) || !empty($f['cvFilename'])) return true;
    $k = lead_ckey($l);
    $ov = ($meta[$k]['overrides'] ?? []);
    return !empty($ov['cvWebFile']) || !empty($ov['cvDocId']);
}

/* ---- enumerate orphan uploads + find candidate leads ---- */
$matches = [];
$assignedFiles = [];
foreach (glob($uploadsDir . '/*') ?: [] as $path) {
    $name = basename($path);
    if ($name === '' || $name[0] === '.' || isset($referenced[$name])) continue;
    // Parse leading Ymd-His from the stored filename.
    $stamp = substr($name, 0, 15);
    $dt = DateTime::createFromFormat('Ymd-His', $stamp);
    $uEpoch = $dt ? $dt->getTimestamp() : @filemtime($path);
    // Candidate leads: no CV yet, submitted at/after the upload, within window.
    $cands = [];
    foreach ($leads as $l) {
        if (lead_has_cv($l, $meta)) continue;
        $lEpoch = strtotime((string) ($l['timestamp'] ?? ''));
        if (!$lEpoch) continue;
        $delta = $lEpoch - $uEpoch;
        if ($delta >= -60 && $delta <= $window) {
            $cands[] = ['lead' => $l, 'delta' => $delta];
        }
    }
    usort($cands, fn($a, $b) => abs($a['delta']) <=> abs($b['delta']));
    $entry = ['file' => $name, 'uploadTime' => $dt ? $dt->format('c') : date('c', (int) $uEpoch), 'candidates' => count($cands)];
    if (count($cands) >= 1) {
        $best = $cands[0]['lead'];
        $entry['match'] = [
            'leadId' => $best['id'] ?? '', 'ckey' => lead_ckey($best),
            'name' => (($best['fields'] ?? [])['fullName'] ?? '') ?: (($best['fields'] ?? [])['name'] ?? ''),
            'email' => ($best['fields'] ?? [])['email'] ?? '',
            'deltaSeconds' => $cands[0]['delta'],
        ];
        // Confident = exactly one candidate within window.
        $entry['confident'] = (count($cands) === 1);
    } else {
        $entry['match'] = null; $entry['confident'] = false;
    }
    $matches[] = $entry;
}

if ($action === 'scan') {
    $confident = array_values(array_filter($matches, fn($m) => $m['confident']));
    echo json_encode(['ok' => true, 'orphans' => count($matches), 'confident' => count($confident), 'matches' => $matches, 'windowSeconds' => $window]);
    exit;
}

if ($action === 'apply') {
    // Snapshot crm-meta before writing.
    if (is_file($metaFile)) { $bdir = $dir . '/backups'; if (!is_dir($bdir)) @mkdir($bdir, 0755, true); @copy($metaFile, $bdir . '/crm-meta-prereconcile-' . date('Ymd-His') . '.ndjson'); }
    $applied = [];
    $used = [];
    foreach ($matches as $m) {
        if (!$m['confident'] || empty($m['match'])) continue;
        $file = $m['file'];
        $ckey = $m['match']['ckey'];
        if (isset($used[$file]) || isset($used['k:' . $ckey])) continue; // one file ↔ one lead per run
        if (!isset($meta[$ckey])) $meta[$ckey] = ['key' => $ckey, 'email' => (strpos($ckey, 'id:') === 0 ? '' : $ckey), 'stage' => 'New Lead', 'notes' => [], 'overrides' => [], 'activity' => []];
        if (!isset($meta[$ckey]['overrides']) || !is_array($meta[$ckey]['overrides'])) $meta[$ckey]['overrides'] = [];
        if (!empty($meta[$ckey]['overrides']['cvWebFile'])) continue; // already has one
        $meta[$ckey]['overrides']['cvWebFile'] = $file;
        $meta[$ckey]['overrides']['cvWebName'] = $file;
        if (!isset($meta[$ckey]['activity']) || !is_array($meta[$ckey]['activity'])) $meta[$ckey]['activity'] = [];
        $meta[$ckey]['activity'][] = ['id' => date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 6), 'event' => 'CV reconciled', 'detail' => $file . ' (Δ' . $m['match']['deltaSeconds'] . 's)', 'author' => 'CV reconciler', 'at' => date('c')];
        $used[$file] = true; $used['k:' . $ckey] = true;
        $applied[] = ['file' => $file, 'ckey' => $ckey, 'name' => $m['match']['name']];
    }
    // Save meta.
    $out = '';
    foreach ($meta as $row) $out .= json_encode($row) . "\n";
    @file_put_contents($metaFile, $out, LOCK_EX);
    echo json_encode(['ok' => true, 'applied' => count($applied), 'details' => $applied]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
