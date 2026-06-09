import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

/** Full legal disclaimer used on Privacy, Terms and (condensed) site-wide. */
export const DISCLAIMER_TEXT =
  "iMigrate Migration Solutions is not a law firm. iMigrate Migration Solutions cannot provide legal advice and can only provide immigration support and self-help services at your specific direction. The information provided on this website is for general informational purposes only and should not be considered legal advice. Creating an account, submitting an assessment, or contacting us does not establish an attorney-client relationship. Communications submitted through this website are protected by our Privacy Policy but are not protected by attorney-client privilege or work product doctrine. iMigrate Migration Solutions' immigration support services are not a substitute for the legal advice of a qualified immigration lawyer. iMigrate Migration Solutions and this website are not affiliated with, endorsed by, or connected to USCIS, the Australian Government, Immigration, Refugees and Citizenship Canada (IRCC), or any other government authority. Use of this website and its services is subject to our Privacy Policy and Terms of Use.";

/**
 * Renders the legal "not a law firm" disclaimer.
 * variant="full"   → boxed disclaimer (Privacy / Terms pages)
 * variant="form"   → one-line note for forms with links
 * variant="footer" → compact small-print for the footer
 */
function LegalDisclaimer({ variant = 'full', className = '' }) {
  if (variant === 'form') {
    return (
      <p className={`text-xs text-muted-foreground leading-relaxed ${className}`}>
        iMigrate Migration Solutions is not a law firm and does not provide legal advice. By submitting,
        you agree to our <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link> and{' '}
        <Link to="/terms" className="underline hover:text-primary">Terms of Use</Link>. Submissions are not
        protected by attorney-client privilege.
      </p>
    );
  }
  if (variant === 'footer') {
    return <p className={`text-[11px] leading-relaxed opacity-70 ${className}`}>{DISCLAIMER_TEXT}</p>;
  }
  return (
    <div className={`rounded-xl border border-amber-200 bg-amber-50 p-5 ${className}`}>
      <p className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" /> Important Disclaimer
      </p>
      <p className="text-sm text-amber-900/90 leading-relaxed">{DISCLAIMER_TEXT}</p>
    </div>
  );
}

export default LegalDisclaimer;
