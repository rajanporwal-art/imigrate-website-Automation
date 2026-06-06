# HubSpot CRM Integration — Setup Guide

Your website now captures **every form submission** and sends it to HubSpot, while
also storing a durable copy on your own server (so **no lead is ever lost**, even if
HubSpot is temporarily unavailable).

## How it works

```
Website form ──▶ /lead-capture.php ──▶ saved on your server (always)
                          └────────▶ HubSpot (create/update contact)
```

- The **HubSpot tracking script** loads site-wide and sets the visitor cookie used
  for source/campaign attribution.
- Each lead is sent to HubSpot via the **Forms API** with the visitor's cookie, page
  URL and UTM data, so HubSpot records the **lead source and landing page**.
- If HubSpot is down, the lead is saved with `pending` status and you can **retry**
  it from the admin dashboard. Browser-side failures are also queued and retried
  automatically.

Forms connected: Free Assessment, Contact, Australia enquiry, Canada enquiry,
Book Free Consultation, homepage pop-up, and newsletter.

---

## One-time setup (about 5 minutes)

### Step 1 — Create a form in HubSpot
1. In HubSpot go to **Marketing → Forms → Create form** (a regular/embedded form).
2. Add these fields (use HubSpot's default contact properties):
   - **Email** (required)
   - **First name**
   - **Last name**
   - **Phone number**
   - **Message** (single-line or multi-line text)
3. Publish the form.

### Step 2 — Get your Portal ID and Form GUID
- **Portal ID** (Hub ID): top-right account menu in HubSpot, or **Settings → Account Setup → Account Defaults**. It's a number like `12345678`.
- **Form GUID**: open your form → **Share / Embed** → in the embed code you'll see
  `formId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"`. That value is the Form GUID.

> Portal ID and Form GUID are **not secrets** — they appear in every public HubSpot
> embed form, so it's safe to store them on the site.

### Step 3 — Enter them in your admin dashboard
1. Go to **https://www.imigratesolution.com/admin.html** → **HubSpot & Leads** tab.
2. Tick **Enable HubSpot integration**.
3. Paste your **Portal ID** and **Form GUID**.
4. (Optional) Add a **notification email** to get an email for every new lead.
5. Click **💾 Save changes**.

That's it — submit a test form on your site, then check **HubSpot → Contacts** and the
**Leads** table in the admin dashboard.

---

## The Leads dashboard (admin → HubSpot & Leads)

- **Load leads** — view every captured submission (date, form, name, email, phone, HubSpot status)
- **Export CSV** — download all leads for Excel/Sheets
- **Retry unsynced to HubSpot** — re-sends any leads marked `pending` (e.g. captured before HubSpot was configured, or during an outage)

---

## Important notes

- **PHP & cURL** must be enabled on your hosting (they are by default on Hostinger).
- Leads are stored in a **web-protected** folder (`/leads/`) that cannot be opened in a
  browser. Only the password-protected admin can read them.
- If a **Save** or **Load leads** fails with a write/permission error, set the relevant
  file/folder permissions to **644 / 755** in Hostinger File Manager.
- The admin password is set once in **`admin-config.php`** (`$EDIT_PASSWORD`).
- To capture extra fields (occupation, nationality, age, qualification, etc.) as their
  own HubSpot **contact properties** instead of inside the Message field, create those
  properties in HubSpot and tell me — I'll map them explicitly.

## Mapping fields to dedicated HubSpot properties
By default, extra fields are saved in the HubSpot **Message** property. To send them
to their own properties instead:
1. In HubSpot, add the property as a **field on your form** (e.g. Job title, Country,
   or custom properties like "age", "qualification").
2. In **admin → HubSpot & Leads → Field mapping**, add a row mapping the website field
   name (left, e.g. `occupation`) to the HubSpot property (right, e.g. `jobtitle`).
3. Save. New leads now populate that property directly.

Recommended HubSpot form fields for the default mapping: **Email, First name, Last
name, Phone, Job title, Country, Message**. (Occupation → jobtitle, Nationality →
country are mapped out of the box.) Keep "Also include all fields in Message" ticked so
nothing is ever lost, even before you create custom properties.

## Building new forms (no code) — admin → Forms tab
1. Open **admin → Forms → Add form**.
2. Set a title, URL slug, intro, submit-button text and success message.
3. Add fields (text, email, phone, number, textarea or dropdown), mark which are required.
4. **Save**. Your form is live at **`/form/<slug>`** (e.g. `/form/quick-enquiry`).
5. Link to it from a menu, button or blog post.

Every custom form automatically captures leads to the dashboard and syncs to HubSpot —
no extra setup. Use each field's **name** in the Field mapping above to route it to a
HubSpot property. (Any form built in code can also call `submitLead({ formName, fields })`.)
