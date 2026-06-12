<?php
/**
 * HubSpot Sync Engine for iMigrate CRM
 *
 * Pulls contacts + email engagement from HubSpot API and merges into iMigrate
 * POST { action: 'sync-contacts' | 'sync-emails' | 'sync-all', password }
 *   -> { ok, imported, merged, created, emailsImported, errors }
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

$p = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($p) || !hash_equals($EDIT_PASSWORD, (string) ($p['password'] ?? ''))) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password']);
    exit;
}

@include __DIR__ . '/auth/secrets.php';
if (!isset($HUBSPOT_API_KEY) || $HUBSPOT_API_KEY === '') {
    http_response_code(503);
    echo json_encode(['ok' => false, 'error' => 'HubSpot API key not configured']);
    exit;
}

$dir = __DIR__ . '/leads';
if (!is_dir($dir)) { @mkdir($dir, 0755, true); }

function load_ndjson($file) {
    $rows = [];
    if (is_file($file)) {
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $r = json_decode($line, true);
            if (is_array($r)) $rows[] = $r;
        }
    }
    return $rows;
}

function save_ndjson($file, $rows) {
    $out = '';
    foreach ($rows as $r) $out .= json_encode($r) . "\n";
    return @file_put_contents($file, $out, LOCK_EX) !== false;
}

function hs_api($endpoint, $apiKey) {
    $url = 'https://api.hubapi.com' . $endpoint;
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ["Authorization: Bearer $apiKey", "Content-Type: application/json"],
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'data' => $resp !== false ? json_decode($resp, true) : null];
}

$action = (string) ($p['action'] ?? 'sync-all');
$imported = 0;
$merged = 0;
$created = 0;
$emailsImported = 0;
$errors = [];

/* ---- SYNC CONTACTS FROM HUBSPOT ---- */
if ($action === 'sync-contacts' || $action === 'sync-all') {
    $leads = load_ndjson($dir . '/leads.ndjson');
    $leadsByEmail = [];
    foreach ($leads as $l) {
        $e = strtolower($l['email'] ?? '');
        if ($e) $leadsByEmail[$e] = $l;
    }

    // Fetch all HubSpot contacts (paginated)
    $after = '';
    $contactCount = 0;
    do {
        $endpoint = '/crm/v3/objects/contacts?limit=100' . ($after ? "&after=$after" : '') .
            '&properties=firstname,lastname,email,phone,jobtitle,company,lifecyclestage,hs_lead_status,hubspotutk,createdate,lastmodifieddate';
        $r = hs_api($endpoint, $HUBSPOT_API_KEY);
        if ($r['code'] !== 200 || !is_array($r['data'])) {
            $errors[] = 'HubSpot API error: ' . ($r['code'] ?? 'unknown');
            break;
        }

        foreach (($r['data']['results'] ?? []) as $contact) {
            $props = $contact['properties'] ?? [];
            $email = strtolower($props['email'] ?? '');
            $hsId = $contact['id'] ?? '';
            if (!$email) continue;

            $contactCount++;
            $name = trim(($props['firstname'] ?? '') . ' ' . ($props['lastname'] ?? ''));

            if (isset($leadsByEmail[$email])) {
                // Merge: update existing lead with HubSpot data
                $lead = $leadsByEmail[$email];
                if (!empty($props['phone'])) $lead['phone'] = $props['phone'];
                if (!empty($props['jobtitle'])) $lead['occupation'] = $props['jobtitle'];
                if (!empty($props['company'])) $lead['company'] = $props['company'];
                if (!empty($props['hs_lead_status']) && !$lead['stage']) $lead['stage'] = $props['hs_lead_status'];
                $lead['hsContactId'] = $hsId;
                $lead['lastSyncedFromHS'] = date('c');
                // Find and update in array
                foreach ($leads as &$l) {
                    if (($l['email'] ?? '') === $email) {
                        $l = $lead;
                        $merged++;
                        break;
                    }
                }
            } else {
                // New lead from HubSpot
                $created++;
                $leads[] = [
                    'ckey' => 'hs-' . substr(md5($email . time()), 0, 12),
                    'name' => $name ?: 'Contact',
                    'email' => $email,
                    'phone' => $props['phone'] ?? '',
                    'occupation' => $props['jobtitle'] ?? '',
                    'company' => $props['company'] ?? '',
                    'stage' => $props['hs_lead_status'] ?? 'New Lead',
                    'source' => 'HubSpot',
                    'hsContactId' => $hsId,
                    'createdAt' => $props['createdate'] ?? date('c'),
                    'lastSyncedFromHS' => date('c'),
                ];
            }
        }

        $after = $r['data']['paging']['next']['after'] ?? '';
    } while ($after);

    $imported = $created + $merged;
    if ($imported > 0) {
        save_ndjson($dir . '/leads.ndjson', $leads);
    }
}

/* ---- SYNC EMAILS FROM HUBSPOT ---- */
if ($action === 'sync-emails' || $action === 'sync-all') {
    $leads = load_ndjson($dir . '/leads.ndjson');
    $leadsByHsId = [];
    foreach ($leads as $l) {
        if ($hsId = $l['hsContactId'] ?? '') {
            $leadsByHsId[$hsId] = $l;
        }
    }

    $emails = load_ndjson($dir . '/email-threads.ndjson');

    // Fetch all HubSpot email engagements
    $after = '';
    do {
        $endpoint = '/crm/v3/objects/emails?limit=100' . ($after ? "&after=$after" : '') .
            '&properties=hs_email_subject,hs_email_open,hs_email_click,hs_timestamp,hubspotutk';
        $r = hs_api($endpoint, $HUBSPOT_API_KEY);
        if ($r['code'] !== 200 || !is_array($r['data'])) {
            $errors[] = 'Email sync failed: ' . ($r['code'] ?? 'unknown');
            break;
        }

        foreach (($r['data']['results'] ?? []) as $emailObj) {
            $props = $emailObj['properties'] ?? '';
            $hsId = $emailObj['id'] ?? '';

            // Try to associate with contact via associations
            $assoc = $emailObj['associations'] ?? [];
            $contactIds = $assoc['contacts']['results'] ?? [];
            if (empty($contactIds)) continue;

            foreach ($contactIds as $contactAssoc) {
                $contactId = $contactAssoc['id'] ?? '';
                if (!isset($leadsByHsId[$contactId])) continue;

                $lead = $leadsByHsId[$contactId];
                $emails[] = [
                    'id' => 'hs-' . $hsId,
                    'ckey' => $lead['ckey'],
                    'leadName' => $lead['name'],
                    'leadEmail' => $lead['email'],
                    'subject' => $props['hs_email_subject'] ?? '(No subject)',
                    'to' => $lead['email'],
                    'from' => 'unknown@hubspot',
                    'status' => $props['hs_email_open'] ? 'opened' : 'sent',
                    'opened' => !empty($props['hs_email_open']),
                    'clicked' => !empty($props['hs_email_click']),
                    'at' => $props['hs_timestamp'] ?? date('c'),
                    'source' => 'HubSpot',
                ];
                $emailsImported++;
            }
        }

        $after = $r['data']['paging']['next']['after'] ?? '';
    } while ($after);

    if ($emailsImported > 0) {
        save_ndjson($dir . '/email-threads.ndjson', $emails);
    }
}

echo json_encode([
    'ok' => true,
    'imported' => $imported,
    'merged' => $merged,
    'created' => $created,
    'emailsImported' => $emailsImported,
    'errors' => $errors,
]);
