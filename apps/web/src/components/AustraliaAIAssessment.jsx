import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, CheckCircle2, Briefcase, Calculator, Mail, ArrowRight, ArrowLeft,
  Sparkles, ShieldCheck, Lock, Loader2, AlertTriangle, MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  SKILLED_OCCUPATIONS, VISA_LABELS, visasForOccupation, anzscoCategory,
} from '@/data/skilledOccupations';
import { AU_FIELDS, auDefaults, computeAuPoints, AU_PASS_MARK } from '@/data/auPointsFields';
import { buildReport, reportLeadFields, reportToEmailHtml } from '@/lib/auReport';

const BOOKING_URL = 'https://www.imigratesolution.com/book-appointment';
const STEPS = ['Occupation', 'Points', 'Your report'];

function StepBar({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              i <= step ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
            }`}>{i + 1}</span>
            <span className={`text-xs sm:text-sm font-medium ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <span className="hidden sm:block w-8 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
}

function AustraliaAIAssessment() {
  const [step, setStep] = useState(0); // 0 occupation, 1 points, 2 report(gate/success)
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [occupation, setOccupation] = useState(null);
  const [answers, setAnswers] = useState(() => auDefaults());
  const [lead, setLead] = useState({ fullName: '', email: '', phone: '', consent: false });
  const [cvFile, setCvFile] = useState(null);
  const [cvErr, setCvErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [done, setDone] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SKILLED_OCCUPATIONS
      .filter((o) => o.name.toLowerCase().includes(q) || o.code.includes(q))
      .sort((a, b) => (a.name.toLowerCase().startsWith(q) ? 0 : 1) - (b.name.toLowerCase().startsWith(q) ? 0 : 1))
      .slice(0, 8);
  }, [query]);

  const points = useMemo(() => computeAuPoints(answers), [answers]);
  const meets = points >= AU_PASS_MARK;
  const visaCodes = occupation ? visasForOccupation(occupation) : [];

  function chooseOccupation(o) {
    setOccupation(o); setQuery(o.name); setOpen(false);
  }

  function handleCv(e) {
    const file = e.target.files[0];
    setCvErr('');
    if (!file) { setCvFile(null); return; }
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) { setCvErr('Only PDF, DOC, DOCX, JPG or PNG accepted.'); setCvFile(null); return; }
    if (file.size > 5 * 1024 * 1024) { setCvErr('File must be under 5 MB.'); setCvFile(null); return; }
    setCvFile(file);
  }

  async function submitLead(e) {
    e.preventDefault();
    setError('');
    if (!lead.fullName.trim() || !lead.email.trim() || !lead.phone.trim()) {
      setError('Please complete your name, email and mobile number.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(lead.email)) { setError('Please enter a valid email address.'); return; }
    setSubmitting(true);
    const rpt = buildReport({ occupation, points, answers, name: lead.fullName });
    const fields = reportLeadFields(rpt, lead);
    // Optional CV upload — stored filename is linked to the lead so the CRM can view/download it.
    if (cvFile) {
      try {
        const fd = new FormData(); fd.append('cv', cvFile);
        const up = await fetch('/lead-upload.php', { method: 'POST', body: fd });
        if (up.ok) { const uj = await up.json(); if (uj && uj.file) { fields.cvFile = uj.file; fields.cvOriginalName = uj.original || cvFile.name || ''; fields.cvFilename = uj.file; } }
      } catch (_) { /* non-fatal */ }
    }
    const html = reportToEmailHtml(rpt, lead, BOOKING_URL);
    try {
      // 1) Save the full lead + assessment data + tags to the CRM / lead store.
      await fetch('/lead-capture.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formName: 'Australia AI Eligibility Assessment',
          fields,
          context: { pageUri: typeof location !== 'undefined' ? location.href : '', source: 'Australia Free Eligibility Check' },
        }),
      }).catch(() => {});
      // 2) Email the personalized report to the user (+ notify sales).
      await fetch('/send-report.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.fullName, email: lead.email, mobile: lead.phone,
          subject: 'Your Personalized Australia Immigration Assessment Report',
          html, points: rpt.points, occupation: rpt.occupation ? rpt.occupation.name : '',
          visas: fields.eligibleVisaSubclasses, tags: fields.tags, website: '',
        }),
      }).catch(() => {});
      // 3) Persist the rendered report to the CRM so consultants can view,
      //    download (PDF), re-email and keep historical versions of it.
      await fetch('/crm-reports.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'capture', name: lead.fullName, email: lead.email,
          occupation: rpt.occupation ? rpt.occupation.name : '',
          anzsco: rpt.occupation ? rpt.occupation.code : '',
          points: String(rpt.points), visas: fields.eligibleVisaSubclasses,
          eligibilityStatus: rpt.eligibilityStatus,
          source: 'Australia Free Eligibility Check', html, website: '',
        }),
      }).catch(() => {});
      setReport(rpt); setDone(true);
    } catch (err) {
      setError('Something went wrong sending your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="occupation-checker" className="section-spacing bg-muted scroll-mt-24">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-sm font-semibold mb-4">
            <Sparkles className="h-4 w-4 text-accent" /> AI Immigration Assessment
          </div>
          <h2 className="heading-section text-balance mb-3 text-primary">Australia Free Eligibility Check</h2>
          <p className="text-muted-foreground leading-relaxed">
            Search your occupation, estimate your points, and get a personalized AI immigration report
            emailed to you in minutes — covering your eligible visa pathways and next steps.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-background rounded-2xl border border-border shadow-lg p-6 sm:p-8">
          {!done && <StepBar step={step} />}

          {/* STEP 1 — Occupation */}
          {step === 0 && (
            <div>
              <h3 className="font-semibold text-lg text-primary mb-1">Step 1 — Find your occupation</h3>
              <p className="text-sm text-muted-foreground mb-4">Search the Australian Skilled Occupation List by job title or ANZSCO code.</p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setOpen(true); if (occupation) setOccupation(null); }}
                  onFocus={() => query && setOpen(true)}
                  placeholder="e.g. Software Engineer, Registered Nurse, 233211…"
                  aria-label="Search occupation"
                  autoComplete="off"
                  className="h-14 pl-12 text-base rounded-full bg-background"
                />
                {open && results.length > 0 && (
                  <ul className="absolute z-20 mt-2 w-full max-h-72 overflow-auto rounded-2xl border border-border bg-background shadow-xl py-2 text-left">
                    {results.map((o) => (
                      <li key={o.code}>
                        <button type="button" onClick={() => chooseOccupation(o)} className="flex w-full items-center justify-between gap-3 px-4 py-3 hover:bg-muted">
                          <span className="font-medium">{o.name}</span>
                          <span className="text-xs font-mono text-muted-foreground">{o.code}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {occupation && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-xl border border-border bg-muted/40 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <div><span className="text-muted-foreground">Occupation:</span> <strong>{occupation.name}</strong></div>
                        <div><span className="text-muted-foreground">ANZSCO code:</span> <strong className="font-mono">{occupation.code}</strong></div>
                        <div><span className="text-muted-foreground">Category:</span> <strong>{anzscoCategory(occupation.code)}</strong></div>
                        <div><span className="text-muted-foreground">Skilled list:</span> <strong>{occupation.list}</strong></div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {visaCodes.map((c) => (
                          <span key={c} className="inline-flex items-center gap-1 rounded-full bg-accent/15 text-primary px-2.5 py-1 text-xs font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> {VISA_LABELS[c]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="mt-6 flex justify-end">
                <Button size="lg" variant="cta" disabled={!occupation} onClick={() => setStep(1)}>
                  Continue to points assessment <ArrowRight className="ml-1 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2 — Points */}
          {step === 1 && (
            <div className="scroll-mt-28">
              <h3 className="font-semibold text-lg text-primary mb-1">Step 2 — Estimate your points</h3>
              <p className="text-sm text-muted-foreground mb-4">Australia skilled migration points test (Subclass 189/190/491).</p>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {AU_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{field.label}</label>
                    <select
                      value={answers[field.key]}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {field.options.map((opt) => <option key={opt.label} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className={`mt-6 rounded-xl p-5 flex items-center justify-between ${meets ? 'bg-accent/15' : 'bg-cta/10'}`}>
                <div>
                  <p className="text-sm text-muted-foreground">Your estimated points</p>
                  <p className="text-4xl font-extrabold text-primary">{points} <span className="text-base font-medium text-muted-foreground">/ 65 min</span></p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meets ? 'bg-accent text-accent-foreground' : 'bg-cta text-cta-foreground'}`}>
                  {meets ? 'Meets the minimum' : `${AU_PASS_MARK - points} below threshold`}
                </span>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <Button size="lg" variant="outline" onClick={() => setStep(0)}><ArrowLeft className="mr-1 h-5 w-5" /> Back</Button>
                <Button size="lg" variant="cta" onClick={() => setStep(2)}>
                  <Sparkles className="mr-1 h-5 w-5" /> Generate my AI report
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 — Gate / Success */}
          {step === 2 && !done && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-accent/15 mb-3"><Lock className="h-7 w-7 text-accent" /></div>
                <h3 className="font-semibold text-xl text-primary">Your personalized report is ready</h3>
                <p className="text-sm text-muted-foreground mt-1">Enter your details and we'll email your full AI Immigration Assessment Report instantly.</p>
              </div>

              {/* Teaser summary (locked report) */}
              <div className="rounded-xl border border-border bg-muted/40 p-4 mb-6 text-sm grid sm:grid-cols-3 gap-3 text-center">
                <div><p className="text-muted-foreground text-xs">Occupation</p><p className="font-semibold truncate">{occupation ? occupation.name : '—'}</p></div>
                <div><p className="text-muted-foreground text-xs">Points score</p><p className="font-semibold">{points} / 65</p></div>
                <div><p className="text-muted-foreground text-xs">Visa pathways</p><p className="font-semibold">{visaCodes.length + 1} identified</p></div>
              </div>

              <form onSubmit={submitLead} className="space-y-4">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" value="" onChange={() => {}} />
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name <span className="text-cta">*</span></label>
                  <Input required value={lead.fullName} onChange={(e) => setLead({ ...lead, fullName: e.target.value })} placeholder="Your full name" className="h-12" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address <span className="text-cta">*</span></label>
                    <Input required type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} placeholder="you@email.com" className="h-12" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mobile / WhatsApp <span className="text-cta">*</span></label>
                    <Input required type="tel" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} placeholder="+60 1X XXX XXXX" className="h-12" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Attach your CV / Resume <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <label htmlFor="aia-cv" className="flex items-center justify-between gap-2 h-12 px-4 rounded-md border border-input bg-background cursor-pointer text-sm text-muted-foreground hover:border-accent">
                    <span className="truncate">{cvFile ? cvFile.name : 'Choose file… (PDF, DOC, DOCX, JPG, PNG)'}</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </label>
                  <input id="aia-cv" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={handleCv} />
                  {cvErr && <p className="text-xs text-cta mt-1">{cvErr}</p>}
                  <p className="text-xs text-muted-foreground mt-1">Speeds up your assessment — our consultants can review your background in advance.</p>
                </div>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" checked={lead.consent} onChange={(e) => setLead({ ...lead, consent: e.target.checked })} className="mt-0.5" />
                  I agree to be contacted about my assessment and consent to receive my report and follow-up by email/WhatsApp.
                </label>
                {error && <p className="text-sm text-cta flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> {error}</p>}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button type="button" size="lg" variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-1 h-5 w-5" /> Back</Button>
                  <Button type="submit" size="lg" variant="cta" disabled={submitting} className="flex-1 sm:flex-none">
                    {submitting ? <><Loader2 className="mr-1 h-5 w-5 animate-spin" /> Sending…</> : <><Mail className="mr-1 h-5 w-5" /> Email My Free Report</>}
                  </Button>
                </div>
                <p className="flex items-center gap-1.5 justify-center text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-accent" /> Your details are kept private and never sold.</p>
              </form>
            </div>
          )}

          {/* SUCCESS */}
          {done && report && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4"><CheckCircle2 className="h-9 w-9 text-green-600" /></div>
              <h3 className="text-2xl font-bold text-primary mb-2">Your Report Is On Its Way!</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                We've emailed your personalized Australia Immigration Assessment Report to <strong>{lead.email}</strong>.
                Please check your inbox and your spam/junk folder.
              </p>

              <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm max-w-xl mx-auto">
                <div className="rounded-xl border border-border bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Occupation</p><p className="font-semibold truncate">{report.occupation ? report.occupation.name : '—'}</p></div>
                <div className="rounded-xl border border-border bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Points</p><p className="font-semibold">{report.points} / 65</p></div>
                <div className="rounded-xl border border-border bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Pathways</p><p className="font-semibold">{report.eligibleVisas.length}</p></div>
              </div>
              <div className="mt-5 text-left max-w-xl mx-auto">
                <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-1"><MapPin className="h-4 w-4 text-accent" /> Likely visa pathways</p>
                <ul className="space-y-1.5">
                  {report.eligibleVisas.map((v) => (
                    <li key={v.code} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> {v.name}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 rounded-2xl bg-primary text-primary-foreground p-6">
                <h4 className="text-lg font-bold mb-1">Get Your FREE Professional Eligibility Assessment</h4>
                <p className="text-sm opacity-90 mb-4">Don't rely solely on an automated report. Have an iMigrate specialist verify your eligibility, identify the strongest pathway and build your personalized migration roadmap.</p>
                <Button asChild size="lg" variant="cta"><Link to="/book-appointment">Book My FREE Consultation <ArrowRight className="ml-1 h-5 w-5" /></Link></Button>
              </div>

              <p className="mt-5 text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto">
                <strong>Important:</strong> This report is generated automatically based on the information you entered and should not be considered a final eligibility assessment or guarantee of visa approval. Actual eligibility depends on documentation, skills assessment, English results, employment verification, occupation availability, state nomination criteria and Australian Government policy, which may change without notice.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AustraliaAIAssessment;
