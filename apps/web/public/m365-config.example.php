<?php
/**
 * Microsoft 365 integration config — TEMPLATE.
 *
 * To enable the Outlook / OneDrive / Calendar integration:
 *   1. Register an app at https://entra.microsoft.com (Azure AD) →
 *      App registrations → New registration.
 *        - Supported account types: "Accounts in any org directory and personal
 *          Microsoft accounts" (or single-tenant if you prefer).
 *        - Redirect URI (Web): https://www.imigratesolution.com/m365.php?action=callback
 *   2. API permissions → Microsoft Graph → Delegated:
 *        Mail.Send, Mail.Read, Calendars.ReadWrite, Files.ReadWrite, User.Read, offline_access
 *      → Grant admin consent.
 *   3. Certificates & secrets → New client secret → copy the VALUE.
 *   4. Copy this file to "m365-config.php" and fill in the values below.
 *      (m365-config.php is git-ignored and preserved across deploys.)
 */

$M365 = [
    'client_id'     => 'YOUR_AZURE_APP_CLIENT_ID',
    'client_secret' => 'YOUR_AZURE_APP_CLIENT_SECRET',
    'tenant'        => 'common', // 'common', 'organizations', or your tenant GUID
    'redirect_uri'  => 'https://www.imigratesolution.com/m365.php?action=callback',
    'scopes'        => 'offline_access User.Read Mail.Send Mail.Read Calendars.ReadWrite Files.ReadWrite',
];
