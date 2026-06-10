
import React, { useState } from 'react';
import { CheckCircle, Send, Upload, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitLead } from '@/lib/leads';

const EMPTY = {
  fullName: '', age: '', email: '', phone: '',
  maritalStatus: '', qualification: '', occupation: '',
  interestedCountry: '', linkedinUrl: '',
};

const selectClass =
  'w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring';

/**
 * Simplified popup/modal form (8 core fields + optional CV upload or LinkedIn URL).
 * Full form (LeadForm) is used on dedicated pages (Assessment, Contact, etc.)
 */
function PopupLeadForm({ source = 'Popup', onSuccess }) {
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
      setCvError('Only PDF, DOC, DOCX, JPG or PNG accepted.');
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
      formName: source || 'Popup form',
      fields: {
        ...data,
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
      <div className="text-center py-6">
        <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-7 w-7 text-accent" />
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">Thank you — we'll be in touch!</h3>
        <p className="text-sm text-muted-foreground">
          Our experts will review your profile and contact you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Honeypot */}
      <input type="text" tabIndex="-1" autoComplete="off" value={website}
        onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" />

      {/* Row 1: Name + Age */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="plf-name">Full Name *</Label>
          <Input id="plf-name" required value={data.fullName}
            onChange={(e) => set('fullName', e.target.value)} className="text-gray-900" />
        </div>
        <div>
          <Label htmlFor="plf-age">Age *</Label>
          <Input id="plf-age" type="number" min="18" max="80" required value={data.age}
            onChange={(e) => set('age', e.target.value)} className="text-gray-900" />
        </div>
      </div>

      {/* Row 2: Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="plf-email">Email Address *</Label>
          <Input id="plf-email" type="email" required value={data.email}
            onChange={(e) => set('email', e.target.value)} className="text-gray-900" />
        </div>
        <div>
          <Label htmlFor="plf-phone">Phone Number *</Label>
          <Input id="plf-phone" type="tel" required value={data.phone}
            onChange={(e) => set('phone', e.target.value)} className="text-gray-900" />
        </div>
      </div>

      {/* Row 3: Marital Status + Qualification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="plf-marital">Marital Status *</Label>
          <select id="plf-marital" required value={data.maritalStatus}
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
        <div>
          <Label htmlFor="plf-qual">Highest Qualification *</Label>
          <select id="plf-qual" required value={data.qualification}
            onChange={(e) => set('qualification', e.target.value)} className={selectClass}>
            <option value="">Select…</option>
            <option>High School / Secondary</option>
            <option>Diploma / Certificate</option>
            <option>Bachelor's Degree</option>
            <option>Master's Degree</option>
            <option>PhD / Doctorate</option>
            <option>Trade / Vocational</option>
          </select>
        </div>
      </div>

      {/* Row 4: Occupation + Interested Country */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="plf-occ">Occupation *</Label>
          <Input id="plf-occ" required value={data.occupation}
            placeholder="e.g. Engineer, Accountant"
            onChange={(e) => set('occupation', e.target.value)} className="text-gray-900" />
        </div>
        <div>
          <Label htmlFor="plf-country">Interested Country *</Label>
          <select id="plf-country" required value={data.interestedCountry}
            onChange={(e) => set('interestedCountry', e.target.value)} className={selectClass}>
            <option value="">Select…</option>
            <option>Canada</option>
            <option>Australia</option>
            <option>Both</option>
          </select>
        </div>
      </div>

      {/* CV Upload OR LinkedIn URL */}
      <div className="rounded-xl border border-border bg-muted/50 p-3 space-y-3">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide">
          Optional — Speed up your assessment
        </p>

        {/* CV Upload */}
        <div>
          <Label htmlFor="plf-cv" className="flex items-center gap-1.5 mb-1">
            <Upload className="h-3.5 w-3.5 text-accent" />
            Upload CV / Resume
            <span className="text-muted-foreground font-normal">(PDF/DOC/DOCX, max 5 MB)</span>
          </Label>
          <div className="flex items-center gap-2">
            <label htmlFor="plf-cv"
              className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border border-input bg-background hover:bg-muted text-xs font-medium transition-colors">
              <Upload className="h-3.5 w-3.5" />
              {cvFile ? cvFile.name : 'Choose file…'}
            </label>
            <input id="plf-cv" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={handleCvChange} />
            {cvFile && (
              <button type="button" onClick={() => setCvFile(null)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                Remove
              </button>
            )}
          </div>
          {cvError && <p className="text-destructive text-xs mt-1">{cvError}</p>}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* LinkedIn URL */}
        <div>
          <Label htmlFor="plf-linkedin" className="flex items-center gap-1.5 mb-1">
            <Linkedin className="h-3.5 w-3.5 text-accent" />
            LinkedIn Profile URL
          </Label>
          <Input
            id="plf-linkedin"
            type="url"
            value={data.linkedinUrl}
            onChange={(e) => set('linkedinUrl', e.target.value)}
            placeholder="https://www.linkedin.com/in/your-profile"
            className="text-gray-900 text-sm"
          />
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-muted p-2.5 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Privacy:</strong> Your details are secure and confidential. We'll only use them to
          assess your eligibility and provide personalised guidance.
        </p>
      </div>

      <Button type="submit" size="lg" variant="cta" className="w-full" disabled={submitting}>
        {submitting
          ? 'Submitting…'
          : (<><Send className="mr-1 h-4 w-4" /> Get My Free Eligibility Check</>)}
      </Button>
    </form>
  );
}

export default PopupLeadForm;
