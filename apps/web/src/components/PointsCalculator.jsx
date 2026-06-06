import React, { useMemo, useState } from 'react';
import { Calculator, Info, ArrowRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLeadForm } from '@/components/LeadFormModal.jsx';

/* ------------------------------------------------------------------ */
/* Field configuration                                                 */
/* ------------------------------------------------------------------ */

// Australia — General Skilled Migration points test (Subclass 189/190/491)
const AU_FIELDS = [
  {
    key: 'age',
    label: 'Age',
    options: [
      { label: '18–24 years', value: 25 },
      { label: '25–32 years', value: 30 },
      { label: '33–39 years', value: 25 },
      { label: '40–44 years', value: 15 },
      { label: '45+ years', value: 0 },
    ],
  },
  {
    key: 'english',
    label: 'English language ability',
    options: [
      { label: 'Competent (IELTS 6 / equivalent)', value: 0 },
      { label: 'Proficient (IELTS 7 / equivalent)', value: 10 },
      { label: 'Superior (IELTS 8 / equivalent)', value: 20 },
    ],
  },
  {
    key: 'expOverseas',
    label: 'Skilled employment — outside Australia',
    options: [
      { label: 'Less than 3 years', value: 0 },
      { label: '3–4 years', value: 5 },
      { label: '5–7 years', value: 10 },
      { label: '8–10 years', value: 15 },
    ],
  },
  {
    key: 'expAustralia',
    label: 'Skilled employment — in Australia',
    options: [
      { label: 'Less than 1 year / none', value: 0 },
      { label: '1–2 years', value: 5 },
      { label: '3–4 years', value: 10 },
      { label: '5–7 years', value: 15 },
      { label: '8–10 years', value: 20 },
    ],
  },
  {
    key: 'education',
    label: 'Educational qualification',
    options: [
      { label: 'Doctorate (PhD)', value: 20 },
      { label: "Bachelor's or Master's degree", value: 15 },
      { label: 'Diploma or trade qualification', value: 10 },
      { label: 'Recognised qualification / award', value: 10 },
      { label: 'None of the above', value: 0 },
    ],
  },
  {
    key: 'ausStudy',
    label: 'Australian study requirement',
    options: [
      { label: 'Not completed', value: 0 },
      { label: 'Completed (2 academic years)', value: 5 },
    ],
  },
  {
    key: 'specialist',
    label: 'Specialist education (STEM Masters/PhD)',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 10 },
    ],
  },
  {
    key: 'community',
    label: 'Accredited community language (NAATI)',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 5 },
    ],
  },
  {
    key: 'profYear',
    label: 'Professional year in Australia',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 5 },
    ],
  },
  {
    key: 'partner',
    label: 'Partner skills',
    options: [
      { label: 'Single / partner is Australian PR or citizen', value: 10 },
      { label: 'Partner — competent English only', value: 5 },
      { label: 'Partner — skilled (skills + English)', value: 10 },
      { label: 'Partner — no points claimed', value: 0 },
    ],
  },
  {
    key: 'nomination',
    label: 'State nomination / regional sponsorship',
    options: [
      { label: 'None (Subclass 189)', value: 0 },
      { label: 'State nomination (Subclass 190)', value: 5 },
      { label: 'Regional nomination/sponsorship (Subclass 491)', value: 15 },
    ],
  },
];

// Canada — simplified Comprehensive Ranking System (CRS) estimate, single applicant
const CA_FIELDS = [
  {
    key: 'age',
    label: 'Age',
    options: [
      { label: '18–19 years', value: 90 },
      { label: '20–29 years', value: 110 },
      { label: '30–34 years', value: 88 },
      { label: '35–39 years', value: 65 },
      { label: '40–44 years', value: 35 },
      { label: '45+ years', value: 0 },
    ],
  },
  {
    key: 'education',
    label: 'Education level',
    options: [
      { label: 'Doctoral (PhD)', value: 150 },
      { label: "Master's / professional degree", value: 135 },
      { label: "Bachelor's (3+ years)", value: 120 },
      { label: 'Two or more credentials', value: 128 },
      { label: 'One-year post-secondary', value: 90 },
      { label: 'Secondary / high school', value: 30 },
    ],
  },
  {
    key: 'language1',
    label: 'First official language (English/French)',
    options: [
      { label: 'CLB 10+ (very strong)', value: 136 },
      { label: 'CLB 9', value: 124 },
      { label: 'CLB 8', value: 92 },
      { label: 'CLB 7', value: 64 },
      { label: 'CLB 6', value: 32 },
      { label: 'Below CLB 6', value: 0 },
    ],
  },
  {
    key: 'foreignExp',
    label: 'Skilled work experience',
    options: [
      { label: 'None / less than 1 year', value: 0 },
      { label: '1–2 years', value: 40 },
      { label: '3–4 years', value: 64 },
      { label: '5+ years', value: 80 },
    ],
  },
  {
    key: 'canadianExp',
    label: 'Canadian work experience',
    options: [
      { label: 'None', value: 0 },
      { label: '1 year', value: 40 },
      { label: '2 years', value: 53 },
      { label: '3+ years', value: 72 },
    ],
  },
  {
    key: 'canadianEdu',
    label: 'Canadian education credential',
    options: [
      { label: 'No', value: 0 },
      { label: '1–2 year credential', value: 15 },
      { label: '3+ year / Masters / PhD', value: 30 },
    ],
  },
  {
    key: 'frenchBonus',
    label: 'Additional French proficiency',
    options: [
      { label: 'No', value: 0 },
      { label: 'NCLC 5–6', value: 25 },
      { label: 'NCLC 7+', value: 50 },
    ],
  },
  {
    key: 'sibling',
    label: 'Sibling in Canada (citizen/PR)',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 15 },
    ],
  },
  {
    key: 'jobOffer',
    label: 'Valid job offer (LMIA)',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes — NOC TEER 1–3', value: 50 },
      { label: 'Yes — senior management (TEER 00)', value: 200 },
    ],
  },
  {
    key: 'pnp',
    label: 'Provincial Nominee Program (PNP)',
    options: [
      { label: 'No nomination', value: 0 },
      { label: 'Provincial nomination held', value: 600 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function defaults(fields) {
  return fields.reduce((acc, f) => {
    acc[f.key] = f.options[0].value;
    return acc;
  }, {});
}

function CalculatorForm({ country, fields, passMark, maxNote, accentNote }) {
  const { openLeadForm } = useLeadForm();
  const [values, setValues] = useState(() => defaults(fields));

  const total = useMemo(
    () => Object.values(values).reduce((sum, v) => sum + Number(v), 0),
    [values]
  );

  const meets = total >= passMark;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {field.label}
            </label>
            <select
              value={values[field.key]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))
              }
              className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {field.options.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Score panel */}
      <div className="lg:col-span-1">
        <div className="sticky top-28 rounded-2xl bg-primary text-primary-foreground p-6 shadow-xl">
          <p className="text-sm uppercase tracking-wide opacity-80 mb-1">
            Your estimated {country} score
          </p>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-5xl font-extrabold text-accent">{total}</span>
            <span className="opacity-80 mb-1 text-sm">{maxNote}</span>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4 ${
              meets ? 'bg-accent text-accent-foreground' : 'bg-cta text-cta-foreground'
            }`}
          >
            {meets
              ? `Meets the ${passMark}-point threshold`
              : `${passMark - total} points below the ${passMark} threshold`}
          </div>
          <p className="text-xs opacity-80 leading-relaxed mb-5">{accentNote}</p>
          <Button type="button" variant="cta" className="w-full" onClick={() => openLeadForm(`${country} points calculator — Get an expert review`)}>
            Get an expert review
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

function PointsCalculator() {
  return (
    <div id="calculator" className="scroll-mt-28">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
          <Calculator className="h-6 w-6 text-accent" />
        </div>
        <h2 className="heading-section text-primary">Skilled Migration Points Calculator</h2>
      </div>
      <p className="text-muted-foreground mb-6 max-w-3xl">
        Estimate your points for Australian skilled migration or your Canada Express Entry CRS score.
        Adjust the options below to see your indicative total update instantly.
      </p>

      <Tabs defaultValue="australia" className="w-full">
        <TabsList className="mb-6 h-auto p-1">
          <TabsTrigger
            value="australia"
            className="px-5 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            🇦🇺 Australia (189/190/491)
          </TabsTrigger>
          <TabsTrigger
            value="canada"
            className="px-5 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            🇨🇦 Canada (Express Entry CRS)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="australia">
          <CalculatorForm
            country="Australia"
            fields={AU_FIELDS}
            passMark={65}
            maxNote="/ min 65"
            accentNote="65 points is the minimum to be invited, but competitive scores are usually higher. State or regional nomination can add 5–15 points."
          />
        </TabsContent>

        <TabsContent value="canada">
          <CalculatorForm
            country="Canada CRS"
            fields={CA_FIELDS}
            passMark={470}
            maxNote="/ 1200 max"
            accentNote="Recent Express Entry draw cut-offs often sit around 470–540. A provincial nomination adds 600 points and effectively guarantees an invitation."
          />
        </TabsContent>
      </Tabs>

      <p className="flex items-start gap-2 text-xs text-muted-foreground mt-6 max-w-3xl">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
        This calculator provides an indicative estimate only and is not a guarantee of eligibility or an
        official assessment. Points tests change over time — book a consultation for an accurate, personalised review.
      </p>
    </div>
  );
}

export default PointsCalculator;
