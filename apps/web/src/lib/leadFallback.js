/**
 * Static-hosting fallback for lead/contact forms.
 *
 * The forms normally POST to the managed PocketBase backend at `/hcgi/platform`.
 * On plain static hosting (e.g. a manual Hostinger upload) that endpoint does not
 * exist, so the request fails. When that happens we fall back to the visitor's own
 * email client (mailto:) with all the form details pre-filled, so no lead is lost.
 */

export const CONTACT_EMAIL = 'contact@imigratesolution.com';
export const WHATSAPP_NUMBER = '601127679613';

/** Human-friendly labels for known form field keys. */
const FIELD_LABELS = {
  fullName: 'Full name',
  email: 'Email',
  phone: 'Phone',
  subject: 'Subject',
  message: 'Message',
  preferredDate: 'Preferred date',
  preferredTime: 'Preferred time',
  consultationType: 'Consultation type',
  notes: 'Notes',
};

function buildBody(fields) {
  return Object.entries(fields)
    .filter(([key, value]) => value && key !== 'confirmed')
    .map(([key, value]) => `${FIELD_LABELS[key] || key}: ${value}`)
    .join('\n');
}

/**
 * Opens the visitor's email client with the enquiry pre-filled.
 * Returns the mailto URL that was opened.
 */
export function openEmailFallback({ subject, fields }) {
  const body = buildBody(fields);
  const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
  return url;
}

/** Builds a WhatsApp deep link with the enquiry pre-filled. */
export function buildWhatsAppLink({ subject, fields }) {
  const text = `${subject}\n\n${buildBody(fields)}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
