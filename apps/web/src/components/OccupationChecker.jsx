import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, MapPin, Briefcase, Calculator, ClipboardCheck, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLeadForm } from '@/components/LeadFormModal.jsx';
import {
  SKILLED_OCCUPATIONS,
  VISA_LABELS,
  visasForOccupation,
} from '@/data/skilledOccupations';

const POPULAR = [
  'Software Engineer',
  'Registered Nurses nec',
  'Civil Engineer',
  'Accountant (General)',
  'Electrician (General)',
  'Chef',
];

const LIST_NAME = {
  MLTSSL: 'Medium and Long-term Strategic Skills List (MLTSSL)',
  STSOL: 'Short-term Skilled Occupation List (STSOL)',
  ROL: 'Regional Occupation List (ROL)',
};

function OccupationChecker() {
  const { openLeadForm } = useLeadForm();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const matches = SKILLED_OCCUPATIONS.filter(
      (o) => o.name.toLowerCase().includes(q) || o.code.includes(q)
    );
    matches.sort((a, b) => {
      const aStart = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStart = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return aStart - bStart || a.name.localeCompare(b.name);
    });
    return matches.slice(0, 8);
  }, [query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function choose(occ) {
    if (!occ) return;
    setSelected(occ);
    setQuery(occ.name);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open || !results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(results[active] || results[0]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function reset() {
    setSelected(null);
    setQuery('');
    setOpen(false);
  }

  const visas = selected ? visasForOccupation(selected) : [];

  return (
    <section id="occupation-checker" className="section-spacing bg-muted scroll-mt-24">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="gold-rule mx-auto mb-5" />
          <h2 className="heading-section text-balance mb-4 text-primary">
            Australia Skilled Occupation Eligibility Checker
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Search the Australian skilled occupation list to see if your job is eligible for
            skilled migration — and which visa pathways (Subclass 189, 190 and 491) may apply.
            Start typing your occupation or ANZSCO code below.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Search box */}
          <div ref={boxRef} className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                if (selected) setSelected(null);
              }}
              onFocus={() => query && setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="e.g. Software Engineer, Registered Nurse, 233211…"
              aria-label="Search for your occupation"
              autoComplete="off"
              className="h-14 pl-12 pr-12 text-base rounded-full shadow-sm bg-background"
            />
            {query && (
              <button
                type="button"
                onClick={reset}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Suggestions */}
            {open && results.length > 0 && (
              <ul
                role="listbox"
                className="absolute z-20 mt-2 w-full max-h-72 overflow-auto rounded-2xl border border-border bg-background shadow-xl py-2 text-left"
              >
                {results.map((o, i) => (
                  <li key={o.code} role="option" aria-selected={i === active}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => choose(o)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                        i === active ? 'bg-muted' : 'hover:bg-muted'
                      }`}
                    >
                      <span className="font-medium text-foreground">{o.name}</span>
                      <span className="shrink-0 text-xs font-mono text-muted-foreground">{o.code}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {open && query.trim() && results.length === 0 && (
              <div className="absolute z-20 mt-2 w-full rounded-2xl border border-border bg-background shadow-xl p-4 text-left text-sm text-muted-foreground">
                No match in our quick list. Your occupation may still be eligible —{' '}
                <button
                  type="button"
                  className="font-medium text-cta hover:underline"
                  onClick={() => openLeadForm('Occupation checker — no match')}
                >
                  get a free eligibility check
                </button>
                .
              </div>
            )}
          </div>

          {/* Popular chips */}
          {!selected && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-muted-foreground mr-1">Popular:</span>
              {POPULAR.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    const occ = SKILLED_OCCUPATIONS.find((o) => o.name === name);
                    choose(occ);
                  }}
                  className="px-3 py-1 rounded-full bg-background border border-border text-sm font-medium hover:border-accent hover:text-primary transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Result card */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-6 rounded-2xl border border-border bg-background shadow-lg overflow-hidden"
            >
              <div className="bg-primary text-primary-foreground p-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <Briefcase className="h-4 w-4" /> Occupation
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mt-1">{selected.name}</h3>
                </div>
                {selected.code && (
                  <div className="text-right">
                    <div className="text-xs opacity-80">ANZSCO code</div>
                    <div className="text-lg font-mono font-semibold">{selected.code}</div>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-5">
                {/* Eligibility */}
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Eligible for Australian skilled migration
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Listed on the {LIST_NAME[selected.list] || selected.list}.
                    </p>
                  </div>
                </div>

                {/* Visa pathways */}
                <div>
                  <p className="font-semibold text-foreground mb-2">Applicable visa pathways</p>
                  <ul className="space-y-2">
                    {visas.map((code) => (
                      <li key={code} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                        <span>{VISA_LABELS[code]}</span>
                      </li>
                    ))}
                    <li className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-accent shrink-0" />
                      <span>Employer Sponsored pathways (Subclass 482 / 186) may also apply</span>
                    </li>
                  </ul>
                </div>

                {/* Points calculation link */}
                <Link
                  to="/assessment#calculator"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-cta hover:underline"
                >
                  <Calculator className="h-4 w-4" /> Calculate your points for skilled migration
                </Link>

                {/* Caveat */}
                {selected.caveat && (
                  <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{selected.caveat}</span>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Button
                    size="lg"
                    variant="cta"
                    className="text-base px-6"
                    onClick={() => openLeadForm(`Occupation checker — ${selected.name} (${selected.code})`)}
                  >
                    <ClipboardCheck className="mr-1 h-5 w-5" />
                    Check my full eligibility
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-6"
                    onClick={reset}
                  >
                    Search another occupation
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Disclaimer */}
          <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
            Results are indicative and based on the general skilled occupation lists (MLTSSL, STSOL
            and ROL). The lists, visa rules and points thresholds are reviewed periodically. Confirm
            your eligibility — including the required skills assessment and points score — with a{' '}
            <button
              type="button"
              className="font-medium text-cta hover:underline"
              onClick={() => openLeadForm('Occupation checker — disclaimer CTA')}
            >
              free assessment
            </button>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

export default OccupationChecker;
