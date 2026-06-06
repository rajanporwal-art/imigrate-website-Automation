# iMigrate Solutions — Build & Hostinger Deployment Guide

This is a **Vite + React (React Router)** single-page app with a managed **PocketBase**
backend (reached through Hostinger's `/hcgi/platform` proxy). The frontend lives in
`apps/web` and builds to `dist/apps/web`.

---

## 1. Prerequisites

- **Node.js 22** (see `.nvmrc`)
- npm (ships with Node)

```bash
nvm install 22 && nvm use 22   # if you use nvm
node -v                        # should print v22.x
```

## 2. Install dependencies

From the repository root:

```bash
npm install
```

This installs the workspace packages (`apps/web`, `apps/pocketbase`).

## 3. Run locally (optional)

```bash
npm run dev
```

- Web app: http://localhost:3000
- PocketBase admin (local): started by the same command

## 4. Production build

```bash
npm run build
```

The static site is emitted to **`dist/apps/web/`**. It already contains the
`.htaccess` file (copied from `apps/web/public/.htaccess`) that rewrites all routes
to `index.html` — this is required for React Router deep links such as
`/australia-migration` and `/assessment`.

---

## 5. Deploy to Hostinger

### Option A — Hostinger Horizons (recommended, keeps the backend working)

This project was generated as a Hostinger Horizons app. The forms (Contact,
Australia Migration enquiry, Appointments) post to the managed PocketBase backend
via the relative path `/hcgi/platform` (see `apps/web/src/lib/pocketbaseClient.js`).
That proxy only exists on Hostinger Horizons hosting.

1. Push / sync this project to your Hostinger Horizons project.
2. Trigger a deploy from the Horizons dashboard. Horizons runs the build and serves
   both the static frontend and the PocketBase backend.
3. Verify the live site — submit a test enquiry to confirm the backend is reachable.

### Option B — Manual upload to Hostinger shared hosting (hPanel → File Manager)

Use this if you only need the **static frontend**. Note that the form submissions
that use PocketBase will only work if the `/hcgi/platform` backend is also available
(Horizons) or you repoint the client (see §6).

1. Run `npm run build` locally.
2. Open **hPanel → Files → File Manager** and go to `public_html/`
   (or the subdomain's document root).
3. Delete the placeholder `index.html` if present.
4. Upload **everything inside `dist/apps/web/`** (the `index.html`, the `assets/`
   folder, the `.htaccess`, favicon, etc.) into `public_html/`.
   - Easiest: zip the **contents** of `dist/apps/web`, upload the zip, then
     "Extract" inside `public_html/`.
5. Confirm `public_html/.htaccess` exists (enable "show hidden files" in File
   Manager). Without it, refreshing any route other than `/` returns 404.
6. Visit your domain and test navigation + the points calculator.

### Option C — Hostinger VPS (full control, self-hosted PocketBase)

1. Deploy the static `dist/apps/web` behind Nginx/Apache (with SPA fallback to
   `index.html`).
2. Run PocketBase from `apps/pocketbase` as a service and proxy it at
   `/hcgi/platform` (or change the client URL — see §6).

---

## 6. Pointing the frontend at a different backend (only if NOT using Horizons)

If you host PocketBase yourself, edit
`apps/web/src/lib/pocketbaseClient.js`:

```js
const POCKETBASE_API_URL = 'https://your-pocketbase-domain.com';
```

Then rebuild (`npm run build`) and redeploy. Make sure CORS on PocketBase allows
your site's origin.

> The **Free Assessment** form and the **Points Calculator** work fully client-side
> (no backend needed). The Contact form and the Australia Migration enquiry form use
> PocketBase.

---

## 7. Post-deploy checklist

- [ ] Home, About, Services, **Australia PR** (`/australia-migration`), Assessment,
      Blog, FAQ, Success Stories, Contact all load and survive a hard refresh.
- [ ] Navy / white / gold palette is applied; **only CTA buttons are red**.
- [ ] Sticky consultation + WhatsApp buttons appear after scrolling.
- [ ] Australia page: every visa section shows Overview, Eligibility, Benefits,
      Key Requirements, Processing, FAQ accordion and a CTA banner.
- [ ] Points Calculator (Australia & Canada tabs) updates the score live on
      `/assessment#calculator`.
- [ ] FAQ rich-result structured data present (view source → `application/ld+json`).
- [ ] Forms submit successfully (Horizons/your backend reachable).
