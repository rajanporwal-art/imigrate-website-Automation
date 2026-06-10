<?php
/**
 * Media library for the iMigrate website CMS (/cms.html).
 *
 * Stores images, PDFs, documents and videos in the public /media/ folder so the
 * website can reference them directly, with an index in media.json. Images are
 * auto-optimized for web (resized to <=1920px, re-encoded) when GD is available.
 * WEBSITE MEDIA ONLY — independent of the CRM document store (leads/docs/).
 *
 * UPLOAD (multipart): fields password, category?, alt?, file=<binary>
 * JSON { password, action }:
 *   'list'   { q?, category? } -> { ok, media:[...] }
 *   'update' { id, category?, alt? }
 *   'delete' { id }
 */
@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }

$mediaDir = __DIR__ . '/media';
$indexFile = __DIR__ . '/media.json';
if (!is_dir($mediaDir)) { @mkdir($mediaDir, 0755, true); }

function m_index_load($f) {
    if (is_file($f)) { $d = json_decode((string) file_get_contents($f), true); if (isset($d['items']) && is_array($d['items'])) return $d['items']; if (is_array($d)) return $d; }
    return [];
}
function m_index_save($f, $items) {
    return @file_put_contents($f, json_encode(['_README' => 'CMS media library index. Managed by cms-media.php.', 'items' => array_values($items)], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX) !== false;
}
function m_json($a) { header('Content-Type: application/json; charset=utf-8'); echo json_encode($a); exit; }

$IMG = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'gif' => 'image/gif', 'svg' => 'image/svg+xml'];
$DOCV = ['pdf' => 'application/pdf', 'doc' => 'application/msword', 'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'xls' => 'application/vnd.ms-excel', 'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'mp4' => 'video/mp4', 'webm' => 'video/webm'];

/* ---- optimize a raster image in place (resize to <=1920, re-encode) ---- */
function optimize_image($path, $ext) {
    if (!function_exists('imagecreatetruecolor')) return;
    if (!in_array($ext, ['jpg', 'jpeg', 'png'], true)) return;
    $info = @getimagesize($path); if (!$info) return;
    [$w, $h] = $info;
    $src = $ext === 'png' ? @imagecreatefrompng($path) : @imagecreatefromjpeg($path);
    if (!$src) return;
    $max = 1920;
    if ($w > $max) {
        $nh = (int) round($h * ($max / $w));
        $dst = imagecreatetruecolor($max, $nh);
        if ($ext === 'png') { imagealphablending($dst, false); imagesavealpha($dst, true); }
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $max, $nh, $w, $h);
        imagedestroy($src); $src = $dst;
    }
    if ($ext === 'png') { imagepng($src, $path, 7); } else { imagejpeg($src, $path, 82); }
    imagedestroy($src);
}

/* ---------- multipart upload ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    if (!hash_equals($EDIT_PASSWORD, (string) ($_POST['password'] ?? ''))) { http_response_code(403); m_json(['ok' => false, 'error' => 'Incorrect password']); }
    $f = $_FILES['file'];
    if ($f['error'] !== UPLOAD_ERR_OK) m_json(['ok' => false, 'error' => 'Upload failed']);
    $orig = preg_replace('/[^A-Za-z0-9._ -]/', '_', $f['name']);
    $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
    global $IMG, $DOCV;
    $isImg = isset($IMG[$ext]); $allowed = $IMG + $DOCV;
    if (!isset($allowed[$ext])) { http_response_code(400); m_json(['ok' => false, 'error' => 'Type not allowed']); }
    $limit = (in_array($ext, ['mp4', 'webm'], true)) ? 50 : 12;
    if ($f['size'] > $limit * 1024 * 1024) { http_response_code(400); m_json(['ok' => false, 'error' => "File too large (max {$limit} MB)"]); }
    $base = preg_replace('/\.[^.]+$/', '', $orig);
    $stored = $base . '-' . substr(md5(uniqid('', true)), 0, 6) . '.' . $ext;
    $dest = $mediaDir . '/' . $stored;
    if (!@move_uploaded_file($f['tmp_name'], $dest)) { http_response_code(500); m_json(['ok' => false, 'error' => 'Could not save (check permissions)']); }
    if ($isImg) optimize_image($dest, $ext);
    $dim = $isImg ? @getimagesize($dest) : null;
    $items = m_index_load($indexFile);
    $rec = [
        'id' => 'M-' . date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 6),
        'file' => $stored, 'url' => '/media/' . $stored, 'name' => $orig,
        'type' => $isImg ? 'image' : (in_array($ext, ['mp4', 'webm'], true) ? 'video' : ($ext === 'pdf' ? 'pdf' : 'document')),
        'ext' => $ext, 'size' => (int) @filesize($dest),
        'w' => $dim ? $dim[0] : null, 'h' => $dim ? $dim[1] : null,
        'category' => substr((string) ($_POST['category'] ?? ''), 0, 60),
        'alt' => substr((string) ($_POST['alt'] ?? ''), 0, 200),
        'uploadedBy' => substr((string) ($_POST['editor'] ?? 'Admin'), 0, 60),
        'at' => date('c'),
    ];
    array_unshift($items, $rec);
    m_index_save($indexFile, $items);
    m_json(['ok' => true, 'item' => $rec]);
}

/* ---------- JSON actions ---------- */
$p = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($p) || !hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''))) { http_response_code(403); m_json(['ok' => false, 'error' => 'Incorrect password']); }
$action = $p['action'] ?? 'list';
$items = m_index_load($indexFile);

if ($action === 'list') {
    $q = strtolower(trim((string) ($p['q'] ?? '')));
    $cat = trim((string) ($p['category'] ?? ''));
    $out = array_values(array_filter($items, function ($it) use ($q, $cat) {
        if ($cat !== '' && ($it['category'] ?? '') !== $cat) return false;
        if ($q !== '' && strpos(strtolower(($it['name'] ?? '') . ' ' . ($it['alt'] ?? '') . ' ' . ($it['category'] ?? '')), $q) === false) return false;
        return true;
    }));
    m_json(['ok' => true, 'media' => $out, 'total' => count($items)]);
}
if ($action === 'update') {
    $id = (string) ($p['id'] ?? '');
    foreach ($items as &$it) { if (($it['id'] ?? '') === $id) { if (isset($p['category'])) $it['category'] = substr((string) $p['category'], 0, 60); if (isset($p['alt'])) $it['alt'] = substr((string) $p['alt'], 0, 200); } }
    unset($it);
    m_index_save($indexFile, $items);
    m_json(['ok' => true]);
}
if ($action === 'delete') {
    $id = (string) ($p['id'] ?? '');
    foreach ($items as $it) { if (($it['id'] ?? '') === $id) { @unlink($mediaDir . '/' . basename($it['file'] ?? '')); } }
    $items = array_values(array_filter($items, fn($it) => ($it['id'] ?? '') !== $id));
    m_index_save($indexFile, $items);
    m_json(['ok' => true]);
}
http_response_code(400);
m_json(['ok' => false, 'error' => 'Unknown action']);
