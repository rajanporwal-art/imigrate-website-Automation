<?php
/**
 * Emails the personalized AI immigration report to the user.
 *
 * POST JSON: { name, email, mobile, subject, html, points, occupation, visas, tags }
 *
 * NOTE on deliverability: this uses PHP mail() on shared hosting. It works for
 * low volume from the same domain, but for reliable inboxing + drip sequences
 * + WhatsApp/SMS, connect HubSpot (admin → HubSpot & Leads) or an SMTP/ESP.
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 200000) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid request']);
    exit;
}
$p = json_decode($raw, true);
if (!is_array($p)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Malformed request']);
    exit;
}

// Honeypot
if (!empty($p['website'])) { echo json_encode(['ok' => true]); exit; }

// Sanitize header-bound values (prevent header injection).
$clean = function ($v) { return trim(str_replace(["\r", "\n", "%0a", "%0d"], '', (string) $v)); };
$email = $clean($p['email'] ?? '');
$name  = $clean($p['name'] ?? '');
$subject = $clean($p['subject'] ?? 'Your Personalized Australia Immigration Assessment Report');
$html  = (string) ($p['html'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $html === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'A valid email and report are required']);
    exit;
}

$fromDomain = 'imigratesolution.com';
$fromAddr = 'no-reply@' . $fromDomain;
$replyTo  = 'contact@' . $fromDomain;

$headers  = 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-Type: text/html; charset=UTF-8' . "\r\n";
$headers .= 'From: iMigrate Migration Solutions <' . $fromAddr . '>' . "\r\n";
$headers .= 'Reply-To: ' . $replyTo . "\r\n";
$headers .= 'X-Mailer: iMigrate-AI-Report' . "\r\n";

$toHeader = $name !== '' ? ($name . ' <' . $email . '>') : $email;
$sent = @mail($toHeader, $subject, $html, $headers, '-f' . $fromAddr);

// Optional: notify the sales team (uses HubSpot notifyEmail if configured).
$cfgPath = __DIR__ . '/hubspot.json';
$cfg = is_file($cfgPath) ? json_decode((string) file_get_contents($cfgPath), true) : null;
$notify = is_array($cfg) ? ($cfg['notifyEmail'] ?? '') : '';
if ($notify && filter_var($notify, FILTER_VALIDATE_EMAIL)) {
    $tags = $clean($p['tags'] ?? '');
    $priority = (strpos($tags, 'High Points') !== false || strpos($tags, 'Multiple Visa') !== false) ? '[PRIORITY] ' : '';
    $nbody  = "New AI assessment lead\n\n";
    $nbody .= 'Name: ' . $name . "\nEmail: " . $email . "\nMobile: " . $clean($p['mobile'] ?? '') . "\n";
    $nbody .= 'Occupation: ' . $clean($p['occupation'] ?? '') . "\nPoints: " . $clean($p['points'] ?? '') . "\n";
    $nbody .= 'Eligible visas: ' . $clean($p['visas'] ?? '') . "\nTags: " . $tags . "\n";
    @mail($notify, $priority . 'New AI assessment lead: ' . $name, $nbody, 'From: ' . $fromAddr . "\r\nReply-To: " . $email);
}

echo json_encode(['ok' => true, 'emailed' => (bool) $sent]);
