<?php
/**
 * Password-protected leads reader for the admin dashboard.
 *  action "list"  -> returns all captured leads (newest first)
 *  action "retry" -> re-attempts HubSpot sync for any unsynced leads
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
if (!is_array($payload) || !hash_equals($EDIT_PASSWORD, (string) ($payload['password'] ?? ''))) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

$file = __DIR__ . '/leads/leads.ndjson';
$leads = [];
$needsHeal = false;

/**
 * Safely rewrite the whole leads store. CRITICAL data-loss guard: NEVER overwrite
 * a populated store with an empty one (protects against a transient/partial read
 * or parse hiccup wiping every lead). Keeps a rolling pre-write backup too.
 */
function safe_rewrite_leads($file, $leads) {
    $new = '';
    foreach ($leads as $l) $new .= json_encode($l) . "\n";
    $had = is_file($file) ? trim((string) @file_get_contents($file)) : '';
    if ($new === '' && $had !== '') return false;            // refuse to truncate a non-empty store
    if ($had !== '') @copy($file, $file . '.prewrite.bak');  // last-resort recovery copy (inside excluded leads/)
    return @file_put_contents($file, $new, LOCK_EX) !== false;
}
if (is_file($file)) {
    $content = (string) file_get_contents($file);
    $trim = ltrim($content);
    if ($trim !== '' && $trim[0] === '[') {
        // The store was written as a single JSON array (e.g. pretty-printed by a
        // tool/restore) instead of NDJSON. Parse it and self-heal to NDJSON so
        // line-by-line reads AND future appends work again.
        $arr = json_decode($content, true);
        if (is_array($arr)) { foreach ($arr as $row) { if (is_array($row)) $leads[] = $row; } $needsHeal = true; }
    } else {
        // Normal NDJSON — tolerate CR/LF/CRLF line endings.
        foreach (preg_split('/\r\n|\r|\n/', $content) as $line) {
            $line = trim($line);
            if ($line === '') continue;
            $row = json_decode($line, true);
            if (is_array($row)) $leads[] = $row;
        }
    }
    // One-time normalisation back to clean NDJSON when the format was off.
    if ($needsHeal && $leads) {
        safe_rewrite_leads($file, $leads);
    }
}

$action = $payload['action'] ?? 'list';

/* ---- safety check: verify leads directory exists (deploy health check) ---- */
if ($action === 'check') {
    $dir = __DIR__ . '/leads';
    $ok = is_dir($dir) && is_file($file);
    $count = count($leads);
    echo json_encode(['ok' => $ok, 'directory_exists' => is_dir($dir), 'leads_file_exists' => is_file($file), 'lead_count' => $count, 'message' => $ok ? "Leads directory healthy ($count leads)" : "Leads directory missing or corrupted"]);
    exit;
}

if ($action === 'retry') {
    require __DIR__ . '/hubspot-lib.php';
    $cfgPath = __DIR__ . '/hubspot.json';
    $cfg = is_file($cfgPath) ? json_decode((string) file_get_contents($cfgPath), true) : null;
    $retried = 0; $synced = 0;
    if (is_array($cfg) && !empty($cfg['enabled'])) {
        foreach ($leads as $idx => $lead) {
            if (!empty($lead['hubspotSynced'])) continue;
            $retried++;
            $body = hs_build_body($lead['fields'] ?? [], $lead['formName'] ?? '', $lead['context'] ?? [], $cfg);
            $code = hs_submit($cfg, $body);
            if ($code !== null && $code >= 200 && $code < 300) { $leads[$idx]['hubspotSynced'] = true; $synced++; }
        }
        safe_rewrite_leads($file, $leads);
    }
    echo json_encode(['ok' => true, 'retried' => $retried, 'synced' => $synced]);
    exit;
}

// Default: list (newest first)
echo json_encode(['ok' => true, 'leads' => array_reverse($leads)]);
