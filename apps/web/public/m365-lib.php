<?php
/**
 * Microsoft Graph helper library for the iMigrate CRM.
 *
 * Reads credentials from m365-config.php (copy of m365-config.example.php) and
 * stores OAuth tokens in leads/m365-tokens.json (web-protected). Provides token
 * refresh plus thin wrappers for sendMail, inbox read, calendar events and
 * OneDrive upload. Safe to include when unconfigured — all calls degrade to
 * "not connected".
 */
if (defined('M365_LIB')) { return; }
define('M365_LIB', 1);

function m365_config() {
    static $cfg = null;
    if ($cfg !== null) return $cfg;
    $cfg = [];
    if (is_file(__DIR__ . '/m365-config.php')) {
        include __DIR__ . '/m365-config.php';
        if (isset($M365) && is_array($M365)) $cfg = $M365;
    }
    return $cfg;
}
function m365_is_configured() {
    $c = m365_config();
    return !empty($c['client_id']) && !empty($c['client_secret']) && $c['client_id'] !== 'YOUR_AZURE_APP_CLIENT_ID';
}
function m365_token_file() { return __DIR__ . '/leads/m365-tokens.json'; }
function m365_load_tokens() {
    $f = m365_token_file();
    if (!is_file($f)) return null;
    $t = json_decode((string) file_get_contents($f), true);
    return is_array($t) ? $t : null;
}
function m365_store_tokens($t) {
    $dir = __DIR__ . '/leads';
    if (!is_dir($dir)) { @mkdir($dir, 0755, true); @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n"); }
    return @file_put_contents(m365_token_file(), json_encode($t), LOCK_EX) !== false;
}
function m365_is_connected() {
    $t = m365_load_tokens();
    return m365_is_configured() && $t && !empty($t['refresh_token']);
}

function m365_authorize_url($state = '') {
    $c = m365_config();
    $q = http_build_query([
        'client_id' => $c['client_id'],
        'response_type' => 'code',
        'redirect_uri' => $c['redirect_uri'],
        'response_mode' => 'query',
        'scope' => $c['scopes'] ?? 'offline_access User.Read Mail.Send Mail.Read Calendars.ReadWrite Files.ReadWrite',
        'state' => $state,
    ]);
    return 'https://login.microsoftonline.com/' . ($c['tenant'] ?: 'common') . '/oauth2/v2.0/authorize?' . $q;
}

function m365_http($url, $fields = null, $headers = [], $method = 'POST') {
    $ch = curl_init($url);
    $opt = [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 30, CURLOPT_CUSTOMREQUEST => $method];
    if ($fields !== null) $opt[CURLOPT_POSTFIELDS] = is_array($fields) ? http_build_query($fields) : $fields;
    if ($headers) $opt[CURLOPT_HTTPHEADER] = $headers;
    curl_setopt_array($ch, $opt);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'body' => $body, 'json' => json_decode((string) $body, true)];
}

function m365_token_endpoint() {
    $c = m365_config();
    return 'https://login.microsoftonline.com/' . ($c['tenant'] ?: 'common') . '/oauth2/v2.0/token';
}

/** Exchange an auth code for tokens (called from m365.php callback). */
function m365_exchange_code($code) {
    $c = m365_config();
    $r = m365_http(m365_token_endpoint(), [
        'client_id' => $c['client_id'],
        'client_secret' => $c['client_secret'],
        'grant_type' => 'authorization_code',
        'code' => $code,
        'redirect_uri' => $c['redirect_uri'],
        'scope' => $c['scopes'],
    ]);
    if ($r['code'] === 200 && !empty($r['json']['access_token'])) {
        $t = $r['json'];
        $t['obtained_at'] = time();
        m365_store_tokens($t);
        return true;
    }
    return false;
}

/** Return a valid access token, refreshing if needed. */
function m365_access_token() {
    $t = m365_load_tokens();
    if (!$t || empty($t['refresh_token'])) return null;
    $age = time() - (int) ($t['obtained_at'] ?? 0);
    if (!empty($t['access_token']) && $age < (int) ($t['expires_in'] ?? 3600) - 120) {
        return $t['access_token'];
    }
    $c = m365_config();
    $r = m365_http(m365_token_endpoint(), [
        'client_id' => $c['client_id'],
        'client_secret' => $c['client_secret'],
        'grant_type' => 'refresh_token',
        'refresh_token' => $t['refresh_token'],
        'scope' => $c['scopes'],
    ]);
    if ($r['code'] === 200 && !empty($r['json']['access_token'])) {
        $n = $r['json'];
        $n['obtained_at'] = time();
        if (empty($n['refresh_token'])) $n['refresh_token'] = $t['refresh_token'];
        m365_store_tokens($n);
        return $n['access_token'];
    }
    return null;
}

function m365_graph($path, $body = null, $method = 'GET') {
    $tok = m365_access_token();
    if (!$tok) return ['code' => 401, 'json' => null, 'error' => 'not connected'];
    $headers = ['Authorization: Bearer ' . $tok, 'Content-Type: application/json', 'Accept: application/json'];
    $url = 'https://graph.microsoft.com/v1.0' . $path;
    return m365_http($url, $body !== null ? json_encode($body) : null, $headers, $method);
}

/* ---------- Feature wrappers ---------- */
function m365_send_mail($to, $subject, $html) {
    $r = m365_graph('/me/sendMail', [
        'message' => [
            'subject' => $subject,
            'body' => ['contentType' => 'HTML', 'content' => $html],
            'toRecipients' => [['emailAddress' => ['address' => $to]]],
        ],
        'saveToSentItems' => true,
    ], 'POST');
    return $r['code'] >= 200 && $r['code'] < 300;
}
function m365_list_messages($top = 15, $search = '') {
    $q = '/me/messages?$top=' . (int) $top . '&$select=subject,from,receivedDateTime,bodyPreview,isRead,webLink&$orderby=receivedDateTime desc';
    if ($search !== '') $q = '/me/messages?$search="' . rawurlencode($search) . '"&$top=' . (int) $top;
    $r = m365_graph($q);
    return ($r['code'] === 200 && isset($r['json']['value'])) ? $r['json']['value'] : [];
}
function m365_create_event($subject, $startIso, $endIso, $attendee = '', $body = '') {
    $ev = [
        'subject' => $subject,
        'start' => ['dateTime' => $startIso, 'timeZone' => 'UTC'],
        'end' => ['dateTime' => $endIso, 'timeZone' => 'UTC'],
        'body' => ['contentType' => 'HTML', 'content' => $body],
    ];
    if ($attendee) $ev['attendees'] = [['emailAddress' => ['address' => $attendee], 'type' => 'required']];
    $r = m365_graph('/me/events', $ev, 'POST');
    return $r['code'] >= 200 && $r['code'] < 300 ? $r['json'] : null;
}
function m365_onedrive_upload($name, $content, $folder = 'iMigrate CRM') {
    $tok = m365_access_token();
    if (!$tok) return null;
    $path = '/me/drive/root:/' . rawurlencode($folder) . '/' . rawurlencode($name) . ':/content';
    $headers = ['Authorization: Bearer ' . $tok, 'Content-Type: application/octet-stream'];
    $r = m365_http('https://graph.microsoft.com/v1.0' . $path, $content, $headers, 'PUT');
    return $r['code'] >= 200 && $r['code'] < 300 ? $r['json'] : null;
}
function m365_me() {
    $r = m365_graph('/me?$select=displayName,mail,userPrincipalName');
    return $r['code'] === 200 ? $r['json'] : null;
}
function m365_status() {
    $configured = m365_is_configured();
    $connected = m365_is_connected();
    $me = ($connected && m365_access_token()) ? m365_me() : null;
    return [
        'configured' => $configured,
        'connected' => $connected && $me !== null,
        'hasTokens' => (bool) m365_load_tokens(),
        'account' => $me ? ($me['mail'] ?? $me['userPrincipalName'] ?? '') : '',
        'displayName' => $me['displayName'] ?? '',
    ];
}
