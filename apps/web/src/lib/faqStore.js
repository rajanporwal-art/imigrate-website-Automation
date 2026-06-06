import { useEffect, useState } from 'react';
import { faqCategories as DEFAULT_FAQS } from '@/data/faqs';

/**
 * Loads FAQ categories from /faqs.json at runtime (editable via /admin.html),
 * falling back to the built-in defaults if the file is missing or invalid.
 * A module-level cache means the file is only fetched once per page load.
 */
let cache = null;
let inflight = null;

export function useFaqs() {
  const [data, setData] = useState(cache || DEFAULT_FAQS);

  useEffect(() => {
    if (cache) {
      setData(cache);
      return;
    }
    if (!inflight) {
      inflight = fetch('/faqs.json?_=' + Date.now(), { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          cache = j && Array.isArray(j.categories) && j.categories.length ? j.categories : DEFAULT_FAQS;
          return cache;
        })
        .catch(() => {
          cache = DEFAULT_FAQS;
          return cache;
        });
    }
    let active = true;
    inflight.then((d) => active && setData(d));
    return () => {
      active = false;
    };
  }, []);

  return data;
}

export default useFaqs;
