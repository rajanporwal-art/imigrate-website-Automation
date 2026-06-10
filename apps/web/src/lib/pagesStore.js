import { cmsFetchJson } from '@/lib/cmsFetch';

/**
 * Loads CMS-built pages (cms-overrides/pages.json) once per page load and
 * exposes simple lookups for routing and unpublish enforcement.
 */
let cache = null;
let inflight = null;

export function loadCmsPages() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = cmsFetchJson('pages.json')
      .then((d) => { cache = (d && Array.isArray(d.pages) ? d.pages : []); return cache; })
      .catch(() => { cache = []; return cache; });
  }
  return inflight;
}

export async function findPublishedPage(pathname) {
  const pages = await loadCmsPages();
  return pages.find((p) => p.path === pathname && p.status === 'published' && Array.isArray(p.blocks)) || null;
}

export async function isUnpublished(pathname) {
  const pages = await loadCmsPages();
  const entry = pages.find((p) => p.path === pathname);
  return !!(entry && entry.status === 'unpublished');
}
