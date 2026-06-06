/**
 * Australian skilled occupations for the eligibility checker.
 *
 * Each entry: { code (ANZSCO), name, list, caveat? }
 *   list = 'MLTSSL' | 'STSOL' | 'ROL'
 *     MLTSSL → Subclass 189, 190, 491   (+ employer sponsored)
 *     STSOL  → Subclass 190, 491        (+ employer sponsored, short term)
 *     ROL    → Subclass 491 (regional)  (+ 494 regional)
 *
 * This is a curated list of commonly searched occupations. The Australian
 * skilled lists are reviewed periodically, so results are INDICATIVE — every
 * case should be confirmed with a formal skills assessment and eligibility
 * review (the checker funnels users to a free assessment for exactly this).
 */

export const VISA_BY_LIST = {
  MLTSSL: ['189', '190', '491'],
  STSOL: ['190', '491'],
  ROL: ['491'],
};

export const VISA_LABELS = {
  '189': 'Skilled Independent (Subclass 189)',
  '190': 'Skilled Nominated (Subclass 190)',
  '491': 'Skilled Work Regional (Subclass 491)',
};

export const SKILLED_OCCUPATIONS = [
  // ── ICT / Technology ─────────────────────────────────────────
  { code: '261313', name: 'Software Engineer', list: 'MLTSSL' },
  { code: '261312', name: 'Developer Programmer', list: 'MLTSSL' },
  { code: '261311', name: 'Analyst Programmer', list: 'MLTSSL' },
  { code: '261314', name: 'Software Tester', list: 'MLTSSL' },
  { code: '261111', name: 'ICT Business Analyst', list: 'STSOL' },
  { code: '261112', name: 'Systems Analyst', list: 'STSOL' },
  { code: '262112', name: 'ICT Security Specialist', list: 'MLTSSL' },
  { code: '262111', name: 'Database Administrator', list: 'STSOL' },
  { code: '263111', name: 'Computer Network and Systems Engineer', list: 'MLTSSL' },
  { code: '263112', name: 'Network Administrator', list: 'STSOL' },
  { code: '263113', name: 'Network Analyst', list: 'STSOL' },
  { code: '135112', name: 'ICT Project Manager', list: 'MLTSSL' },
  { code: '261212', name: 'Web Developer', list: 'STSOL' },
  { code: '313199', name: 'ICT Support Technicians nec', list: 'STSOL' },
  { code: '262113', name: 'Systems Administrator', list: 'STSOL' },
  { code: '225212', name: 'ICT Business Development Manager', list: 'STSOL' },

  // ── Engineering ─────────────────────────────────────────────
  { code: '233211', name: 'Civil Engineer', list: 'MLTSSL' },
  { code: '233214', name: 'Structural Engineer', list: 'MLTSSL' },
  { code: '233212', name: 'Geotechnical Engineer', list: 'MLTSSL' },
  { code: '233215', name: 'Transport Engineer', list: 'MLTSSL' },
  { code: '233311', name: 'Electrical Engineer', list: 'MLTSSL' },
  { code: '233411', name: 'Electronics Engineer', list: 'MLTSSL' },
  { code: '233512', name: 'Mechanical Engineer', list: 'MLTSSL' },
  { code: '233513', name: 'Production or Plant Engineer', list: 'MLTSSL' },
  { code: '233611', name: 'Mining Engineer (excluding Petroleum)', list: 'MLTSSL' },
  { code: '233612', name: 'Petroleum Engineer', list: 'MLTSSL' },
  { code: '233111', name: 'Chemical Engineer', list: 'MLTSSL' },
  { code: '233112', name: 'Materials Engineer', list: 'MLTSSL' },
  { code: '233213', name: 'Quantity Surveyor', list: 'MLTSSL' },
  { code: '233911', name: 'Aeronautical Engineer', list: 'MLTSSL' },
  { code: '233913', name: 'Biomedical Engineer', list: 'MLTSSL' },
  { code: '233914', name: 'Engineering Technologist', list: 'MLTSSL' },
  { code: '233915', name: 'Environmental Engineer', list: 'MLTSSL' },
  { code: '233912', name: 'Agricultural Engineer', list: 'MLTSSL' },
  { code: '233999', name: 'Engineering Professionals nec', list: 'MLTSSL' },

  // ── Health & Medical ────────────────────────────────────────
  { code: '254499', name: 'Registered Nurses nec', list: 'MLTSSL' },
  { code: '254411', name: 'Nurse Practitioner', list: 'MLTSSL' },
  { code: '254412', name: 'Registered Nurse (Aged Care)', list: 'MLTSSL' },
  { code: '254415', name: 'Registered Nurse (Critical Care and Emergency)', list: 'MLTSSL' },
  { code: '254418', name: 'Registered Nurse (Medical)', list: 'MLTSSL' },
  { code: '254422', name: 'Registered Nurse (Mental Health)', list: 'MLTSSL' },
  { code: '254425', name: 'Registered Nurse (Perioperative)', list: 'MLTSSL' },
  { code: '254423', name: 'Registered Nurse (Paediatrics)', list: 'MLTSSL' },
  { code: '253111', name: 'General Practitioner', list: 'MLTSSL' },
  { code: '253411', name: 'Psychiatrist', list: 'MLTSSL' },
  { code: '253211', name: 'Anaesthetist', list: 'MLTSSL' },
  { code: '253311', name: 'Specialist Physician (General Medicine)', list: 'MLTSSL' },
  { code: '252411', name: 'Occupational Therapist', list: 'MLTSSL' },
  { code: '252511', name: 'Physiotherapist', list: 'MLTSSL' },
  { code: '252611', name: 'Podiatrist', list: 'MLTSSL' },
  { code: '252712', name: 'Speech Pathologist', list: 'MLTSSL' },
  { code: '252711', name: 'Audiologist', list: 'MLTSSL' },
  { code: '251211', name: 'Medical Diagnostic Radiographer', list: 'MLTSSL' },
  { code: '251214', name: 'Sonographer', list: 'MLTSSL' },
  { code: '251411', name: 'Optometrist', list: 'MLTSSL' },
  { code: '252311', name: 'Dental Specialist', list: 'MLTSSL' },
  { code: '252312', name: 'Dentist', list: 'MLTSSL' },
  { code: '251513', name: 'Retail Pharmacist', list: 'STSOL' },
  { code: '251512', name: 'Hospital Pharmacist', list: 'MLTSSL' },
  { code: '253915', name: 'Medical Radiation Therapist', list: 'MLTSSL' },

  // ── Psychology & Social ─────────────────────────────────────
  { code: '272311', name: 'Clinical Psychologist', list: 'MLTSSL' },
  { code: '272312', name: 'Educational Psychologist', list: 'MLTSSL' },
  { code: '272399', name: 'Psychologists nec', list: 'MLTSSL' },
  { code: '272511', name: 'Social Worker', list: 'MLTSSL' },
  { code: '272613', name: 'Welfare Worker', list: 'STSOL' },
  { code: '272412', name: 'Interpreter', list: 'STSOL' },
  { code: '272413', name: 'Translator', list: 'STSOL' },

  // ── Accounting & Finance ────────────────────────────────────
  { code: '221111', name: 'Accountant (General)', list: 'MLTSSL', caveat: 'Subject to a pro-rata invitation ceiling — points scores are often competitive.' },
  { code: '221112', name: 'Management Accountant', list: 'MLTSSL', caveat: 'Subject to a pro-rata invitation ceiling.' },
  { code: '221113', name: 'Taxation Accountant', list: 'MLTSSL', caveat: 'Subject to a pro-rata invitation ceiling.' },
  { code: '221213', name: 'External Auditor', list: 'MLTSSL' },
  { code: '221214', name: 'Internal Auditor', list: 'STSOL' },
  { code: '224111', name: 'Actuary', list: 'MLTSSL' },
  { code: '132211', name: 'Finance Manager', list: 'STSOL' },
  { code: '222311', name: 'Financial Investment Adviser', list: 'STSOL' },
  { code: '224711', name: 'Management Consultant', list: 'STSOL' },
  { code: '224512', name: 'Valuer', list: 'STSOL' },

  // ── Trades & Construction ───────────────────────────────────
  { code: '331212', name: 'Carpenter', list: 'MLTSSL' },
  { code: '331211', name: 'Carpenter and Joiner', list: 'MLTSSL' },
  { code: '341111', name: 'Electrician (General)', list: 'MLTSSL' },
  { code: '341112', name: 'Electrician (Special Class)', list: 'MLTSSL' },
  { code: '334111', name: 'Plumber (General)', list: 'MLTSSL' },
  { code: '333111', name: 'Bricklayer', list: 'MLTSSL' },
  { code: '333211', name: 'Fibrous Plasterer', list: 'MLTSSL' },
  { code: '333411', name: 'Wall and Floor Tiler', list: 'MLTSSL' },
  { code: '332211', name: 'Painting Trades Worker', list: 'MLTSSL' },
  { code: '321211', name: 'Motor Mechanic (General)', list: 'MLTSSL' },
  { code: '321212', name: 'Diesel Motor Mechanic', list: 'MLTSSL' },
  { code: '322311', name: 'Metal Fabricator', list: 'MLTSSL' },
  { code: '322313', name: 'Welder (First Class)', list: 'MLTSSL' },
  { code: '342111', name: 'Air-conditioning and Refrigeration Mechanic', list: 'MLTSSL' },
  { code: '394111', name: 'Cabinetmaker', list: 'MLTSSL' },
  { code: '323211', name: 'Fitter (General)', list: 'MLTSSL' },
  { code: '324111', name: 'Panelbeater', list: 'MLTSSL' },
  { code: '351311', name: 'Chef', list: 'MLTSSL' },
  { code: '351411', name: 'Cook', list: 'STSOL' },
  { code: '351111', name: 'Baker', list: 'STSOL' },
  { code: '351112', name: 'Pastrycook', list: 'STSOL' },
  { code: '391111', name: 'Hairdresser', list: 'STSOL' },

  // ── Education ───────────────────────────────────────────────
  { code: '241111', name: 'Early Childhood (Pre-primary School) Teacher', list: 'MLTSSL' },
  { code: '241213', name: 'Primary School Teacher', list: 'MLTSSL' },
  { code: '241411', name: 'Secondary School Teacher', list: 'MLTSSL' },
  { code: '241511', name: 'Special Needs Teacher', list: 'MLTSSL' },
  { code: '241311', name: 'Middle School Teacher', list: 'MLTSSL' },
  { code: '242111', name: 'University Lecturer', list: 'STSOL' },
  { code: '249111', name: 'Education Adviser', list: 'STSOL' },

  // ── Architecture, Design & Surveying ────────────────────────
  { code: '232111', name: 'Architect', list: 'MLTSSL' },
  { code: '232112', name: 'Landscape Architect', list: 'STSOL' },
  { code: '232212', name: 'Surveyor', list: 'MLTSSL' },
  { code: '232213', name: 'Cartographer', list: 'MLTSSL' },
  { code: '232214', name: 'Other Spatial Scientist', list: 'MLTSSL' },
  { code: '312111', name: 'Architectural Draftsperson', list: 'STSOL' },
  { code: '312211', name: 'Civil Engineering Draftsperson', list: 'STSOL' },
  { code: '133111', name: 'Construction Project Manager', list: 'MLTSSL' },
  { code: '133112', name: 'Project Builder', list: 'MLTSSL' },

  // ── Science & Agriculture ───────────────────────────────────
  { code: '234711', name: 'Veterinarian', list: 'MLTSSL' },
  { code: '234211', name: 'Chemist', list: 'STSOL' },
  { code: '234511', name: 'Life Scientist (General)', list: 'STSOL' },
  { code: '234111', name: 'Agricultural Consultant', list: 'STSOL' },
  { code: '234112', name: 'Agricultural Scientist', list: 'STSOL' },
  { code: '234914', name: 'Physicist', list: 'MLTSSL', caveat: 'Generally limited to Medical Physicist roles.' },

  // ── Management ──────────────────────────────────────────────
  { code: '134212', name: 'Nursing Clinical Director', list: 'MLTSSL' },
  { code: '132511', name: 'Research and Development Manager', list: 'STSOL' },
  { code: '139912', name: 'Quality Assurance Manager', list: 'STSOL' },
  { code: '141111', name: 'Cafe or Restaurant Manager', list: 'STSOL' },
];

/** Returns the visa subclasses an occupation's list qualifies for. */
export function visasForOccupation(occ) {
  return VISA_BY_LIST[occ.list] || [];
}
