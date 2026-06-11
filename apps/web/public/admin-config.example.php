<?php
/**
 * TEMPLATE — copy this file to `admin-config.php` on the server and set a
 * strong, unique password. `admin-config.php` is gitignored so the real
 * password is never committed to GitHub and is never overwritten by deploys.
 *
 * This single value is the password for the in-app admin gate (the editor,
 * leads reader and content saver). The server-level HTTP Basic Auth login is
 * separate and lives in .htpasswd.
 */
$EDIT_PASSWORD = 'CHANGE-ME-to-a-strong-unique-password';

/**
 * CRON / CI key — enables the automatic pre/post-deploy backups + audit logging
 * (and any URL-triggered cron snapshots). Must EXACTLY match the GitHub Actions
 * repository secret named CRM_BACKUP_KEY. Leave unset to disable.
 */
$CRON_SECRET = 'CHANGE-ME-to-match-the-CRM_BACKUP_KEY-GitHub-secret';
