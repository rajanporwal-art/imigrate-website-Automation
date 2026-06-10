import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cmsFetchJson } from '@/lib/cmsFetch';

/**
 * Applies per-page SEO overrides managed in the CMS (cms-overrides/seo.json),
 * keyed by route path. Renders nothing; on each route change it patches the
 * document head (title, meta description/keywords, Open Graph, canonical and
 * JSON-LD schema) AFTER the page's own Helmet has run, so CMS values win.
 *
 * seo.json shape: { "pages": { "/about": { metaTitle, metaDescription,
 *   keywords, ogTitle, ogDescription, canonical, schema } , ... } }
 */
let seoCache = null;

function upsertMeta(attr, key, content) {
  if (content == null || content === '') return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function applySeo(s) {
  if (!s) return;
  if (s.metaTitle) document.title = s.metaTitle;
  upsertMeta('name', 'description', s.metaDescription);
  upsertMeta('name', 'keywords', s.keywords);
  upsertMeta('property', 'og:title', s.ogTitle || s.metaTitle);
  upsertMeta('property', 'og:description', s.ogDescription || s.metaDescription);
  if (s.canonical) {
    let l = document.head.querySelector('link[rel="canonical"]');
    if (!l) { l = document.createElement('link'); l.setAttribute('rel', 'canonical'); document.head.appendChild(l); }
    l.setAttribute('href', s.canonical);
  }
  if (s.schema) {
    let sc = document.getElementById('cms-seo-schema');
    if (!sc) { sc = document.createElement('script'); sc.type = 'application/ld+json'; sc.id = 'cms-seo-schema'; document.head.appendChild(sc); }
    sc.textContent = typeof s.schema === 'string' ? s.schema : JSON.stringify(s.schema);
  }
}

export default function SeoOverride() {
  const { pathname } = useLocation();
  useEffect(() => {
    let active = true;
    (async () => {
      if (!seoCache) seoCache = (await cmsFetchJson('seo.json')) || {};
      if (!active) return;
      const map = (seoCache && seoCache.pages) || seoCache || {};
      const s = map[pathname];
      if (!s) return;
      applySeo(s);
      // Re-apply shortly after, in case the page's Helmet commits late.
      setTimeout(() => active && applySeo(s), 80);
    })();
    return () => { active = false; };
  }, [pathname]);
  return null;
}
