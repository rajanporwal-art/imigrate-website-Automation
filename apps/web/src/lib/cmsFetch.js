/**
 * Fetch a CMS-managed JSON file, preferring the durable server-side override
 * (cms-overrides/<file>, written by the CMS and never overwritten by deploys)
 * and falling back to the repo-shipped base file.
 *
 * @param {string} file e.g. "blog.json", "faqs.json", "forms.json"
 * @returns {Promise<any|null>}
 */
export async function cmsFetchJson(file) {
  for (const url of ['/cms-overrides/' + file, '/' + file]) {
    try {
      const res = await fetch(url + '?_=' + Date.now(), { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch (e) {
      /* try next source */
    }
  }
  return null;
}

export default cmsFetchJson;
