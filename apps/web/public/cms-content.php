<?php
/**
 * CMS content store for the iMigrate website CMS (/cms.html).
 *
 * A gated, VERSIONED JSON store for website content domains. The website reads
 * these files at runtime (content.json etc.), so saves update the live site
 * immediately — no redeploy. Every save auto-backs-up the previous version, so
 * any change can be rolled back. WEBSITE CONTENT ONLY — never touches the CRM
 * (leads/ store) or its endpoints.
 *
 * POST JSON { password, action, domain, ... }
 *   'load'     { domain }                 -> { ok, data, mtime }
 *   'save'     { domain, data, editor? }  -> backs up current, writes new (live)
 *   'versions' { domain }                 -> { ok, versions:[ {ts,editor,bytes,at} ] }
 *   'restore'  { domain, ts }             -> snapshot current, restore that version
 *   'version'  { domain, ts }             -> { ok, data } (read one old version)
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok' => false, 'error' => 'Method not allowed']); exit; }
$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 4000000) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Invalid request size']); exit; }
$p = json_decode($raw, true);
if (!is_array($p) || !hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''))) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Incorrect password']); exit; }

/* Whitelisted website-content domains → files in the web root (read live by the SPA). */
$DOMAINS = [
    'content' => 'content.json',
    'faqs'    => 'faqs.json',
    'forms'   => 'forms.json',
    'blog'    => 'blog.json',
    'seo'     => 'seo.json',
    'pages'   => 'pages.json',
    'media'   => 'media.json',
];
$domain = (string) ($p['domain'] ?? '');
if (!isset($DOMAINS[$domain])) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Unknown domain']); exit; }

// DURABILITY: the CMS reads/writes a SERVER-ONLY override file in cms-overrides/.
// The repo file ($base) is the seed/default that ships on deploy and is never
// modified here; the override is never in the repo, so the FTP mirror can never
// delete or overwrite it. The website reads the override when present, else the
// base — so published edits survive every future deploy.
$base = __DIR__ . '/' . $DOMAINS[$domain];
$ovDir = __DIR__ . '/cms-overrides';
if (!is_dir($ovDir)) { @mkdir($ovDir, 0755, true); }
$file = $ovDir . '/' . $DOMAINS[$domain];
// Effective-read source: override if it exists, else the shipped base.
$readFile = is_file($file) ? $file : $base;

$verRoot = __DIR__ . '/cms-versions';
$verDir = $verRoot . '/' . $domain;
if (!is_dir($verDir)) { @mkdir($verDir, 0755, true); @file_put_contents($verRoot . '/.htaccess', "Require all denied\nDeny from all\n"); }
$idxFile = $verDir . '/index.ndjson';
$KEEP = 60;

$action = $p['action'] ?? 'load';
$editor = substr(trim((string) ($p['editor'] ?? 'Admin')), 0, 60) ?: 'Admin';

function ver_index_load($f) { $r = []; if (is_file($f)) foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $l) { $x = json_decode($l, true); if (is_array($x)) $r[] = $x; } return $r; }
function ver_index_append($f, $row) { @file_put_contents($f, json_encode($row) . "\n", FILE_APPEND | LOCK_EX); }

/* Snapshot the CURRENT live file into versions (called before any overwrite). */
function snapshot_current($file, $verDir, $idxFile, $editor, $note) {
    if (!is_file($file)) return null;
    $ts = date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 4);
    @copy($file, $verDir . '/' . $ts . '.json');
    ver_index_append($idxFile, ['ts' => $ts, 'editor' => $editor, 'at' => date('c'), 'bytes' => (int) @filesize($file), 'note' => $note]);
    return $ts;
}
function prune_versions($verDir, $idxFile, $keep) {
    $rows = ver_index_load($idxFile);
    if (count($rows) <= $keep) return;
    $drop = array_slice($rows, 0, count($rows) - $keep);
    foreach ($drop as $d) { @unlink($verDir . '/' . ($d['ts'] ?? '') . '.json'); }
    $rows = array_slice($rows, -$keep);
    $out = ''; foreach ($rows as $r) $out .= json_encode($r) . "\n";
    @file_put_contents($idxFile, $out, LOCK_EX);
}

if ($action === 'load') {
    $data = is_file($readFile) ? json_decode((string) file_get_contents($readFile), true) : null;
    echo json_encode(['ok' => true, 'data' => $data, 'mtime' => is_file($readFile) ? date('c', filemtime($readFile)) : null, 'override' => is_file($file)]);
    exit;
}

if ($action === 'versions') {
    $rows = array_reverse(ver_index_load($idxFile));
    echo json_encode(['ok' => true, 'versions' => $rows]);
    exit;
}

if ($action === 'version') {
    $ts = preg_replace('/[^0-9A-Za-z\-]/', '', (string) ($p['ts'] ?? ''));
    $vf = $verDir . '/' . $ts . '.json';
    if (!is_file($vf)) { http_response_code(404); echo json_encode(['ok' => false, 'error' => 'Version not found']); exit; }
    echo json_encode(['ok' => true, 'data' => json_decode((string) file_get_contents($vf), true)]);
    exit;
}

if ($action === 'save') {
    if (!array_key_exists('data', $p)) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Missing data']); exit; }
    $data = $p['data'];
    if (!is_array($data)) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Data must be an object or array']); exit; }
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Could not encode JSON']); exit; }
    snapshot_current($readFile, $verDir, $idxFile, $editor, 'pre-save'); // back up current effective content
    if (@file_put_contents($file, $json, LOCK_EX) === false) { http_response_code(500); echo json_encode(['ok' => false, 'error' => 'Could not write file (check permissions)']); exit; }
    prune_versions($verDir, $idxFile, $KEEP);
    echo json_encode(['ok' => true, 'mtime' => date('c'), 'bytes' => strlen($json)]);
    exit;
}

if ($action === 'restore') {
    $ts = preg_replace('/[^0-9A-Za-z\-]/', '', (string) ($p['ts'] ?? ''));
    $vf = $verDir . '/' . $ts . '.json';
    if (!is_file($vf)) { http_response_code(404); echo json_encode(['ok' => false, 'error' => 'Version not found']); exit; }
    snapshot_current($readFile, $verDir, $idxFile, $editor, 'pre-restore');
    if (@copy($vf, $file) === false) { http_response_code(500); echo json_encode(['ok' => false, 'error' => 'Restore failed']); exit; }
    prune_versions($verDir, $idxFile, $KEEP);
    echo json_encode(['ok' => true, 'restored' => $ts]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
