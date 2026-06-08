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

  // ── Additional ICT ──────────────────────────────────────────
  { code: '261399', name: 'Software and Applications Programmers nec', list: 'MLTSSL' },
  { code: '263211', name: 'ICT Quality Assurance Engineer', list: 'MLTSSL' },
  { code: '263212', name: 'ICT Support Engineer', list: 'MLTSSL' },
  { code: '263213', name: 'ICT Systems Test Engineer', list: 'MLTSSL' },
  { code: '313113', name: 'Web Administrator', list: 'STSOL' },
  { code: '135111', name: 'Chief Information Officer', list: 'STSOL' },
  { code: '262114', name: 'Cyber Security Engineer', list: 'MLTSSL' },

  // ── Additional Engineering & Technical ──────────────────────
  { code: '233916', name: 'Naval Architect', list: 'MLTSSL' },
  { code: '312212', name: 'Civil Engineering Technician', list: 'STSOL' },
  { code: '312511', name: 'Mechanical Engineering Technician', list: 'STSOL' },
  { code: '312512', name: 'Mechanical Engineering Draftsperson', list: 'STSOL' },
  { code: '312411', name: 'Electrical Engineering Draftsperson', list: 'STSOL' },
  { code: '312412', name: 'Electrical Engineering Technician', list: 'STSOL' },
  { code: '133211', name: 'Engineering Manager', list: 'MLTSSL' },

  // ── Additional Health & Medical ─────────────────────────────
  { code: '251111', name: 'Dietitian', list: 'MLTSSL' },
  { code: '251311', name: 'Environmental Health Officer', list: 'MLTSSL' },
  { code: '251312', name: 'Occupational Health and Safety Adviser', list: 'STSOL' },
  { code: '252111', name: 'Chiropractor', list: 'MLTSSL' },
  { code: '252112', name: 'Osteopath', list: 'MLTSSL' },
  { code: '253511', name: 'Surgeon (General)', list: 'MLTSSL' },
  { code: '253513', name: 'Neurosurgeon', list: 'MLTSSL' },
  { code: '253518', name: 'Vascular Surgeon', list: 'MLTSSL' },
  { code: '254421', name: 'Registered Nurse (Medical Practice)', list: 'MLTSSL' },
  { code: '254424', name: 'Registered Nurse (Surgical)', list: 'MLTSSL' },
  { code: '254414', name: 'Registered Nurse (Community Health)', list: 'MLTSSL' },
  { code: '234611', name: 'Medical Laboratory Scientist', list: 'MLTSSL' },
  { code: '411411', name: 'Enrolled Nurse', list: 'STSOL' },
  { code: '251112', name: 'Nutritionist', list: 'STSOL' },

  // ── Additional Trades ───────────────────────────────────────
  { code: '334114', name: 'Gasfitter', list: 'MLTSSL' },
  { code: '334115', name: 'Roof Plumber', list: 'MLTSSL' },
  { code: '334113', name: 'Drainer', list: 'MLTSSL' },
  { code: '322312', name: 'Pressure Welder', list: 'MLTSSL' },
  { code: '322114', name: 'Metal Machinist (First Class)', list: 'MLTSSL' },
  { code: '321111', name: 'Automotive Electrician', list: 'MLTSSL' },
  { code: '333311', name: 'Roof Tiler', list: 'MLTSSL' },
  { code: '333212', name: 'Solid Plasterer', list: 'MLTSSL' },
  { code: '351211', name: 'Butcher or Smallgoods Maker', list: 'STSOL' },
  { code: '394213', name: 'Wood Machinist', list: 'STSOL' },

  // ── Additional Education ────────────────────────────────────
  { code: '249311', name: 'Teacher of English to Speakers of Other Languages', list: 'MLTSSL' },
  { code: '241599', name: 'Special Education Teachers nec', list: 'MLTSSL' },
  { code: '249214', name: 'Music Teacher (Private Tuition)', list: 'STSOL' },
  { code: '134311', name: 'School Principal', list: 'STSOL' },

  // ── Additional Science & Agriculture ────────────────────────
  { code: '234212', name: 'Food Technologist', list: 'MLTSSL' },
  { code: '234411', name: 'Geologist', list: 'MLTSSL' },
  { code: '234412', name: 'Geophysicist', list: 'MLTSSL' },
  { code: '234413', name: 'Hydrogeologist', list: 'MLTSSL' },
  { code: '234312', name: 'Environmental Consultant', list: 'STSOL' },
  { code: '234313', name: 'Environmental Research Scientist', list: 'STSOL' },
  { code: '234514', name: 'Biochemist', list: 'STSOL' },
  { code: '234516', name: 'Marine Biologist', list: 'STSOL' },
  { code: '234518', name: 'Zoologist', list: 'STSOL' },
  { code: '234213', name: 'Winemaker', list: 'STSOL' },

  // ── Finance, Business & Legal ───────────────────────────────
  { code: '224311', name: 'Economist', list: 'STSOL' },
  { code: '271111', name: 'Barrister', list: 'MLTSSL' },
  { code: '271311', name: 'Solicitor', list: 'MLTSSL' },
  { code: '271211', name: 'Corporate Treasurer', list: 'MLTSSL' },
  { code: '132111', name: 'Corporate Services Manager', list: 'STSOL' },
  { code: '222312', name: 'Financial Investment Manager', list: 'STSOL' },

  // ── Social, Community & Creative ────────────────────────────
  { code: '272114', name: 'Rehabilitation Counsellor', list: 'STSOL' },
  { code: '272115', name: 'Student Counsellor', list: 'STSOL' },
  { code: '272111', name: 'Careers Counsellor', list: 'STSOL' },
  { code: '212415', name: 'Technical Writer', list: 'STSOL' },
  { code: '212411', name: 'Author', list: 'STSOL' },
  { code: '411711', name: 'Community Worker', list: 'ROL' },
  { code: '411715', name: 'Residential Care Officer', list: 'ROL' },

  // ── Aviation & Maritime ─────────────────────────────────────
  { code: '231111', name: 'Aeroplane Pilot', list: 'STSOL' },
  { code: '231112', name: 'Flying Instructor', list: 'STSOL' },
  { code: '231213', name: "Ship's Master", list: 'STSOL' },
  { code: '231212', name: "Ship's Engineer", list: 'STSOL' },

  // ── Management & Sales ──────────────────────────────────────
  { code: '131112', name: 'Sales and Marketing Manager', list: 'STSOL' },
  { code: '131114', name: 'Public Relations Manager', list: 'STSOL' },
  { code: '133513', name: 'Production Manager (Mining)', list: 'STSOL' },
  { code: '133512', name: 'Production Manager (Manufacturing)', list: 'STSOL' },
  { code: '149212', name: 'Customer Service Manager', list: 'STSOL' },
];

/** Returns the visa subclasses an occupation's list qualifies for. */
export function visasForOccupation(occ) {
  return VISA_BY_LIST[occ.list] || [];
}

const ANZSCO_MAJOR = {
  1: 'Managers',
  2: 'Professionals',
  3: 'Technicians & Trades Workers',
  4: 'Community & Personal Service Workers',
  5: 'Clerical & Administrative Workers',
  6: 'Sales Workers',
  7: 'Machinery Operators & Drivers',
  8: 'Labourers',
};

/** Broad ANZSCO occupation category from the first digit of the code. */
export function anzscoCategory(code) {
  return ANZSCO_MAJOR[Number(String(code || '').charAt(0))] || 'Skilled Occupation';
}
