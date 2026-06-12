<?php
/**
 * HubSpot → CRM Migration Trigger
 *
 * Run via: POST /crm-migrate-hubspot.php?action=migrate&password=YOUR_PASSWORD
 * Fetches all HubSpot contacts and intelligently imports into CRM.
 */
header('Content-Type: application/json; charset=utf-8');

@include __DIR__ . '/admin-config.php';
@include __DIR__ . '/auth/secrets.php';

if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }
if (!isset($HUBSPOT_API_KEY)) { $HUBSPOT_API_KEY = ''; }

$pwd = (string) ($_GET['password'] ?? $_POST['password'] ?? '');
if (!hash_equals($EDIT_PASSWORD, $pwd)) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

if (!$HUBSPOT_API_KEY) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'HUBSPOT_API_KEY not configured']);
    exit;
}

$action = (string) ($_GET['action'] ?? 'status');

// ════════════ HUBSPOT CLIENT ════════════
class HubSpotClient {
    private $apiKey;
    public function __construct($key) { $this->apiKey = $key; }

    public function getContacts($after = null) {
        $url = 'https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,phone,mobilephone,company,jobtitle,lifecyclestage,hs_lead_status,notes';
        if ($after) $url .= "&after=$after";

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json',
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code !== 200) {
            throw new Exception("HubSpot API error: HTTP $code");
        }
        return json_decode($response, true);
    }
}

// ════════════ STAGE MAPPING ════════════
// NOTE: HubSpot status values are used directly as stage names (no mapping).
// This preserves the original HubSpot classification in the CRM stage field.
// Previous mapping (kept for reference, no longer used):
$STAGE_MAP = [
    'subscriber' => 'New Lead',
    'lead' => 'Pending Call',
    'marketingqualifiedlead' => 'Pending CV / Resume',
    'salesqualifiedlead' => 'Under Assessment',
    'opportunity' => 'Appointment Scheduled',
    'customer' => 'Signed Up',
];

// ════════════ FILE HELPERS ════════════
$dir = __DIR__ . '/leads';
if (!is_dir($dir)) @mkdir($dir, 0755, true);

function load_leads($file) {
    $rows = [];
    if (is_file($file)) {
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $r = json_decode($line, true);
            if (is_array($r)) $rows[] = $r;
        }
    }
    return $rows;
}

function load_meta($file) {
    $meta = [];
    if (is_file($file)) {
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $r = json_decode($line, true);
            if (is_array($r) && isset($r['key'])) $meta[$r['key']] = $r;
        }
    }
    return $meta;
}

function save_leads($file, $rows) {
    $out = '';
    foreach ($rows as $r) $out .= json_encode($r) . "\n";
    return @file_put_contents($file, $out, LOCK_EX);
}

function save_meta($file, $meta) {
    $out = '';
    foreach ($meta as $m) $out .= json_encode($m) . "\n";
    return @file_put_contents($file, $out, LOCK_EX);
}

function find_match($email, $phone, $name, $leads) {
    $email = strtolower(trim($email ?? ''));
    $phone_clean = preg_replace('/\D/', '', $phone ?? '');
    foreach ($leads as $lead) {
        $f = $lead['fields'] ?? [];
        if ($email && $email === strtolower(trim($f['email'] ?? ''))) return $lead;
        if ($phone_clean && $phone_clean === preg_replace('/\D/', '', $f['phone'] ?? '') && similar_text($name, $f['fullName'] ?? '') > 0.7) return $lead;
    }
    return null;
}

// ════════════ MIGRATION ACTIONS ════════════

if ($action === 'status') {
    try {
        $hs = new HubSpotClient($HUBSPOT_API_KEY);
        $res = $hs->getContacts();
        $total = 0;

        // Count all contacts via pagination
        $after = null;
        while (true) {
            $total += count($res['results'] ?? []);
            $after = $res['paging']['next']['after'] ?? null;
            if (!$after) break;
            $res = $hs->getContacts($after);
        }

        echo json_encode([
            'ok' => true,
            'connected' => true,
            'total_contacts' => $total,
        ]);
    } catch (Exception $e) {
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

if ($action === 'migrate') {
    try {
        $hs = new HubSpotClient($HUBSPOT_API_KEY);

        $leads_file = $dir . '/leads.ndjson';
        $meta_file = $dir . '/crm-meta.ndjson';

        $existing_leads = load_leads($leads_file);
        $existing_meta = load_meta($meta_file);

        $created = 0;
        $merged = 0;
        $skipped = 0;
        $after = null;

        while (true) {
            $result = $hs->getContacts($after);
            if (empty($result['results'])) break;

            foreach ($result['results'] as $contact) {
                $props = $contact['properties'] ?? [];
                $hsId = $contact['id'] ?? '';
                $email = strtolower(trim($props['email'] ?? ''));
                $phone = $props['phone'] ?? $props['mobilephone'] ?? '';
                $fname = $props['firstname'] ?? '';
                $lname = $props['lastname'] ?? '';
                $name = trim("$fname $lname");
                $company = $props['company'] ?? '';
                $title = $props['jobtitle'] ?? '';
                $hsStage = $props['hs_lead_status'] ?? $props['lifecyclestage'] ?? 'lead';

                if (!$name && !$email) {
                    $skipped++;
                    continue;
                }

                $existing = find_match($email, $phone, $name, $existing_leads);

                if ($existing) {
                    // Merge
                    $ckey = strtolower(trim($existing['fields']['email'] ?? '')) ?: 'id:' . ($existing['id'] ?? '');

                    if (!($existing['fields']['phone'] ?? '')) $existing['fields']['phone'] = $phone;
                    if (!($existing['fields']['company'] ?? '')) $existing['fields']['company'] = $company;
                    if (!($existing['fields']['occupation'] ?? '')) $existing['fields']['occupation'] = $title;
                    $existing['fields']['hsContactId'] = $hsId;
                    $existing['fields']['hsLeadStatus'] = $hsStage;

                    foreach ($existing_leads as &$l) {
                        if (($l['id'] ?? '') === ($existing['id'] ?? '')) {
                            $l = $existing;
                            break;
                        }
                    }

                    if (!isset($existing_meta[$ckey])) $existing_meta[$ckey] = ['key' => $ckey, 'activity' => []];
                    $existing_meta[$ckey]['activity'][] = [
                        'id' => 'hs-merge-' . date('YmdHis') . '-' . substr(md5(uniqid()), 0, 6),
                        'event' => 'HubSpot data merged',
                        'detail' => "Phone/company updated from HS#$hsId",
                        'author' => 'System (HubSpot Migration)',
                        'at' => date('c'),
                    ];

                    $merged++;
                } else {
                    // Create
                    $ckey = $email ?: "id:hs$hsId";
                    $mapStage = $hsStage; // Use HubSpot status directly as the stage

                    $newLead = [
                        'id' => "hs$hsId",
                        'fields' => [
                            'fullName' => $name,
                            'email' => $email,
                            'phone' => $phone,
                            'company' => $company,
                            'occupation' => $title,
                            'source' => 'HubSpot',
                            'hsContactId' => $hsId,
                            'hsLeadStatus' => $hsStage,
                        ],
                        'submissions' => 1,
                        'createdAt' => date('c'),
                    ];
                    $existing_leads[] = $newLead;

                    $existing_meta[$ckey] = [
                        'key' => $ckey,
                        'email' => $email,
                        'stage' => $mapStage,
                        'activity' => [[
                            'id' => 'hs-import-' . date('YmdHis') . '-' . substr(md5(uniqid()), 0, 6),
                            'event' => 'Imported from HubSpot',
                            'detail' => "HS#$hsId (stage: $hsStage)",
                            'author' => 'System (HubSpot Migration)',
                            'at' => date('c'),
                        ]],
                    ];

                    $created++;
                }
            }

            $after = $result['paging']['next']['after'] ?? null;
            if (!$after) break;
        }

        save_leads($leads_file, $existing_leads);
        save_meta($meta_file, $existing_meta);

        echo json_encode([
            'ok' => true,
            'created' => $created,
            'merged' => $merged,
            'skipped' => $skipped,
            'total_leads' => count($existing_leads),
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
