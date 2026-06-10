<?php
/**
 * Unified Admin Portal backend — per-user auth + RBAC + user management +
 * audit log + security, for portal.html.
 *
 * Data lives in a web-protected, deploy-excluded auth/ directory:
 *   auth/users.json, auth/roles.json, auth/sessions.ndjson, auth/audit.ndjson,
 *   auth/security.json, auth/company.json
 *
 * Bootstrap: until the first user exists, the legacy admin password
 * ($EDIT_PASSWORD) logs in as a synthetic Super Admin so you can create users.
 *
 * Access control is UI-level + audited: a successful login returns the shared
 * service key (svc) the existing CMS/CRM endpoints already use, plus the user's
 * resolved permissions which the portal/CMS/CRM use to gate modules & actions.
 *
 * POST JSON { action, token?, ... }. See the action switch below.
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }

$dir = __DIR__ . '/auth';
if (!is_dir($dir)) { @mkdir($dir, 0755, true); @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n"); }

/* ---------------- helpers ---------------- */
function j_load($f, $def) { if (is_file($f)) { $d = json_decode((string) file_get_contents($f), true); return $d === null ? $def : $d; } return $def; }
function j_save($f, $d) { return @file_put_contents($f, json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false; }
function nd_append($f, $row) { @file_put_contents($f, json_encode($row) . "\n", FILE_APPEND | LOCK_EX); }
function nd_load($f) { $r = []; if (is_file($f)) foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $l) { $x = json_decode($l, true); if (is_array($x)) $r[] = $x; } return $r; }
function uid() { return 'u-' . date('Ymd') . '-' . substr(md5(uniqid('', true)), 0, 6); }
function tok() { return bin2hex(random_bytes(24)); }
function client_ip() { return substr((string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? ''), 0, 64); }

$USERS = $dir . '/users.json';
$ROLES = $dir . '/roles.json';
$SESS  = $dir . '/sessions.ndjson';
$AUDIT = $dir . '/audit.ndjson';
$SECF  = $dir . '/security.json';
$COMPF = $dir . '/company.json';

/* ---------------- default roles & permission model ---------------- */
$MODULES = [
  'cms.pages','cms.blogs','cms.faqs','cms.media','cms.menus','cms.forms','cms.seo','cms.settings',
  'crm.leads','crm.aileads','crm.reports','crm.pipeline','crm.tasks','crm.documents','crm.notes','crm.activities',
  'mkt.social','mkt.gbp','mkt.email','mkt.emailauto','mkt.whatsapp','mkt.ads','mkt.calendar','mkt.analytics',
  'int.m365','int.google','int.hubspot','int.mailchimp','int.activecampaign','int.whatsappapi',
  'settings.company','settings.users','settings.roles','settings.apikeys','settings.backup','settings.security',
];
$ACTIONS = ['view','create','edit','delete','publish','export','import','approve'];

function default_roles($MODULES) {
  $all = function ($mods, $acts) { $o = []; foreach ($mods as $m) $o[$m] = $acts; return $o; };
  $view = function ($mods) { $o = []; foreach ($mods as $m) $o[$m] = ['view']; return $o; };
  $cmsMods = ['cms.pages','cms.blogs','cms.faqs','cms.media','cms.menus','cms.forms','cms.seo','cms.settings'];
  $crmMods = ['crm.leads','crm.aileads','crm.reports','crm.pipeline','crm.tasks','crm.documents','crm.notes','crm.activities'];
  $mktMods = ['mkt.social','mkt.gbp','mkt.email','mkt.emailauto','mkt.whatsapp','mkt.ads','mkt.calendar','mkt.analytics'];
  return [
    'Super Admin'      => ['system' => true, 'all' => true, 'desc' => 'Full access to every module and system setting.', 'perms' => []],
    'Website Admin'    => ['system' => true, 'desc' => 'CMS, Blogs, SEO, Forms, Media. No CRM or financials.', 'perms' => $all(['cms.pages','cms.blogs','cms.faqs','cms.media','cms.menus','cms.forms','cms.seo','cms.settings'], ['view','create','edit','delete','publish','export'])],
    'CRM Manager'      => ['system' => true, 'desc' => 'Leads, AI Reports, Pipeline, Tasks, Documents, Notes, Activities. No website content.', 'perms' => $all($crmMods, ['view','create','edit','delete','export'])],
    'Marketing Manager'=> ['system' => true, 'desc' => 'Marketing Hub, Email, Social, Ads, Analytics. Read-only CRM leads.', 'perms' => array_merge($all($mktMods, ['view','create','edit','delete','publish']), ['crm.leads' => ['view'], 'crm.reports' => ['view']])],
    'Consultant'       => ['system' => true, 'desc' => 'Assigned leads, notes, documents, tasks, consultations.', 'perms' => $all(['crm.leads','crm.notes','crm.documents','crm.tasks','crm.activities'], ['view','create','edit'])],
    'Sales Agent'      => ['system' => true, 'desc' => 'Leads, Pipeline, Tasks, Consultation booking.', 'perms' => $all(['crm.leads','crm.pipeline','crm.tasks'], ['view','create','edit'])],
    'Content Editor'   => ['system' => true, 'desc' => 'CMS, Blogs, FAQs, Landing pages. Cannot publish without approval.', 'perms' => $all(['cms.pages','cms.blogs','cms.faqs','cms.media'], ['view','create','edit'])],
    'Viewer'           => ['system' => true, 'desc' => 'Read-only access to assigned modules.', 'perms' => $view(array_merge($cmsMods, $crmMods))],
  ];
}

function get_roles($ROLES, $MODULES) {
  $roles = j_load($ROLES, null);
  if (!is_array($roles) || !$roles) { $roles = default_roles($MODULES); j_save($ROLES, $roles); }
  return $roles;
}
function resolve_perms($roles, $roleName) {
  $r = $roles[$roleName] ?? null;
  if (!$r) return ['all' => false, 'perms' => []];
  if (!empty($r['all'])) return ['all' => true, 'perms' => []];
  return ['all' => false, 'perms' => $r['perms'] ?? []];
}

/* ---------------- sessions ---------------- */
function security_cfg($SECF) {
  return array_merge([
    'sessionTimeoutMins' => 480, 'passwordMinLen' => 8, 'passwordRequireNumber' => true,
    'passwordRequireUpper' => true, 'loginNotifications' => false, 'ipAllowlist' => [],
  ], j_load($SECF, []));
}
function session_create($SESS, $user, $svc) {
  $t = tok();
  nd_append($SESS, ['token' => $t, 'userId' => $user['id'], 'role' => $user['role'], 'at' => date('c'), 'ip' => client_ip()]);
  return $t;
}
function session_user($SESS, $USERS, $ROLES, $MODULES, $SECF, $token) {
  if (!$token) return null;
  $rows = nd_load($SESS);
  $s = null; foreach ($rows as $r) if (($r['token'] ?? '') === $token) $s = $r;
  if (!$s) return null;
  $timeout = (int) security_cfg($SECF)['sessionTimeoutMins'] * 60;
  if (strtotime($s['at'] ?? '') + $timeout < time()) return null; // expired
  // Synthetic bootstrap super admin
  if (($s['userId'] ?? '') === 'bootstrap') {
    return ['id' => 'bootstrap', 'name' => 'Administrator', 'email' => '', 'role' => 'Super Admin', 'status' => 'active'];
  }
  $users = j_load($USERS, []);
  foreach ($users as $u) if (($u['id'] ?? '') === ($s['userId'] ?? '')) { unset($u['passHash'], $u['twofaSecret']); return $u; }
  return null;
}

/* ---------------- TOTP (RFC 6238) ---------------- */
function b32_decode($b32) {
  $map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; $b32 = strtoupper($b32); $bits = ''; $out = '';
  for ($i = 0; $i < strlen($b32); $i++) { $v = strpos($map, $b32[$i]); if ($v === false) continue; $bits .= str_pad(decbin($v), 5, '0', STR_PAD_LEFT); }
  for ($i = 0; $i + 8 <= strlen($bits); $i += 8) $out .= chr(bindec(substr($bits, $i, 8)));
  return $out;
}
function totp_now($secret, $t = null) {
  $t = $t === null ? floor(time() / 30) : $t;
  $key = b32_decode($secret);
  $bin = pack('N*', 0) . pack('N*', $t);
  $hash = hash_hmac('sha1', $bin, $key, true);
  $off = ord($hash[19]) & 0xf;
  $code = ((ord($hash[$off]) & 0x7f) << 24 | (ord($hash[$off + 1]) & 0xff) << 16 | (ord($hash[$off + 2]) & 0xff) << 8 | (ord($hash[$off + 3]) & 0xff)) % 1000000;
  return str_pad((string) $code, 6, '0', STR_PAD_LEFT);
}
function totp_verify($secret, $otp) {
  $otp = preg_replace('/\D/', '', (string) $otp);
  for ($w = -1; $w <= 1; $w++) if (hash_equals(totp_now($secret, floor(time() / 30) + $w), $otp)) return true;
  return false;
}
function b32_random() { $map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; $s = ''; for ($i = 0; $i < 16; $i++) $s .= $map[random_int(0, 31)]; return $s; }

/* ---------------- audit ---------------- */
function audit($AUDIT, $user, $action, $module, $detail) {
  nd_append($AUDIT, ['at' => date('c'), 'user' => is_array($user) ? ($user['name'] ?? $user['email'] ?? '?') : (string) $user, 'role' => is_array($user) ? ($user['role'] ?? '') : '', 'action' => $action, 'module' => $module, 'detail' => substr((string) $detail, 0, 300), 'ip' => client_ip()]);
}

/* ---------------- password policy ---------------- */
function password_ok($pw, $SECF, &$err) {
  $c = security_cfg($SECF);
  if (strlen($pw) < $c['passwordMinLen']) { $err = "Password must be at least {$c['passwordMinLen']} characters."; return false; }
  if (!empty($c['passwordRequireNumber']) && !preg_match('/\d/', $pw)) { $err = 'Password must contain a number.'; return false; }
  if (!empty($c['passwordRequireUpper']) && !preg_match('/[A-Z]/', $pw)) { $err = 'Password must contain an uppercase letter.'; return false; }
  return true;
}

/* ================= request ================= */
$p = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($p)) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Bad request']); exit; }
$action = (string) ($p['action'] ?? '');
$roles = get_roles($ROLES, $MODULES);

/* ---------- LOGIN (no token) ---------- */
if ($action === 'login') {
  $username = strtolower(trim((string) ($p['username'] ?? '')));
  $password = (string) ($p['password'] ?? '');
  $otp = (string) ($p['otp'] ?? '');
  $users = j_load($USERS, []);
  // IP allowlist
  $c = security_cfg($SECF);
  if (!empty($c['ipAllowlist']) && is_array($c['ipAllowlist']) && !in_array(client_ip(), $c['ipAllowlist'], true)) {
    http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Access not allowed from this network']); exit;
  }
  // Bootstrap: no users yet → legacy admin password = Super Admin
  if (!$users && hash_equals($EDIT_PASSWORD, $password)) {
    $t = tok(); nd_append($SESS, ['token' => $t, 'userId' => 'bootstrap', 'role' => 'Super Admin', 'at' => date('c'), 'ip' => client_ip()]);
    audit($AUDIT, ['name' => 'Administrator', 'role' => 'Super Admin'], 'Login', 'auth', 'bootstrap');
    echo json_encode(['ok' => true, 'token' => $t, 'svc' => $EDIT_PASSWORD, 'user' => ['name' => 'Administrator', 'email' => '', 'role' => 'Super Admin'], 'permissions' => ['all' => true, 'perms' => []], 'bootstrap' => true]);
    exit;
  }
  $u = null; foreach ($users as $x) if (strtolower($x['username'] ?? '') === $username || strtolower($x['email'] ?? '') === $username) $u = $x;
  if (!$u || ($u['status'] ?? 'active') !== 'active' || !password_verify($password, $u['passHash'] ?? '')) {
    audit($AUDIT, $username ?: '(unknown)', 'Login failed', 'auth', $username);
    http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Invalid credentials or inactive account']); exit;
  }
  if (!empty($u['twofaEnabled'])) {
    if ($otp === '') { echo json_encode(['ok' => false, 'twofa' => true, 'error' => 'Enter your 6-digit authenticator code']); exit; }
    if (!totp_verify($u['twofaSecret'] ?? '', $otp)) { http_response_code(403); echo json_encode(['ok' => false, 'twofa' => true, 'error' => 'Invalid 2FA code']); exit; }
  }
  // update lastLogin
  foreach ($users as &$x) if (($x['id'] ?? '') === $u['id']) { $x['lastLogin'] = date('c'); $x['lastIp'] = client_ip(); }
  unset($x); j_save($USERS, $users);
  $t = session_create($SESS, $u, $EDIT_PASSWORD);
  audit($AUDIT, $u, 'Login', 'auth', '');
  if (!empty($c['loginNotifications']) && !empty($u['email'])) {
    @mail($u['email'], 'iMigrate Admin Portal sign-in', 'A sign-in to your iMigrate Admin Portal account occurred at ' . date('c') . ' from IP ' . client_ip() . '.', 'From: no-reply@imigratesolution.com');
  }
  $perm = resolve_perms($roles, $u['role']);
  echo json_encode(['ok' => true, 'token' => $t, 'svc' => $EDIT_PASSWORD, 'user' => ['id' => $u['id'], 'name' => $u['name'], 'email' => $u['email'], 'role' => $u['role']], 'permissions' => $perm]);
  exit;
}

/* ---------- everything else requires a valid session ---------- */
$me = session_user($SESS, $USERS, $ROLES, $MODULES, $SECF, (string) ($p['token'] ?? ''));
if (!$me) { http_response_code(401); echo json_encode(['ok' => false, 'error' => 'Session expired — please sign in again']); exit; }
$myPerm = resolve_perms($roles, $me['role']);
$isAdmin = !empty($myPerm['all']);
function can($myPerm, $module, $act = 'view') { if (!empty($myPerm['all'])) return true; $a = $myPerm['perms'][$module] ?? []; return in_array($act, $a, true); }

if ($action === 'session') { echo json_encode(['ok' => true, 'user' => ['id' => $me['id'], 'name' => $me['name'] ?? '', 'email' => $me['email'] ?? '', 'role' => $me['role']], 'permissions' => $myPerm, 'svc' => $EDIT_PASSWORD]); exit; }
if ($action === 'logout') { $rows = nd_load($SESS); $rows = array_filter($rows, fn($r) => ($r['token'] ?? '') !== ($p['token'] ?? '')); $o = ''; foreach ($rows as $r) $o .= json_encode($r) . "\n"; @file_put_contents($SESS, $o, LOCK_EX); audit($AUDIT, $me, 'Logout', 'auth', ''); echo json_encode(['ok' => true]); exit; }

if ($action === 'audit.log') { audit($AUDIT, $me, (string) ($p['actionName'] ?? 'Action'), (string) ($p['module'] ?? ''), (string) ($p['detail'] ?? '')); echo json_encode(['ok' => true]); exit; }

/* ---------- user management (needs settings.users) ---------- */
function require_perm($ok) { if (!$ok) { http_response_code(403); echo json_encode(['ok' => false, 'error' => 'Permission denied']); exit; } }

if ($action === 'users.list') { require_perm(can($myPerm, 'settings.users')); $users = array_map(function ($u) { unset($u['passHash'], $u['twofaSecret']); return $u; }, j_load($USERS, [])); echo json_encode(['ok' => true, 'users' => $users]); exit; }

if ($action === 'users.save') {
  require_perm(can($myPerm, 'settings.users', 'create') || can($myPerm, 'settings.users', 'edit'));
  $users = j_load($USERS, []);
  $in = is_array($p['user'] ?? null) ? $p['user'] : [];
  $id = (string) ($in['id'] ?? '');
  $err = '';
  $idx = null; foreach ($users as $i => $u) if (($u['id'] ?? '') === $id) $idx = $i;
  if ($idx === null) { // create
    if (!filter_var($in['email'] ?? '', FILTER_VALIDATE_EMAIL)) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Valid email required']); exit; }
    $pw = (string) ($in['password'] ?? '');
    if (!password_ok($pw, $SECF, $err)) { http_response_code(400); echo json_encode(['ok' => false, 'error' => $err]); exit; }
    $rec = ['id' => uid(), 'name' => substr((string) ($in['name'] ?? ''), 0, 80), 'email' => strtolower(trim($in['email'])), 'username' => strtolower(trim((string) ($in['username'] ?? $in['email']))), 'role' => (string) ($in['role'] ?? 'Viewer'), 'status' => 'active', 'passHash' => password_hash($pw, PASSWORD_BCRYPT), 'twofaEnabled' => false, 'createdAt' => date('c'), 'lastLogin' => null];
    $users[] = $rec; audit($AUDIT, $me, 'User created', 'settings.users', $rec['email']);
  } else { // update
    $u = &$users[$idx];
    foreach (['name','email','username','role','status'] as $k) if (isset($in[$k])) $u[$k] = substr((string) $in[$k], 0, 80);
    if (!empty($in['password'])) { if (!password_ok($in['password'], $SECF, $err)) { http_response_code(400); echo json_encode(['ok' => false, 'error' => $err]); exit; } $u['passHash'] = password_hash($in['password'], PASSWORD_BCRYPT); }
    unset($u); audit($AUDIT, $me, 'User updated', 'settings.users', $in['email'] ?? $id);
  }
  j_save($USERS, $users); echo json_encode(['ok' => true]); exit;
}
if ($action === 'users.delete') { require_perm(can($myPerm, 'settings.users', 'delete')); $id = (string) ($p['id'] ?? ''); $users = array_values(array_filter(j_load($USERS, []), fn($u) => ($u['id'] ?? '') !== $id)); j_save($USERS, $users); audit($AUDIT, $me, 'User deleted', 'settings.users', $id); echo json_encode(['ok' => true]); exit; }

/* ---------- roles & permissions (needs settings.roles) ---------- */
if ($action === 'roles.list') { require_perm(can($myPerm, 'settings.roles') || $isAdmin); echo json_encode(['ok' => true, 'roles' => $roles, 'modules' => $MODULES, 'actions' => $ACTIONS]); exit; }
if ($action === 'roles.save') {
  require_perm(can($myPerm, 'settings.roles', 'edit') || $isAdmin);
  $name = trim((string) ($p['name'] ?? '')); if ($name === '') { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Role name required']); exit; }
  if (!empty($roles[$name]['system'])) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Built-in roles cannot be edited']); exit; }
  $roles[$name] = ['desc' => substr((string) ($p['desc'] ?? ''), 0, 200), 'perms' => is_array($p['perms'] ?? null) ? $p['perms'] : []];
  j_save($ROLES, $roles); audit($AUDIT, $me, 'Role saved', 'settings.roles', $name); echo json_encode(['ok' => true]); exit;
}
if ($action === 'roles.delete') { require_perm(can($myPerm, 'settings.roles', 'delete') || $isAdmin); $name = (string) ($p['name'] ?? ''); if (!empty($roles[$name]['system'])) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Cannot delete a built-in role']); exit; } unset($roles[$name]); j_save($ROLES, $roles); audit($AUDIT, $me, 'Role deleted', 'settings.roles', $name); echo json_encode(['ok' => true]); exit; }

/* ---------- audit log view ---------- */
if ($action === 'audit.list') { require_perm($isAdmin || can($myPerm, 'settings.security')); $rows = array_reverse(nd_load($AUDIT)); echo json_encode(['ok' => true, 'audit' => array_slice($rows, 0, (int) ($p['limit'] ?? 300))]); exit; }

/* ---------- security & company ---------- */
if ($action === 'security.get') { require_perm($isAdmin || can($myPerm, 'settings.security')); echo json_encode(['ok' => true, 'security' => security_cfg($SECF)]); exit; }
if ($action === 'security.set') { require_perm($isAdmin || can($myPerm, 'settings.security', 'edit')); $cur = security_cfg($SECF); foreach (['sessionTimeoutMins','passwordMinLen','passwordRequireNumber','passwordRequireUpper','loginNotifications','ipAllowlist'] as $k) if (isset($p['security'][$k])) $cur[$k] = $p['security'][$k]; j_save($SECF, $cur); audit($AUDIT, $me, 'Security settings updated', 'settings.security', ''); echo json_encode(['ok' => true]); exit; }
if ($action === 'company.get') { echo json_encode(['ok' => true, 'company' => j_load($COMPF, [])]); exit; }
if ($action === 'company.set') { require_perm($isAdmin || can($myPerm, 'settings.company', 'edit')); j_save($COMPF, is_array($p['company'] ?? null) ? $p['company'] : []); audit($AUDIT, $me, 'Company info updated', 'settings.company', ''); echo json_encode(['ok' => true]); exit; }

/* ---------- 2FA ---------- */
if ($action === '2fa.setup') {
  $secret = b32_random();
  $label = rawurlencode('iMigrate Admin (' . ($me['email'] ?: $me['name']) . ')');
  echo json_encode(['ok' => true, 'secret' => $secret, 'otpauth' => "otpauth://totp/$label?secret=$secret&issuer=iMigrate"]);
  exit;
}
if ($action === '2fa.enable') {
  $secret = (string) ($p['secret'] ?? ''); $otp = (string) ($p['otp'] ?? '');
  if (!totp_verify($secret, $otp)) { http_response_code(400); echo json_encode(['ok' => false, 'error' => 'Code did not match — try again']); exit; }
  $users = j_load($USERS, []); foreach ($users as &$u) if (($u['id'] ?? '') === $me['id']) { $u['twofaEnabled'] = true; $u['twofaSecret'] = $secret; } unset($u);
  j_save($USERS, $users); audit($AUDIT, $me, '2FA enabled', 'settings.security', ''); echo json_encode(['ok' => true]); exit;
}
if ($action === '2fa.disable') {
  $users = j_load($USERS, []); foreach ($users as &$u) if (($u['id'] ?? '') === $me['id']) { $u['twofaEnabled'] = false; unset($u['twofaSecret']); } unset($u);
  j_save($USERS, $users); audit($AUDIT, $me, '2FA disabled', 'settings.security', ''); echo json_encode(['ok' => true]); exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
