<?php
/**
 * CMS Export — returns all CMS overrides as a JSON bundle.
 *
 * Used by the GitHub Actions "CMS Sync" workflow to pull CMS edits from the
 * live server and commit them back to the repo, keeping the repo in sync
 * with the production CMS.
 *
 * GET ?action=export&key=<CRON_SECRET>
 *   → { ok:true, domains:{ content:{...}, blog:{...}, ... }, exported_at:"..." }
 *
 * GET ?action=list&key=<CRON_SECRET>
 *   → { ok:true, overrides:["content.json","blog.json",...], counts:{...} }
 *
 * Only reads data — never writes or modifies anything.
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

@include __DIR__ . '/admin-config.php';
if (!isset($CRON_SECRET)) { $CRON_SECRET = ''; }

$key = (string) ($_GET['key'] ?? '');
if ($CRON_SECRET === '' || !hash_equals($CRON_SECRET, $key)) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Invalid key']);
    exit;
}

$action = (string) ($_GET['action'] ?? 'list');
$ovDir  = __DIR__ . '/cms-overrides';

/* Whitelist of CMS content domains (must match cms-content.php). */
$DOMAINS = [
    'content' => 'content.json',
    'faqs'    => 'faqs.json',
    'forms'   => 'forms.json',
    'blog'    => 'blog.json',
    'seo'     => 'seo.json',
    'pages'   => 'pages.json',
    'media'   => 'media.json',
    'visas'   => 'visas.json',
];

if ($action === 'list') {
    $overrides = [];
    $counts    = [];
    foreach ($DOMAINS as $domain => $file) {
        $path = $ovDir . '/' . $file;
        if (is_file($path)) {
            $overrides[] = $file;
            $data = json_decode((string) file_get_contents($path), true);
            $counts[$domain] = is_array($data) ? count($data) : 0;
        }
    }
    echo json_encode([
        'ok'        => true,
        'overrides' => $overrides,
        'counts'    => $counts,
        'checked_at'=> date('c'),
    ]);
    exit;
}

if ($action === 'export') {
    $domains = [];
    foreach ($DOMAINS as $domain => $file) {
        $path = $ovDir . '/' . $file;
        if (is_file($path)) {
            $data = json_decode((string) file_get_contents($path), true);
            if ($data !== null) {
                $domains[$domain] = [
                    'file'  => $file,
                    'data'  => $data,
                    'mtime' => date('c', filemtime($path)),
                    'bytes' => (int) filesize($path),
                ];
            }
        }
    }
    echo json_encode([
        'ok'          => true,
        'domains'     => $domains,
        'exported_at' => date('c'),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action. Use: list, export']);
