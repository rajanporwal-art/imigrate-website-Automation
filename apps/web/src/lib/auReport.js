/**
 * Builds a personalized Australia skilled-migration report from the user's
 * occupation + points answers. Rules-based (deterministic) — not a live LLM —
 * so it runs instantly client-side with no API dependency. All figures are
 * indicative; the report and email carry a prominent disclaimer.
 */
import { VISA_BY_LIST } from '@/data/skilledOccupations';
import { AU_PASS_MARK, auSelectedSummary } from '@/data/auPointsFields';

const VISA_DETAILS = {
  '189': {
    code: '189',
    name: 'Skilled Independent Visa (Subclass 189)',
    overview:
      'A permanent visa for points-tested skilled workers who are NOT sponsored by an employer, state or family member.',
    benefits: ['Permanent residence on grant', 'Live and work anywhere in Australia', 'Include eligible family members', 'Pathway to citizenship'],
    criteria: ['Occupation on the MLTSSL', 'Positive skills assessment', 'Competent English (min)', 'At least 65 points', 'Invited to apply (EOI)'],
    processing: 'Indicative: ~5–12 months after invitation',
    govFee: 'From AUD 4,640 (primary applicant)',
    stateNom: 'Not required',
  },
  '190': {
    code: '190',
    name: 'Skilled Nominated Visa (Subclass 190)',
    overview:
      'A permanent visa for skilled workers nominated by an Australian state or territory government. Nomination adds 5 points.',
    benefits: ['Permanent residence on grant', '+5 points for state nomination', 'Work and live in the nominating state', 'Pathway to citizenship'],
    criteria: ['Occupation on the relevant state list (MLTSSL or STSOL)', 'Positive skills assessment', 'Competent English (min)', 'State nomination', 'At least 65 points (incl. nomination)'],
    processing: 'Indicative: ~6–14 months after invitation',
    govFee: 'From AUD 4,640 (primary applicant)',
    stateNom: 'Required — varies by state/territory',
  },
  '491': {
    code: '491',
    name: 'Skilled Work Regional (Provisional) Visa (Subclass 491)',
    overview:
      'A 5-year provisional visa for skilled workers nominated by a state/territory or sponsored by an eligible relative in regional Australia. Adds 15 points and leads to PR via the Subclass 191.',
    benefits: ['+15 points', 'Live, work and study in regional Australia', 'Pathway to permanent residence (Subclass 191) after 3 years', 'Include family members'],
    criteria: ['Occupation on the relevant regional list', 'Positive skills assessment', 'Competent English (min)', 'Regional state nomination or family sponsorship', 'At least 65 points (incl. nomination)'],
    processing: 'Indicative: ~6–14 months after invitation',
    govFee: 'From AUD 4,640 (primary applicant)',
    stateNom: 'Required — regional state nomination or eligible family sponsorship',
  },
};

const EMPLOYER_PATHWAY = {
  code: '482/186',
  name: 'Employer Sponsored Pathways (Subclass 482 / 186)',
  overview:
    'If you secure an Australian employer willing to sponsor you, employer-sponsored visas can offer a temporary (482) or permanent (186) route — often without the points test.',
  benefits: ['Does not rely on the points test', 'Subclass 186 grants permanent residence', 'Employer-driven, occupation in demand'],
  criteria: ['A sponsoring Australian employer', 'Relevant skills and experience', 'Occupation on the relevant list'],
  processing: 'Indicative: varies by stream',
  govFee: 'Varies by stream',
  stateNom: 'Not applicable (employer-nominated)',
};

function buildRecommendations({ answers, points, occupation }) {
  const recs = [];
  const gap = AU_PASS_MARK - points;
  if (points < AU_PASS_MARK) {
    recs.push(`You are about ${gap} point${gap === 1 ? '' : 's'} below the 65-point threshold. The fastest ways to close the gap are usually English, state nomination and partner points.`);
  } else {
    recs.push(`You meet the 65-point minimum. Invitation rounds are competitive, so consider the levers below to strengthen your ranking.`);
  }
  if (Number(answers.english) < 20) {
    recs.push('Improve your English to Superior (IELTS 8 / PTE 79 each band) to claim up to 20 points — often the single biggest lever.');
  }
  if (Number(answers.nomination) === 0) {
    recs.push('Explore state nomination (Subclass 190, +5 points) or regional nomination/sponsorship (Subclass 491, +15 points) to lift your score and unlock more pathways.');
  }
  if (Number(answers.partner) === 0 || Number(answers.partner) === 5) {
    recs.push('If you have a partner, a positive partner skills assessment and English can add 5–10 points.');
  }
  if (Number(answers.ausStudy) === 0) {
    recs.push('Completing 2 academic years of eligible Australian study can add 5 points and may also help with regional and professional-year points.');
  }
  if (occupation && occupation.list === 'STSOL') {
    recs.push('Your occupation is on the STSOL, so the Subclass 189 is not available — focus on state-nominated (190) and regional (491) pathways.');
  } else if (occupation && occupation.list === 'ROL') {
    recs.push('Your occupation is on the Regional Occupation List — the Subclass 491 (regional) is your primary points-tested pathway.');
  } else if (occupation && occupation.list === 'MLTSSL') {
    recs.push('Your occupation is on the MLTSSL, giving you access to the widest range of pathways including the independent Subclass 189.');
  }
  recs.push('Obtain a positive skills assessment from the relevant assessing authority before lodging an Expression of Interest (EOI).');
  recs.push('Book a free consultation with an iMigrate specialist to verify your eligibility and build a personalized migration roadmap.');
  return recs;
}

function buildDocuments({ answers }) {
  const docs = [
    'Valid passport (with sufficient validity)',
    'Updated CV / résumé',
    'Educational qualifications & transcripts',
    'Skills assessment outcome (from the relevant authority)',
    'English test results (IELTS / PTE / equivalent)',
    'Employment reference letters (duties, dates, hours)',
    'Payslips / tax records as evidence of employment',
    'Police clearance certificate(s)',
    'Health examination (panel physician)',
  ];
  if (Number(answers.partner) === 5 || Number(answers.partner) === 10) {
    docs.push('Marriage / de facto relationship certificate (if including a partner)');
    docs.push("Partner's identity, skills and English documents (if claiming partner points)");
  }
  docs.push("Birth certificates for any dependent children");
  docs.push('Additional supporting documents as advised after assessment');
  return docs;
}

export function buildReport({ occupation, points, answers, name }) {
  const visaCodes = occupation ? VISA_BY_LIST[occupation.list] || [] : [];
  const eligibleVisas = visaCodes.map((c) => VISA_DETAILS[c]).filter(Boolean);
  eligibleVisas.push(EMPLOYER_PATHWAY);
  const meets = points >= AU_PASS_MARK;
  return {
    name: name || '',
    occupation: occupation || null,
    points,
    passMark: AU_PASS_MARK,
    meets,
    eligibilityStatus: meets
      ? 'Preliminary status: likely to meet the minimum points to be invited'
      : `Preliminary status: ${AU_PASS_MARK - points} points below the current 65-point minimum`,
    date: new Date().toISOString().slice(0, 10),
    answersSummary: auSelectedSummary(answers),
    eligibleVisas,
    processSteps: [
      'Skills Assessment (relevant assessing authority)',
      'English Language Test (IELTS / PTE / equivalent)',
      'Submit an Expression of Interest (EOI) in SkillSelect',
      'State / Regional Nomination (if applicable)',
      'Receive an Invitation to Apply (ITA)',
      'Lodge the visa application with documents',
      'Health (Medical) Examination',
      'Police Clearance / Character checks',
      'Visa Decision',
    ],
    documents: buildDocuments({ answers }),
    recommendations: buildRecommendations({ answers, points, occupation }),
  };
}

/** Compact fields for CRM/lead capture + lead tags. */
export function reportLeadFields(report, lead) {
  const visas = report.eligibleVisas.map((v) => v.code).join(', ');
  const tags = ['New Lead', 'AI Assessment Completed', 'Consultation Pending'];
  if (report.meets) tags.push('High Points Candidate');
  if (report.eligibleVisas.length > 2) tags.push('Multiple Visa Pathways');
  return {
    fullName: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    occupation: report.occupation ? report.occupation.name : '',
    anzscoCode: report.occupation ? report.occupation.code : '',
    pointsScore: String(report.points),
    eligibleVisaSubclasses: visas,
    assessmentDate: report.date,
    eligibilityStatus: report.eligibilityStatus,
    aiRecommendations: report.recommendations.join(' | '),
    userInputs: report.answersSummary.map((a) => `${a.label}: ${a.choice} (${a.points})`).join('; '),
    leadSource: 'Australia Free Eligibility Check',
    tags: tags.join(', '),
  };
}

/** Builds the HTML email body for the report. */
export function reportToEmailHtml(report, lead, bookingUrl) {
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const visaRows = report.eligibleVisas
    .map(
      (v) => `<tr><td style="padding:8px 10px;border-bottom:1px solid #eee;font-weight:600;color:#0b1f44">${esc(v.name)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;color:#444">${esc(v.overview)}</td></tr>`
    )
    .join('');
  const recs = report.recommendations.map((r) => `<li style="margin:6px 0">${esc(r)}</li>`).join('');
  const steps = report.processSteps.map((s, i) => `<li style="margin:4px 0">${esc(s)}</li>`).join('');
  const docs = report.documents.map((d) => `<li style="margin:3px 0">${esc(d)}</li>`).join('');
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#222">
    <div style="background:#0b1f44;color:#fff;padding:22px 24px;border-radius:10px 10px 0 0">
      <h1 style="margin:0;font-size:20px">Your Personalized Australia Immigration Assessment Report</h1>
    </div>
    <div style="padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 10px 10px">
      <p>Hi ${esc(lead.fullName || 'there')},</p>
      <p>Thank you for completing the iMigrate AI Eligibility Assessment. Here is your personalized summary.</p>
      <h2 style="color:#0b1f44;font-size:16px;margin-top:22px">Candidate summary</h2>
      <ul style="line-height:1.6">
        <li><strong>Occupation:</strong> ${esc(report.occupation ? report.occupation.name : 'N/A')} ${report.occupation ? '(' + esc(report.occupation.code) + ')' : ''}</li>
        <li><strong>Points score:</strong> ${esc(report.points)} / 65 minimum</li>
        <li><strong>Assessment date:</strong> ${esc(report.date)}</li>
        <li><strong>Preliminary status:</strong> ${esc(report.eligibilityStatus)}</li>
      </ul>
      <h2 style="color:#0b1f44;font-size:16px;margin-top:22px">Likely visa pathways</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${visaRows}</table>
      <h2 style="color:#0b1f44;font-size:16px;margin-top:22px">Recommended next steps</h2>
      <ul style="line-height:1.5;font-size:14px">${recs}</ul>
      <details style="margin-top:14px"><summary style="cursor:pointer;color:#0b1f44;font-weight:600">Migration process &amp; document checklist</summary>
        <p style="font-weight:600;margin:12px 0 4px">Process</p><ol style="font-size:13px;line-height:1.4">${steps}</ol>
        <p style="font-weight:600;margin:12px 0 4px">Documents</p><ul style="font-size:13px;line-height:1.3">${docs}</ul>
      </details>
      <div style="text-align:center;margin:28px 0">
        <a href="${esc(bookingUrl)}" style="background:#e11d2a;color:#fff;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:8px;display:inline-block">Book My FREE Consultation</a>
      </div>
      <p style="font-size:13px;color:#555">This AI-generated report is intended as a preliminary guide only. Final eligibility depends on a detailed assessment under current Australian immigration regulations. Book your FREE iMigrate Eligibility Consultation to have a migration specialist review your profile, verify your eligibility, identify the best visa pathway, and provide a personalized migration roadmap.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:18px 0">
      <p style="font-size:11px;color:#888"><strong>IMPORTANT DISCLAIMER:</strong> This report is automatically generated using the information you provided and is for informational purposes only. It is NOT an official migration assessment, legal advice, a visa-approval prediction, or confirmation of eligibility. Actual eligibility depends on supporting documentation, skills assessment outcomes, English results, employment verification, occupation availability, state nomination criteria and Australian Government policy, which may change without notice.</p>
    </div>
  </div>`;
}
