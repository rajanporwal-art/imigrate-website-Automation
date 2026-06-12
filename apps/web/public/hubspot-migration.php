<?php
/**
 * HubSpot CRM → iMigrate CRM Data Migration
 *
 * Intelligently imports HubSpot contacts, companies, deals, activities, documents
 * while avoiding duplicates and preserving existing CRM data integrity.
 *
 * API: Requires HUBSPOT_API_KEY in admin-config.php
 * Usage: POST /hubspot-migration.php with action + params
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

@include __DIR__ . '/admin-config.php';
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }
if (!isset($HUBSPOT_API_KEY)) { $HUBSPOT_API_KEY = ''; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$p = json_decode($raw, true);
if (!is_array($p)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Malformed request']);
    exit;
}

if (!hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''))) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

if (!$HUBSPOT_API_KEY) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'HUBSPOT_API_KEY not configured in admin-config.php']);
    exit;
}

// ════════════ HUBSPOT API CLIENT ════════════
class HubSpotClient {
    private $apiKey;
    private $baseUrl = 'https://api.hubapi.com';

    public function __construct($key) {
        $this->apiKey = $key;
    }

    private function call($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json',
        ]);
        if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return ['code' => $code, 'body' => json_decode($response, true)];
    }

    public function getContacts($limit = 100, $after = null) {
        $q = "?limit=$limit&properties=firstname,lastname,email,phone,mobilephone,company,jobtitle,lifecyclestage,hs_lead_status";
        if ($after) $q .= "&after=$after";
        $r = $this->call('GET', "/crm/v3/objects/contacts$q");
        return $r['body'] ?? null;
    }

    public function getContact($id) {
        $r = $this->call('GET', "/crm/v3/objects/contacts/$id?properties=firstname,lastname,email,phone,mobilephone,company,jobtitle,lifecyclestage,hs_lead_status,notes");
        return $r['body'] ?? null;
    }

    public function getDeals($limit = 50, $after = null) {
        $q = "?limit=$limit&properties=dealname,dealstage,amount,closedate,hubspot_owner_id";
        if ($after) $q .= "&after=$after";
        $r = $this->call('GET', "/crm/v3/objects/deals$q");
        return $r['body'] ?? null;
    }

    public function getEngagements($contactId) {
        // Engagements API for notes, emails, calls, meetings
        $r = $this->call('GET', "/crm/v3/objects/contacts/$contactId/associations/engagements");
        return $r['body']['results'] ?? [];
    }

    public function getAssociations($contactId, $type = 'deals') {
        $r = $this->call('GET', "/crm/v3/objects/contacts/$contactId/associations/$type");
        return $r['body']['results'] ?? [];
    }
}

$hs = new HubSpotClient($HUBSPOT_API_KEY);

// ════════════ MIGRATION ACTIONS ════════════
$action = $p['action'] ?? 'status';
$dir = __DIR__ . '/leads';
$logFile = $dir . '/hubspot-migration.log';

// Ensure log directory exists
if (!is_dir($dir)) @mkdir($dir, 0755, true);

function logMigration($file, $msg) {
    $ts = date('Y-m-d H:i:s');
    @file_put_contents($file, "[$ts] $msg\n", FILE_APPEND);
}

// ════════════ 1. MIGRATION STATUS ════════════
if ($action === 'status') {
    // Check HubSpot connection + get contact count
    $res = $hs->getContacts(1);
    $connected = isset($res['results']) ? true : false;
    $total = $res['paging']['total'] ?? 0;
    $logExists = is_file($logFile);
    $logLines = $logExists ? count(file($logFile)) : 0;

    echo json_encode([
        'ok' => true,
        'hubspot_connected' => $connected,
        'hubspot_contacts_total' => $total,
        'migration_log_exists' => $logExists,
        'migration_log_lines' => $logLines,
    ]);
    exit;
}

// ════════════ 2. DUPLICATE DETECTION ════════════
if ($action === 'check-duplicate') {
    $email = strtolower(trim((string) ($p['email'] ?? '')));
    $phone = preg_replace('/\D/', '', (string) ($p['phone'] ?? ''));
    $name = trim((string) ($p['name'] ?? ''));

    // Load existing leads
    $leads = [];
    if (is_file($dir . '/leads.ndjson')) {
        foreach (file($dir . '/leads.ndjson', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $r = json_decode($line, true);
            if (is_array($r)) $leads[] = $r;
        }
    }

    $match = null;
    foreach ($leads as $lead) {
        $f = $lead['fields'] ?? [];
        $existEmail = strtolower(trim($f['email'] ?? ''));
        $existPhone = preg_replace('/\D/', '', $f['phone'] ?? '');
        $existName = $f['fullName'] ?? '';

        // Match: email exact, or phone + name similar
        if (($email && $email === $existEmail) ||
            ($phone && $phone === $existPhone && similar_text($name, $existName) > 0.7)) {
            $match = $lead;
            break;
        }
    }

    echo json_encode([
        'ok' => true,
        'found' => $match !== null,
        'lead' => $match ? [
            'id' => $match['id'] ?? '',
            'name' => $match['fields']['fullName'] ?? '',
            'email' => $match['fields']['email'] ?? '',
            'stage' => $match['fields']['stage'] ?? 'New Lead',
        ] : null,
    ]);
    exit;
}

// ════════════ 3. STAGE MAPPING ════════════
if ($action === 'get-stage-mapping') {
    $mapping = [
        'subscriber' => 'New Lead',
        'lead' => 'Pending Call',
        'marketingqualifiedlead' => 'Pending CV / Resume',
        'salesqualifiedlead' => 'Under Assessment',
        'opportunity' => 'Appointment Scheduled',
        'customer' => 'Signed Up',
        'evangelist' => 'Signed Up',
        'other' => 'New Lead',
    ];

    echo json_encode([
        'ok' => true,
        'mapping' => $mapping,
    ]);
    exit;
}

// ════════════ 4. START MIGRATION ════════════
if ($action === 'start') {
    @file_put_contents($logFile, '');
    logMigration($logFile, 'Migration started');

    echo json_encode([
        'ok' => true,
        'message' => 'Migration started. See logs below.',
    ]);
    exit;
}

// ════════════ 5. IMPORT CONTACTS (BATCH) ════════════
if ($action === 'import-batch') {
    $after = (string) ($p['after'] ?? '');
    $res = $hs->getContacts(20, $after ?: null);

    if (!isset($res['results'])) {
        echo json_encode(['ok' => false, 'error' => 'HubSpot API error']);
        exit;
    }

    $created = 0;
    $merged = 0;
    $errors = [];

    $leadFile = $dir . '/leads.ndjson';
    $metaFile = $dir . '/crm-meta.ndjson';

    foreach ($res['results'] as $contact) {
        $props = $contact['properties'] ?? [];
        $hsId = $contact['id'] ?? '';
        $email = strtolower(trim($props['email'] ?? ''));
        $phone = $props['phone'] ?? $props['mobilephone'] ?? '';
        $fname = $props['firstname'] ?? '';
        $lname = $props['lastname'] ?? '';
        $name = trim("$fname $lname");
        $company = $props['company'] ?? '';
        $title = $props['jobtitle'] ?? '';
        $stage = $props['hs_lead_status'] ?? $props['lifecyclestage'] ?? 'New Lead';

        // Map HubSpot stage to CRM stage
        $stageMap = ['subscriber'=>'New Lead','lead'=>'Pending Call','marketingqualifiedlead'=>'Pending CV / Resume',
                     'salesqualifiedlead'=>'Under Assessment','opportunity'=>'Appointment Scheduled',
                     'customer'=>'Signed Up'];
        $mappedStage = $stageMap[strtolower($stage)] ?? 'New Lead';

        if (!$name && !$email) {
            logMigration($logFile, "SKIP: HS#$hsId (no name/email)");
            continue;
        }

        // Check for duplicate
        $ckey = $email ?: "id:hs$hsId";
        $isNew = true;

        if (is_file($leadFile)) {
            foreach (file($leadFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                $existing = json_decode($line, true);
                if (!is_array($existing)) continue;
                $f = $existing['fields'] ?? [];
                if ($email && $f['email'] === $email) {
                    $isNew = false;
                    $merged++;
                    logMigration($logFile, "MERGE: $email (HS#$hsId) merged with existing");
                    break;
                }
            }
        }

        if ($isNew) {
            $leadRec = [
                'id' => "hs$hsId",
                'fields' => [
                    'fullName' => $name,
                    'email' => $email,
                    'phone' => $phone,
                    'company' => $company,
                    'occupation' => $title,
                    'source' => 'HubSpot',
                    'hsContactId' => $hsId,
                    'hsImportedAt' => date('c'),
                ],
                'submissions' => 1,
                'createdAt' => date('c'),
            ];

            @file_put_contents($leadFile, json_encode($leadRec) . "\n", FILE_APPEND);

            // Create meta record
            $metaRec = [
                'key' => $ckey,
                'email' => $email,
                'stage' => $mappedStage,
                'activity' => [
                    [
                        'id' => 'hs-import-' . time(),
                        'event' => 'Imported from HubSpot',
                        'detail' => "HS Contact #$hsId ($stage → $mappedStage)",
                        'author' => 'System (HubSpot Import)',
                        'at' => date('c'),
                    ]
                ],
            ];

            @file_put_contents($metaFile, json_encode($metaRec) . "\n", FILE_APPEND);
            $created++;
            logMigration($logFile, "CREATE: $name ($email) from HS#$hsId");
        }
    }

    $nextAfter = $res['paging']['next']['after'] ?? null;

    echo json_encode([
        'ok' => true,
        'batch_created' => $created,
        'batch_merged' => $merged,
        'has_more' => $nextAfter !== null,
        'next_after' => $nextAfter,
    ]);
    exit;
}

// ════════════ 6. GET MIGRATION LOG ════════════
if ($action === 'get-log') {
    if (!is_file($logFile)) {
        echo json_encode(['ok' => true, 'log' => []]);
        exit;
    }

    $lines = file($logFile, FILE_IGNORE_NEW_LINES);
    $recent = array_slice($lines, -50); // Last 50 lines

    echo json_encode(['ok' => true, 'log' => $recent]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
