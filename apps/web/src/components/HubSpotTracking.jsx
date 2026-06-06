import { useEffect } from 'react';

/**
 * Injects the HubSpot tracking script site-wide when a Portal ID is configured
 * in /hubspot.json. The tracking script sets the `hubspotutk` cookie that links
 * form submissions to a visitor's source/campaign for attribution in HubSpot.
 * Renders nothing.
 */
function HubSpotTracking() {
  useEffect(() => {
    let cancelled = false;
    fetch('/hubspot.json?_=' + Date.now(), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => {
        if (cancelled || !cfg || !cfg.enabled || !cfg.portalId) return;
        if (document.getElementById('hs-script-loader')) return;
        const s = document.createElement('script');
        s.id = 'hs-script-loader';
        s.async = true;
        s.defer = true;
        s.src = `https://js.hs-scripts.com/${cfg.portalId}.js`;
        document.head.appendChild(s);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

export default HubSpotTracking;
