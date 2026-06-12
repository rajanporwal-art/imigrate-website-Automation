<?php
/**
 * ai.php — Claude (Anthropic) marketing assistant backend for the iMigrate Admin Portal.
 *
 * Gated by the shared service key (svc = $EDIT_PASSWORD, the same key the portal
 * hands the UI). Proxies the Anthropic Messages API using a SERVER-STORED key and
 * provides:
 *   - config.get / config.set / test  : API-key storage (key never returned) + connectivity test
 *   - kb.build / kb.get               : brand-voice knowledge base from website content/blog/FAQs
 *   - generate                        : AI Content Studio (blog/social/ads/landing/email/WhatsApp/SEO)
 *   - chat                            : Admin AI chat assistant
 *   - drafts.list/get/save/delete     : draft store with per-draft version history
 *   - draft.restore                   : roll a draft back to an earlier version
 *   - log.list                        : AI activity log
 *
 * MARKETING/WEBSITE ONLY. This endpoint never reads or writes CRM lead data; the
 * brand KB only reads the public website content files. All durable data lives in
 * a web-protected, deploy-excluded ai-data/ directory so the FTP mirror never
 * deletes or overwrites it (and the API key never ships in the repo).
 *
 * POST JSON { svc, action, ... }
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') { http_response_code(405); echo json_encode(['ok' => false, 'error' => 'Method not allowed']); exit; }
$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 2000000) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Invalid request size']); exit; }
$p = json_decode($raw, true);
if (!is_array($p) || !hash_equals($EDIT_PASSWORD, (string) ($p['svc'] ?? $p['password'] ?? ''))) {
    http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Not authorized']); exit;
}

$ROOT = __DIR__;
$dir  = $ROOT . '/ai-data';
if (!is_dir($dir)) { @mkdir($dir, 0755, true); @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n"); }
$CFG = $dir . '/config.json';
$KB  = $dir . '/kb.json';
$DRAFTS = $dir . '/drafts.json';
$LOG = $dir . '/activity.ndjson';

/* ---------------- helpers ---------------- */
function jload($f, $d) { if (is_file($f)) { $x = json_decode((string) file_get_contents($f), true); return $x === null ? $d : $x; } return $d; }
function jsave($f, $d) { return @file_put_contents($f, json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false; }
function ai_actor($p) { return ['user' => substr((string) ($p['user'] ?? 'Admin'), 0, 80) ?: 'Admin', 'role' => substr((string) ($p['role'] ?? ''), 0, 40)]; }
function ai_log($LOG, $p, $action, $detail) { $a = ai_actor($p); @file_put_contents($LOG, json_encode(['at' => date('c'), 'user' => $a['user'], 'role' => $a['role'], 'action' => $action, 'detail' => substr((string) $detail, 0, 300)]) . "\n", FILE_APPEND | LOCK_EX); }

/* Read a website content file, preferring the CMS server override, else the shipped base. */
function read_content($name, $ROOT) {
    $ov = $ROOT . '/cms-overrides/' . $name;
    $base = $ROOT . '/' . $name;
    $f = is_file($ov) ? $ov : $base;
    return is_file($f) ? json_decode((string) file_get_contents($f), true) : null;
}

/* ---------------- Anthropic Messages API call ---------------- */
function anthropic_call($apiKey, $model, $system, $messages, $maxTokens, &$err) {
    $err = '';
    if (!$apiKey) { $err = 'No Anthropic API key configured. Add it under Integrations → Claude AI.'; return null; }
    if (!function_exists('curl_init')) { $err = 'Server is missing PHP cURL — cannot reach the Claude API.'; return null; }
    $body = ['model' => $model, 'max_tokens' => $maxTokens, 'messages' => $messages];
    if ($system !== '') { $body['system'] = $system; }
    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['content-type: application/json', 'x-api-key: ' . $apiKey, 'anthropic-version: 2023-06-01'],
        CURLOPT_POSTFIELDS => json_encode($body),
        CURLOPT_TIMEOUT => 175,
        CURLOPT_CONNECTTIMEOUT => 20,
    ]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $cerr = curl_error($ch);
    curl_close($ch);
    if ($res === false) { $err = 'Network error contacting Claude: ' . $cerr; return null; }
    $j = json_decode($res, true);
    if ($code >= 400 || !is_array($j) || (($j['type'] ?? '') === 'error')) {
        $msg = $j['error']['message'] ?? ('Claude API error (HTTP ' . $code . ')');
        if ($code == 401) $msg = 'Invalid Anthropic API key.';
        if ($code == 429) $msg = 'Claude rate limit reached — please try again shortly.';
        $err = $msg; return null;
    }
    $text = '';
    foreach (($j['content'] ?? []) as $b) { if (($b['type'] ?? '') === 'text') $text .= $b['text']; }
    return ['text' => $text, 'usage' => $j['usage'] ?? null, 'model' => $j['model'] ?? $model];
}

/* ---------------- brand knowledge base ---------------- */
function build_facts($c, $faqs, $blog) {
    $c = is_array($c) ? $c : [];
    $L = [];
    $L[] = 'Company: iMigrate Migration Solutions — a licensed immigration consultancy (NOT a law firm) specialising in Australia and Canada migration, based in Kuala Lumpur, Malaysia.';
    if (!empty($c['home']['heroTitle'])) $L[] = 'Tagline: ' . $c['home']['heroTitle'];
    if (!empty($c['home']['heroSubtitle'])) $L[] = 'Sub-tagline: ' . $c['home']['heroSubtitle'];
    if (!empty($c['contact']) && is_array($c['contact'])) {
        $ct = $c['contact'];
        $L[] = 'Contact: phone ' . ($ct['phone'] ?? '') . ', email ' . ($ct['email'] ?? '') . ', WhatsApp ' . ($ct['whatsapp'] ?? '') . ', address ' . ($ct['address'] ?? '') . ', hours ' . ($ct['businessHours'] ?? '') . '.';
    }
    if (!empty($c['stats']) && is_array($c['stats'])) {
        $s = array_map(fn($x) => trim(($x['value'] ?? '') . ' ' . ($x['label'] ?? '')), $c['stats']);
        $L[] = 'Key stats: ' . implode('; ', array_filter($s)) . '.';
    }
    if (!empty($c['highlights']) && is_array($c['highlights'])) {
        $h = array_map(fn($x) => is_array($x) ? ($x['title'] ?? '') : (string) $x, $c['highlights']);
        $L[] = 'Differentiators: ' . implode('; ', array_filter($h)) . '.';
    }
    $svc = [];
    if (!empty($c['home']['services']) && is_array($c['home']['services'])) {
        foreach ($c['home']['services'] as $s) { $svc[] = is_array($s) ? ($s['title'] ?? '') : (string) $s; }
    }
    if ($svc) $L[] = 'Core services: ' . implode('; ', array_filter($svc)) . '.';
    // Blog topics + recent titles
    $blogIsList = is_array($blog) && (empty($blog) || array_keys($blog) === range(0, count($blog) - 1));
    $posts = is_array($blog) ? ($blog['posts'] ?? ($blogIsList ? $blog : [])) : [];
    if (is_array($posts) && $posts) {
        $cats = []; $titles = [];
        foreach ($posts as $i => $pp) { if (!empty($pp['category'])) $cats[$pp['category']] = 1; if (count($titles) < 12 && !empty($pp['title'])) $titles[] = $pp['title']; }
        if ($cats) $L[] = 'Blog topics covered: ' . implode(', ', array_keys($cats)) . '.';
        if ($titles) $L[] = 'Recent article titles: ' . implode(' | ', $titles) . '.';
    }
    // FAQ questions (recursive q/a discovery)
    $qs = [];
    $flat = function ($node) use (&$flat, &$qs) {
        if (!is_array($node)) return;
        if (isset($node['q'])) { $qs[] = (string) $node['q']; return; }
        foreach ($node as $v) { if (is_array($v)) $flat($v); }
    };
    $flat($faqs);
    if ($qs) $L[] = 'Common client questions: ' . implode(' | ', array_slice($qs, 0, 16)) . '.';
    $out = implode("\n", $L);
    return substr($out, 0, 6000);
}

function brand_system($cfg, $KB) {
    $kb = jload($KB, []);
    $brand = $kb['brandVoiceGuide'] ?? '';
    if ($brand === '') $brand = $kb['facts'] ?? '';
    $extra = $cfg['brandVoice'] ?? '';
    $s = "You are the in-house marketing copywriter and SEO strategist for iMigrate Migration Solutions, a licensed immigration consultancy specialising in Australia and Canada migration, based in Kuala Lumpur, Malaysia. "
       . "Write in a professional, warm, trustworthy and encouraging tone aimed at skilled professionals, families and business owners considering migration. "
       . "Be accurate and compliant: iMigrate is an immigration consultancy, NOT a law firm, and does not provide legal advice. "
       . "Never guarantee a visa outcome, and never invent statistics, fees, processing times or program rules — if a specific figure is not provided, keep it general or recommend a free eligibility assessment. "
       . "Use British/Commonwealth English. End persuasive pieces with a clear, low-pressure call to action (e.g. a free eligibility assessment).";
    if ($brand) $s .= "\n\n# Brand knowledge base\n" . $brand;
    if ($extra) $s .= "\n\n# Additional brand-voice notes from the team\n" . $extra;
    return $s;
}

/* ---------------- content templates ---------------- */
function gen_template($type, $opts) {
    $lang = '';
    if (!empty($opts['language'])) { $lang = ' Write the output in ' . preg_replace('/[^A-Za-z \-]/', '', (string) $opts['language']) . '.'; }
    switch ($type) {
        case 'blog':
            return ["Write a complete, original, SEO-optimised blog article (700–1100 words) for the iMigrate website based on the brief. Use a compelling H1 title, clear H2/H3 subheadings, short scannable paragraphs, and a closing call-to-action inviting a free eligibility assessment. After the article, add a '## SEO' section with a suggested meta title (<=60 chars) and meta description (<=155 chars). Output in Markdown." . $lang, 4500];
        case 'social':
            return ["Write 3 distinct social media post variations for the brief, suitable for Facebook, Instagram and LinkedIn. Each: a strong hook, value, and a clear call-to-action; include 3–6 relevant hashtags and tasteful emoji. Label them 'Variation 1/2/3' and note the best-fit platform for each." . $lang, 1500];
        case 'googleads':
            return ["Create a Google Search responsive ad for the brief. Provide: 12–15 headlines (each <=30 characters), 4 descriptions (each <=90 characters), 2 display-path segments (<=15 chars each), and 10 suggested keywords with match-type notes. Respect character limits strictly and show the character count in brackets after each headline and description." . $lang, 1900];
        case 'metaads':
            return ["Create a Meta (Facebook/Instagram) ad for the brief. Provide: 3 primary-text variations (aim <=125 chars), 3 headlines (<=40 chars), 2 link descriptions, a recommended CTA button, and a brief audience-targeting suggestion (demographics + interests). Show character counts in brackets." . $lang, 1900];
        case 'linkedinads':
            return ["Create a LinkedIn single-image ad for the brief. Provide: 3 intro-text variations (<=150 chars ideal), 2 headlines (<=70 chars), a recommended CTA, and a professional audience-targeting suggestion (job titles, seniorities, industries). Show character counts in brackets." . $lang, 1700];
        case 'landing':
            return ["Write conversion-focused landing-page copy for the brief: a hero headline + subheadline, 3–4 benefit blocks (heading + 1–2 sentences each), a short social-proof line, an FAQ of 3 Q&As, and a primary CTA. Output in Markdown." . $lang, 3200];
        case 'email':
            return ["Write a marketing email for the brief: 3 subject-line options, a preview/preheader line, and the email body (greeting, value, a clear CTA, and a sign-off from the iMigrate team). Keep it concise and skimmable. Output in Markdown." . $lang, 2200];
        case 'whatsapp':
            return ["Write 3 short WhatsApp message variations (<=500 chars each) for the brief. Friendly, direct, with a clear next step; avoid spammy phrasing. Add a note that template messages must be pre-approved by WhatsApp." . $lang, 1100];
        case 'seo_meta':
            return ["Generate SEO metadata for the page/topic in the brief: a meta title (<=60 chars), a meta description (<=155 chars), an H1 suggestion, 5 target keywords, and 3 internal-link anchor suggestions. Show character counts in brackets." . $lang, 700];
        case 'seo_keywords':
            return ["Do keyword research for the topic in the brief. Provide a table of 15–20 keywords grouped into 3–4 intent clusters (e.g. informational, commercial, branded), with a rough difficulty note (low/medium/high) and a suggested content type for each cluster." . $lang, 1800];
        default:
            return ["Write high-quality marketing content for the brief, appropriate to its stated context and audience." . $lang, 2500];
    }
}

/* ================= dispatch ================= */
$cfg = jload($CFG, []);
$MODEL = $cfg['model'] ?? 'claude-opus-4-8';
$action = (string) ($p['action'] ?? '');

/* ---- config / key storage (key value is never returned) ---- */
if ($action === 'config.get') {
    echo json_encode(['ok' => true,
        'configured' => !empty($cfg['apiKey']),
        'model' => $MODEL,
        'keyHint' => !empty($cfg['apiKey']) ? ('••••' . substr($cfg['apiKey'], -4)) : '',
        'brandVoice' => $cfg['brandVoice'] ?? '',
        'defaultLang' => $cfg['defaultLang'] ?? 'English',
    ]);
    exit;
}
if ($action === 'config.set') {
    if (!empty($p['clearKey'])) { unset($cfg['apiKey']); }
    elseif (array_key_exists('apiKey', $p)) { $k = trim((string) $p['apiKey']); if ($k !== '') $cfg['apiKey'] = $k; }
    if (isset($p['model'])) { $m = preg_replace('/[^a-z0-9\.\-]/', '', strtolower((string) $p['model'])); $cfg['model'] = $m !== '' ? $m : 'claude-opus-4-8'; }
    if (isset($p['brandVoice'])) $cfg['brandVoice'] = substr((string) $p['brandVoice'], 0, 4000);
    if (isset($p['defaultLang'])) $cfg['defaultLang'] = substr((string) $p['defaultLang'], 0, 40);
    jsave($CFG, $cfg);
    ai_log($LOG, $p, 'AI settings updated', !empty($p['clearKey']) ? 'API key cleared' : (array_key_exists('apiKey', $p) && trim((string) $p['apiKey']) !== '' ? 'API key set' : 'preferences'));
    echo json_encode(['ok' => true, 'configured' => !empty($cfg['apiKey'])]);
    exit;
}
if ($action === 'test') {
    $r = anthropic_call($cfg['apiKey'] ?? '', $MODEL, 'Reply with exactly: OK', [['role' => 'user', 'content' => 'ping']], 16, $err);
    if (!$r) { echo json_encode(['ok' => false, 'error' => $err]); exit; }
    ai_log($LOG, $p, 'Connection test', 'ok');
    echo json_encode(['ok' => true, 'reply' => trim($r['text']), 'model' => $r['model']]);
    exit;
}

/* ---- knowledge base ---- */
if ($action === 'kb.build') {
    $c = read_content('content.json', $ROOT) ?: [];
    $faqs = read_content('faqs.json', $ROOT) ?: [];
    $blog = read_content('blog.json', $ROOT) ?: [];
    $facts = build_facts($c, $faqs, $blog);
    $kb = jload($KB, []);
    $kb['facts'] = $facts;
    $kb['builtAt'] = date('c');
    if (!empty($p['analyze'])) {
        $sys = "You are a brand strategist. From the company facts provided, write a concise Brand Voice & Messaging Guide (under 500 words) covering: positioning, target audiences, tone of voice (3–5 adjectives + do/don't), key messaging pillars, proof points, and compliance notes (immigration consultancy, not a law firm; no outcome guarantees). Output in Markdown.";
        $r = anthropic_call($cfg['apiKey'] ?? '', $MODEL, $sys, [['role' => 'user', 'content' => $facts]], 2000, $err);
        if (!$r) { echo json_encode(['ok' => false, 'error' => $err]); exit; }
        $kb['brandVoiceGuide'] = $r['text'];
    }
    jsave($KB, $kb);
    ai_log($LOG, $p, 'Knowledge base rebuilt', !empty($p['analyze']) ? 'with AI brand-voice analysis' : 'facts only');
    echo json_encode(['ok' => true, 'kb' => ['builtAt' => $kb['builtAt'], 'facts' => $kb['facts'], 'brandVoiceGuide' => $kb['brandVoiceGuide'] ?? '', 'factsLen' => strlen($facts)]]);
    exit;
}
if ($action === 'kb.get') {
    $kb = jload($KB, []);
    echo json_encode(['ok' => true, 'kb' => ['builtAt' => $kb['builtAt'] ?? null, 'facts' => $kb['facts'] ?? '', 'brandVoiceGuide' => $kb['brandVoiceGuide'] ?? '']]);
    exit;
}

/* ---- content generation ---- */
if ($action === 'generate') {
    $type = (string) ($p['type'] ?? 'generic');
    $brief = trim((string) ($p['brief'] ?? ''));
    if ($brief === '') { echo json_encode(['ok' => false, 'error' => 'Please describe what you want to create.']); exit; }
    $opts = is_array($p['options'] ?? null) ? $p['options'] : [];
    [$instr, $max] = gen_template($type, $opts);
    $userMsg = $instr . "\n\n# Brief from the team\n" . substr($brief, 0, 6000);
    if (!empty($opts['keywords'])) $userMsg .= "\n\n# Target keywords / phrases\n" . substr((string) $opts['keywords'], 0, 600);
    if (!empty($opts['audience'])) $userMsg .= "\n\n# Target audience\n" . substr((string) $opts['audience'], 0, 400);
    if (!empty($opts['tone'])) $userMsg .= "\n\n# Preferred tone\n" . substr((string) $opts['tone'], 0, 160);
    $sys = brand_system($cfg, $KB);
    @set_time_limit(190);
    $r = anthropic_call($cfg['apiKey'] ?? '', $MODEL, $sys, [['role' => 'user', 'content' => $userMsg]], $max, $err);
    if (!$r) { echo json_encode(['ok' => false, 'error' => $err]); exit; }
    ai_log($LOG, $p, 'Generated content (' . $type . ')', substr($brief, 0, 120));
    echo json_encode(['ok' => true, 'text' => $r['text'], 'usage' => $r['usage'], 'model' => $r['model'], 'type' => $type]);
    exit;
}

/* ---- admin chat assistant ---- */
if ($action === 'chat') {
    $msgs = [];
    foreach ((array) ($p['messages'] ?? []) as $m) {
        $role = (($m['role'] ?? '') === 'assistant') ? 'assistant' : 'user';
        $content = substr((string) ($m['content'] ?? ''), 0, 8000);
        if ($content === '') continue;
        $msgs[] = ['role' => $role, 'content' => $content];
    }
    if (!$msgs) { echo json_encode(['ok' => false, 'error' => 'No message provided.']); exit; }
    if (($msgs[0]['role'] ?? '') !== 'user') array_unshift($msgs, ['role' => 'user', 'content' => '(continue)']);
    $sys = brand_system($cfg, $KB) . "\n\nYou are also an interactive marketing assistant for the iMigrate admin team. Help them draft, refine and plan content, ads, SEO and campaigns. When asked to write something, produce it directly, then offer to refine it.";
    @set_time_limit(190);
    $r = anthropic_call($cfg['apiKey'] ?? '', $MODEL, $sys, $msgs, 3000, $err);
    if (!$r) { echo json_encode(['ok' => false, 'error' => $err]); exit; }
    ai_log($LOG, $p, 'AI chat', substr($msgs[count($msgs) - 1]['content'], 0, 120));
    echo json_encode(['ok' => true, 'reply' => $r['text'], 'usage' => $r['usage']]);
    exit;
}

/* ---- draft store (with per-draft version history) ---- */
if ($action === 'drafts.list') {
    $d = jload($DRAFTS, []);
    $out = array_map(fn($x) => ['id' => $x['id'] ?? '', 'title' => $x['title'] ?? 'Untitled', 'type' => $x['type'] ?? 'generic', 'status' => $x['status'] ?? 'draft', 'author' => $x['author'] ?? '', 'updatedAt' => $x['updatedAt'] ?? '', 'versions' => count($x['versions'] ?? [])], $d);
    echo json_encode(['ok' => true, 'drafts' => array_reverse($out)]);
    exit;
}
if ($action === 'drafts.get') {
    $d = jload($DRAFTS, []);
    foreach ($d as $x) if (($x['id'] ?? '') === (string) ($p['id'] ?? '')) { echo json_encode(['ok' => true, 'draft' => $x]); exit; }
    echo json_encode(['ok' => false, 'error' => 'Draft not found']); exit;
}
if ($action === 'drafts.save') {
    $d = jload($DRAFTS, []);
    $in = is_array($p['draft'] ?? null) ? $p['draft'] : [];
    $a = ai_actor($p);
    $id = (string) ($in['id'] ?? '');
    $title = substr(trim((string) ($in['title'] ?? 'Untitled')), 0, 160) ?: 'Untitled';
    $content = (string) ($in['content'] ?? '');
    $type = substr((string) ($in['type'] ?? 'generic'), 0, 40);
    $idx = null;
    foreach ($d as $i => $x) if (($x['id'] ?? '') === $id) $idx = $i;
    if ($idx === null) {
        $rec = ['id' => 'd-' . date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 4), 'title' => $title, 'type' => $type, 'content' => $content, 'status' => 'draft', 'author' => $a['user'], 'createdAt' => date('c'), 'updatedAt' => date('c'), 'versions' => [['ts' => date('c'), 'content' => $content, 'note' => 'created', 'by' => $a['user']]]];
        $d[] = $rec;
        jsave($DRAFTS, $d);
        ai_log($LOG, $p, 'Draft saved', $title);
        echo json_encode(['ok' => true, 'id' => $rec['id']]);
        exit;
    }
    $x = &$d[$idx];
    if (($x['content'] ?? '') !== $content) {
        $x['versions'][] = ['ts' => date('c'), 'content' => $x['content'] ?? '', 'note' => 'edit', 'by' => $a['user']];
        $x['versions'] = array_slice($x['versions'], -30);
    }
    $x['title'] = $title; $x['content'] = $content; $x['type'] = $type; $x['updatedAt'] = date('c');
    if (isset($in['status'])) $x['status'] = substr((string) $in['status'], 0, 20);
    unset($x);
    jsave($DRAFTS, $d);
    ai_log($LOG, $p, 'Draft updated', $title);
    echo json_encode(['ok' => true, 'id' => $id]);
    exit;
}
if ($action === 'drafts.delete') {
    $d = array_values(array_filter(jload($DRAFTS, []), fn($x) => ($x['id'] ?? '') !== (string) ($p['id'] ?? '')));
    jsave($DRAFTS, $d);
    ai_log($LOG, $p, 'Draft deleted', (string) ($p['id'] ?? ''));
    echo json_encode(['ok' => true]);
    exit;
}
if ($action === 'draft.restore') {
    $d = jload($DRAFTS, []);
    $id = (string) ($p['id'] ?? ''); $vts = (string) ($p['ts'] ?? '');
    foreach ($d as &$x) {
        if (($x['id'] ?? '') === $id) {
            foreach (($x['versions'] ?? []) as $v) {
                if (($v['ts'] ?? '') === $vts) {
                    $x['versions'][] = ['ts' => date('c'), 'content' => $x['content'] ?? '', 'note' => 'pre-restore', 'by' => ai_actor($p)['user']];
                    $x['versions'] = array_slice($x['versions'], -30);
                    $x['content'] = $v['content'] ?? ''; $x['updatedAt'] = date('c');
                    jsave($DRAFTS, $d);
                    ai_log($LOG, $p, 'Draft version restored', $id);
                    echo json_encode(['ok' => true]); exit;
                }
            }
        }
    }
    unset($x);
    echo json_encode(['ok' => false, 'error' => 'Version not found']); exit;
}

/* ---- activity log ---- */
if ($action === 'log.list') {
    $r = [];
    if (is_file($LOG)) {
        $lines = array_reverse(file($LOG, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));
        foreach ($lines as $l) { $x = json_decode($l, true); if (is_array($x)) $r[] = $x; if (count($r) >= 200) break; }
    }
    echo json_encode(['ok' => true, 'log' => $r]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
