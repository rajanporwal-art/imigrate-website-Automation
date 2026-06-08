/**
 * Australia General Skilled Migration points test (Subclass 189/190/491).
 * Shared by the Points Calculator and the AI Eligibility Assessment so there
 * is a single source of truth for the factors and their point values.
 */
export const AU_PASS_MARK = 65;

export const AU_FIELDS = [
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
    key: 'regionalStudy',
    label: 'Study in regional Australia',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes (regional study)', value: 5 },
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

export function auDefaults() {
  return AU_FIELDS.reduce((acc, f) => {
    acc[f.key] = f.options[0].value;
    return acc;
  }, {});
}

export function computeAuPoints(values) {
  return Object.values(values).reduce((sum, v) => sum + Number(v), 0);
}

/** Returns [{ label, choice, points }] for the selected answers — used in the report. */
export function auSelectedSummary(values) {
  return AU_FIELDS.map((f) => {
    const opt = f.options.find((o) => Number(o.value) === Number(values[f.key])) || f.options[0];
    return { key: f.key, label: f.label, choice: opt.label, points: Number(opt.value) };
  });
}
