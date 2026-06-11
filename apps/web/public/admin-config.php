<?php
/**
 * Admin settings LOADER.
 *
 * IMPORTANT: do not put real secrets in THIS file. It is committed to the repo
 * and re-deployed on every release, so any edit here is overwritten.
 *
 * Real, durable secrets live in  auth/secrets.php  — the auth/ directory is
 * EXCLUDED from deploys and persists across every release (unlike root-level
 * files, which the FTP mirror does not reliably preserve). Create that file on
 * the server once:
 *
 *   <?php
 *   $EDIT_PASSWORD = 'your-strong-admin-password';
 *   $CRON_SECRET   = 'your-CRM_BACKUP_KEY-value';   // must match the GitHub secret
 *
 * Anything set there overrides the safe defaults below.
 */

// Load durable, deploy-proof secrets if present.
@include __DIR__ . '/auth/secrets.php';

// Safe fallback so the app still runs if auth/secrets.php hasn't been created yet.
if (!isset($EDIT_PASSWORD)) { $EDIT_PASSWORD = 'imigrate-admin-2026'; }
if (!isset($CRON_SECRET))   { $CRON_SECRET = ''; }
