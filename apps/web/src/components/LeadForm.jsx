
import React, { useState } from 'react';
import { CheckCircle, Send, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitLead } from '@/lib/leads';
import LegalDisclaimer from '@/components/LegalDisclaimer.jsx';

const EMPTY = {
  fullName: '', email: '', phone: '', citizenship: '', residence: '',
  maritalStatus: '', destination: '', occupation: '', education: '',
  experience: '', investment: '', program: '', message: '', linkedinUrl: '',
};

const selectClass =
  'w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring';

/**
 * Full lead-capture form — used on Assessment, Contact, Book Appointment,
 * Australia enquiry, and Canada enquiry sections.
 */
function LeadForm({ source = 'Website', onSuccess }) {
  const [data, setData] = useState(EMPTY);
  const [cvFile, setCvFile] = useState(null);
  const [cvError, setCvError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot

  const set = (k, v) => setData((p) => ({ ...p, [k]: v }));

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    setCvError('');
    if (!file) { setCvFile(null); return; }
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];
    if (!allowed.includes(file.type)) {
      setCvError('Only PDF, DOC, DOCX, JPG or PNG files are accepted.');
      setCvFile(null); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError('File must be under 5 MB.');
      setCvFile(null); return;
    }
    setCvFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (website) { setSubmitted(true); return; }
    setSubmitting(true);

    let cvStored = '';
    let cvOriginal = '';
    if (cvFile) {
      try {
        const fd = new FormData();
        fd.append('cv', cvFile);
        const res = await fetch('/lead-upload.php', { method: 'POST', body: fd });
        if (res.ok) {
          const json = await res.json();
          cvStored = json.file || '';
          cvOriginal = json.original || cvFile.name || '';
        }
      } catch (_) { /* non-fatal */ }
    }

    await submitLead({
      formName: source || 'Lead form',
      fields: {
        ...data,
        // Stored filename + original name so the CRM can link, view and download the CV.
        cvFile: cvStored,
        cvOriginalName: cvOriginal,
        cvFilename: cvStored, // back-compat
        sourcePage: typeof window !== 'undefined' ? window.location.pathname : '',
      },
    });

    setSubmitting(false);
    setSubmitted(true);
    if (onSuccess) onSuccess();
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-accent" />
        </div>
        <h3 className="text-xl font-semibold text-primary mb-2">Thank you — we've received your details</h3>
        <p className="text-muted-foreground">
          Our immigration experts will review your profile and contact you within 24 hours with personalised recommendations.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot */}
      <input type="text" tabIndex="-1" autoComplete="off" value={website}
        onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lf-name">Full Name *</Label>
          <Input id="lf-name" required value={data.fullName}
            onChange={(e) => set('fullName', e.target.value)} className="text-gray-900" />
        </div>
        <div>
          <Label htmlFor="lf-email">Email Address *</Label>
          <Input id="lf-email" type="email" required value={data.email}
            onChange={(e) => set('email', e.target.value)} className="text-gray-900" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lf-phone">Phone Number *</Label>
          <Input id="lf-phone" type="tel" required value={data.phone}
            onChange={(e) => set('phone', e.target.value)} className="text-gray-900" />
        </div>
        <div>
          <Label htmlFor="lf-citizenship">Nationality / Citizenship *</Label>
          <Input id="lf-citizenship" required value={data.citizenship}
            placeholder="e.g. Indian, Malaysian, Singaporean"
            onChange={(e) => set('citizenship', e.target.value)} className="text-gray-900" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lf-residence">Country of Residence *</Label>
          <Input id="lf-residence" required value={data.residence}
            placeholder="e.g. Malaysia, India, Singapore"
            onChange={(e) => set('residence', e.target.value)} className="text-gray-900" />
        </div>
        <div>
          <Label htmlFor="lf-marital">Marital Status</Label>
          <select id="lf-marital" value={data.maritalStatus}
            onChange={(e) => set('maritalStatus', e.target.value)} className={selectClass}>
            <option value="">Select…</option>
            <option>Single</option>
            <option>Married</option>
            <option>Divorced</option>
            <option>Widowed</option>
            <option>Separated</option>
            <option>Common-law / De Facto Partner</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lf-dest">Interested Destination *</Label>
          <select id="lf-dest" required value={data.destination}
            onChange={(e) => set('destination', e.target.value)} className={selectClass}>
            <option value="">Select…</option>
            <option>Canada</option>
            <option>Australia</option>
            <option>Both</option>
          </select>
        </div>
        <div>
          <Label htmlFor="lf-occ">Occupation *</Label>
          <Input id="lf-occ" required value={data.occupation}
            placeholder="e.g. Software Engineer, Accountant"
            onChange={(e) => set('occupation', e.target.value)} className="text-gray-900" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lf-edu">Education Level</Label>
          <select id="lf-edu" value={data.education}
            onChange={(e) => set('education', e.target.value)} className={selectClass}>
            <option value="">Select…</option>
            <option>High School / Secondary</option>
            <option>Diploma / Certificate</option>
            <option>Bachelor's Degree</option>
            <option>Master's Degree</option>
            <option>PhD / Doctorate</option>
            <option>Trade / Vocational</option>
          </select>
        </div>
        <div>
          <Label htmlFor="lf-exp">Years of Work Experience</Label>
          <select id="lf-exp" value={data.experience}
            onChange={(e) => set('experience', e.target.value)} className={selectClass}>
            <option value="">Select…</option>
            <option>Less than 1 year</option>
            <option>1–3 years</option>
            <option>3–5 years</option>
            <option>5–10 years</option>
            <option>10+ years</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lf-invest">Investment Budget (business visas)</Label>
          <select id="lf-invest" value={data.investment}
            onChange={(e) => set('investment', e.target.value)} className={selectClass}>
            <option value="">Not applicable</option>
            <option>Under USD 50,000</option>
            <option>USD 50,000 – 100,000</option>
            <option>USD 100,000 – 250,000</option>
            <option>USD 250,000 – 500,000</option>
            <option>USD 500,000+</option>
          </select>
        </div>
        <div>
          <Label htmlFor="lf-prog">Program of Interest</Label>
          <select id="lf-prog" value={data.program}
            onChange={(e) => set('program', e.target.value)} className={selectClass}>
            <option value="">Not sure — advise me</option>
            <option>Express Entry (Canada)</option>
            <option>Provincial Nominee Program (Canada)</option>
            <option>C11 Entrepreneur Work Permit (Canada)</option>
            <option>Study Permit (Canada)</option>
            <option>Family Sponsorship (Canada)</option>
            <option>Skilled Independent 189 (Australia)</option>
            <option>State Nominated 190 (Australia)</option>
            <option>Subclass 491 (Australia)</option>
            <option>Employer Sponsored 186 (Australia)</option>
            <option>Business / Investor Visa</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="lf-msg">Additional Information</Label>
        <Textarea id="lf-msg" rows={3} value={data.message}
          placeholder="Tell us anything else relevant to your immigration goals…"
          onChange={(e) => set('message', e.target.value)} className="text-gray-900" />
      </div>

      {/* LinkedIn URL */}
      <div>
        <Label htmlFor="lf-linkedin">LinkedIn Profile URL (optional)</Label>
        <Input
          id="lf-linkedin"
          type="url"
          value={data.linkedinUrl}
          onChange={(e) => set('linkedinUrl', e.target.value)}
          placeholder="https://www.linkedin.com/in/your-profile"
          className="text-gray-900"
        />
        <p className="text-xs text-muted-foreground mt-1">Share your LinkedIn profile as an alternative to a CV upload.</p>
      </div>

      {/* CV Upload */}
      <div>
        <Label htmlFor="lf-cv">Upload CV / Resume (optional — PDF/DOC/DOCX, max 5 MB)</Label>
        <div className="flex items-center gap-3 mt-1">
          <label htmlFor="lf-cv"
            className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-input bg-muted hover:bg-muted/80 text-sm font-medium transition-colors">
            <Upload className="h-4 w-4" />
            {cvFile ? cvFile.name : 'Choose file…'}
          </label>
          <input id="lf-cv" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={handleCvChange} />
          {cvFile && (
            <button type="button" onClick={() => setCvFile(null)}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors">
              Remove
            </button>
          )}
        </div>
        {cvError && <p className="text-destructive text-xs mt-1">{cvError}</p>}
      </div>

      <div className="bg-muted p-3 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Privacy Guarantee:</strong> Your information is completely secure and confidential.
          We use it only to assess your eligibility and provide personalised recommendations.
          We never share your data with third parties.
        </p>
      </div>

      <Button type="submit" size="lg" variant="cta" className="w-full" disabled={submitting}>
        {submitting
          ? 'Submitting…'
          : (<><Send className="mr-1 h-5 w-5" /> Submit &amp; Get Free Eligibility Check</>)}
      </Button>
      <LegalDisclaimer variant="form" className="mt-3" />
    </form>
  );
}

export default LeadForm;
