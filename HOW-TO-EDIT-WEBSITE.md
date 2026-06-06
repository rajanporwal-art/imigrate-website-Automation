# How to edit your iMigrate website

You now have **two ways** to edit the common content (text, contact details, stats,
highlights, photos). Both update the same `content.json` file — use whichever you prefer.

---

## ✅ Option A — Visual Editor (easiest, recommended)

A password-protected editor page is built into your site.

1. Go to **`https://YOURDOMAIN.com/admin.html`**
2. Enter the editor **password** (see "Set your password" below)
3. Edit the fields in the form — contact info, social links, homepage hero, the 3
   stats, the benefit cards, footer tagline
4. Click **💾 Save changes**
5. Open your website and hard-refresh (**Ctrl/Cmd + Shift + R**) — done!

It saves instantly to the server. The previous version is auto-backed up as
`content.backup.json`, so you can always recover it.

### Set your password (do this once)
1. Hostinger → **File Manager** → `public_html/` → open **`save-content.php`** → **Edit**
2. Find this line near the top:
   ```php
   $EDIT_PASSWORD = 'imigrate-admin-2026';
   ```
3. Change `imigrate-admin-2026` to your own password → **Save**.
4. Use that password on the `/admin.html` page.

### If saving shows a permissions error
In File Manager, right-click **`content.json` → Permissions → set to `644`** (or `664`),
then try saving again. (This lets the editor write to the file.)

> The editor needs PHP, which standard Hostinger hosting has enabled by default.

---

## Option B — Edit content.json directly

1. Hostinger → **File Manager** → `public_html/` → **`content.json`** → **Edit**
2. Change the text inside the quotes → **Save** → refresh your site.

Keep all `"quotes"`, `:` colons and `,` commas exactly in place. If the file ever
breaks, the site automatically falls back to its built-in defaults, so it never goes down.

---

## What you can change (both options)

The Easy editor is grouped into sections. There's also an **"Advanced (all content)"**
tab that shows the entire content file as JSON if you ever need a field not in the form.

| Section | Controls | Shows on |
|---|---|---|
| Contact details | Phone, email, WhatsApp, address | Header bar, Footer, all WhatsApp buttons |
| Social links | LinkedIn / Facebook / Instagram | Header + Footer icons |
| Homepage – hero | Big headline + intro text | Homepage top |
| Homepage – section headings | "Why choose us", "Our services", "Success stories", highlights heading, bottom call-to-action | Homepage |
| Australia page | Hero headline + sub-text, intro heading + paragraph | /australia-migration |
| Canada page | Hero headline + sub-text, intro heading + paragraph | /canada-immigration |
| About page | Hero headline + sub-text, "why clients trust us" paragraph | /about |
| Assessment page | Hero headline + sub-text | /assessment |
| Contact page | Hero headline + sub-text | /contact |
| Stats (×3) | The headline numbers | Home, About, Success Stories |
| Highlights (×4) | Benefit cards (Money-Back, Pay As You Go…) | Homepage |
| Footer tagline | Short company description | Footer |

---

## Changing a photo

Upload your new image to **`public_html/images/`** using the **same filename** as the
one you're replacing, then hard-refresh.

| Filename | Where it shows |
|---|---|
| `imigrate-logo.jpg` | Logo (header, footer, browser tab) |
| `au-melbourne-cityscape.avif` | Australia hero background |
| `au-handshake-flag.jpg` / `au-consultation-map.jpg` | Australia gallery + About page |
| `au-koala-lifestyle.jpg` | Australia gallery |
| `ca-toronto-hero.jpg` | Canada hero background |
| `ca-toronto-cntower.jpg` / `ca-banff-lake.jpg` / `ca-vancouver.jpg` | Canada gallery |

Keep new images a similar shape and under ~400 KB so the site stays fast.

---

## What this does NOT cover
The detailed visa/FAQ page content, blog, and the design itself live in the site code.
For those, send me the changes and I'll update the build.

## Security tips
- Use a strong editor password and don't share it publicly.
- The `/admin.html` page is marked "no-index" so search engines ignore it.
- To temporarily disable editing, rename or delete `save-content.php`.
