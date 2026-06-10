import { useEffect, useState } from 'react';
import { australiaVisas as AU_DEFAULT } from '@/data/australiaVisas';
import { canadaVisas as CA_DEFAULT } from '@/data/canadaVisas';
import { Briefcase, Building2, Compass, Globe, GraduationCap, Heart, MapPin, Rocket, TrendingUp } from 'lucide-react';
import { cmsFetchJson } from '@/lib/cmsFetch';

/**
 * Visa programs for the Australia/Canada Visas + Migration pages.
 * Editable in the CMS (Visa Programs). The site reads cms-overrides/visas.json
 * (durable CMS edits) or the repo seed visas.json, falling back to the compiled
 * data modules. Icons are referenced by name in the editable store and mapped
 * back to components here. This data is DISPLAY-ONLY — the AI assessment engine
 * uses a separate dataset and is unaffected.
 */
const ICONS = { Briefcase, Building2, Compass, Globe, GraduationCap, Heart, MapPin, Rocket, TrendingUp };
let cache = null;
let inflight = null;

function mapIcons(arr) {
  return (arr || []).map((v) => ({ ...v, icon: typeof v.icon === 'string' ? (ICONS[v.icon] || Globe) : (v.icon || Globe) }));
}

export function useVisas(country) {
  const DEFAULT = country === 'canada' ? CA_DEFAULT : AU_DEFAULT;
  const [data, setData] = useState(DEFAULT);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (cache === null) {
          if (!inflight) inflight = cmsFetchJson('visas.json');
          cache = (await inflight) || {};
        }
        const arr = cache && Array.isArray(cache[country]) && cache[country].length ? mapIcons(cache[country]) : DEFAULT;
        if (active) setData(arr);
      } catch (e) {
        if (active) setData(DEFAULT);
      }
    })();
    return () => { active = false; };
  }, [country]);
  return data;
}

export default useVisas;
