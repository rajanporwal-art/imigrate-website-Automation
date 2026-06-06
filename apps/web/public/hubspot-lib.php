<?php
/**
 * Shared HubSpot helpers used by lead-capture.php and leads-read.php.
 * Builds the Forms API payload using a configurable field map and submits it.
 */

/**
 * Map our form fields to HubSpot contact properties using $cfg['fieldMap'].
 * Full name is split into firstname/lastname automatically. Any field not in
 * the map is still preserved in the standard "message" property (if enabled),
 * so no information is lost even before custom properties are configured.
 */
function hs_build_body($fields, $formName, $context, $cfg) {
    $map = (isset($cfg['fieldMap']) && is_array($cfg['fieldMap']))
        ? $cfg['fieldMap']
        : ['email' => 'email', 'phone' => 'phone', 'occupation' => 'jobtitle', 'nationality' => 'country'];

    $hs = [];

    // Full name -> firstname / lastname
    $name = $fields['fullName'] ?? ($fields['name'] ?? '');
    if ($name !== '') {
        $first = $name; $last = '';
        if (strpos($name, ' ') !== false) { $p = explode(' ', $name, 2); $first = $p[0]; $last = $p[1]; }
        $hs[] = ['name' => 'firstname', 'value' => $first];
        if ($last !== '') $hs[] = ['name' => 'lastname', 'value' => $last];
    }

    // Mapped fields -> dedicated HubSpot properties
    foreach ($map as $our => $hsName) {
        if ($our === 'fullName' || $our === 'name') continue;
        if (isset($fields[$our]) && $fields[$our] !== '' && !is_array($fields[$our])) {
            $hs[] = ['name' => $hsName, 'value' => (string) $fields[$our]];
        }
    }

    // Everything else -> "message" summary (backup, keeps all data)
    $includeMsg = !isset($cfg['includeMessageSummary']) || $cfg['includeMessageSummary'];
    if ($includeMsg) {
        $skip = ['fullName', 'name', 'website'];
        foreach ($map as $our => $hsName) { $skip[] = $our; }
        $lines = ["Source form: $formName"];
        if (!empty($context['pageUri'])) $lines[] = 'Page: ' . $context['pageUri'];
        foreach ($fields as $k => $v) {
            if (is_array($v) || $v === '' || in_array($k, $skip, true)) continue;
            $lines[] = ucfirst($k) . ': ' . $v;
        }
        $hs[] = ['name' => 'message', 'value' => implode("\n", $lines)];
    }

    return [
        'fields' => $hs,
        'context' => array_filter([
            'hutk' => $context['hutk'] ?? null,
            'pageUri' => $context['pageUri'] ?? null,
            'pageName' => $context['pageName'] ?? null,
        ]),
    ];
}

/** Submit a built body to HubSpot. Returns HTTP status code, or null if disabled. */
function hs_submit($cfg, $body) {
    if (empty($cfg['enabled']) || empty($cfg['portalId']) || empty($cfg['formGuid']) || !function_exists('curl_init')) {
        return null;
    }
    $url = 'https://api.hsforms.com/submit/v3/integration/submit/' . rawurlencode($cfg['portalId']) . '/' . rawurlencode($cfg['formGuid']);
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($body),
        CURLOPT_TIMEOUT => 12,
    ]);
    curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $code;
}
