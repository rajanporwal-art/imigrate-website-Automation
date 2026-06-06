/**
 * Client-side lead submission.
 *
 * Sends every form to /lead-capture.php (same-origin PHP) which durably stores
 * the lead and forwards it to HubSpot. Captures source attribution (HubSpot
 * cookie, page, referrer, UTM params). If the network request fails, the lead
 * is queued in localStorage and retried automatically on the next page load,
 * so no lead is lost.
 */

const QUEUE_KEY = 'leadQueue';
const UTM_KEY = 'firstTouchUtm';

function getCookie(name) {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[2]) : '';
}

// Capture & persist first-touch UTM / source data.
function captureUtm() {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    const found = {};
    keys.forEach((k) => { const v = params.get(k); if (v) found[k] = v; });
    const stored = JSON.parse(localStorage.getItem(UTM_KEY) || '{}');
    if (Object.keys(found).length && !stored.utm_source && !stored.gclid) {
      const firstTouch = { ...found, landingPage: window.location.pathname, referrer: document.referrer || '' };
      localStorage.setItem(UTM_KEY, JSON.stringify(firstTouch));
      return firstTouch;
    }
    return stored;
  } catch (e) {
    return {};
  }
}

function buildContext() {
  if (typeof window === 'undefined') return {};
  return {
    hutk: getCookie('hubspotutk'),
    pageUri: window.location.href,
    pageName: document.title,
    referrer: document.referrer || '',
    utm: captureUtm(),
  };
}

async function postLead(body) {
  const res = await fetch('/lead-capture.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Lead endpoint returned ' + res.status);
  return res.json();
}

/** Try to flush any leads queued from earlier failed attempts. */
export async function flushLeadQueue() {
  if (typeof localStorage === 'undefined') return;
  let queue;
  try {
    queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch (e) {
    queue = [];
  }
  if (!queue.length) return;
  const remaining = [];
  for (const item of queue) {
    try {
      await postLead(item);
    } catch (e) {
      remaining.push(item);
    }
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
}

/**
 * Submit a lead. Returns true if sent, false if it was queued for retry.
 * @param {{ formName: string, fields: object, website?: string }} args
 */
export async function submitLead({ formName, fields, website = '' }) {
  const body = { formName, fields, website, context: buildContext() };
  try {
    await postLead(body);
    return true;
  } catch (e) {
    try {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      queue.push(body);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
      /* ignore */
    }
    return false;
  }
}

// Attempt to flush queued leads when the module loads in the browser.
if (typeof window !== 'undefined') {
  setTimeout(() => { flushLeadQueue(); }, 3000);
}

export default submitLead;
