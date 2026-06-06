import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLeadForm } from '@/components/LeadFormModal.jsx';

/**
 * Reusable conversion banner. Both CTAs open the single standardized lead form.
 */
function CTABanner({ heading = 'Ready to take the next step?', subheading, source = 'CTA banner', stacked = false }) {
  const { openLeadForm } = useLeadForm();
  // In narrow containers (e.g. a blog article column) keep the banner stacked so
  // the heading isn't squeezed by the side-by-side buttons. Wide containers use
  // the horizontal layout (default).
  const rowLayout = stacked ? '' : ' lg:flex-row lg:items-center lg:justify-between';
  return (
    <div className="rounded-2xl bg-primary text-primary-foreground p-8 md:p-10 shadow-xl overflow-hidden relative">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent/10" aria-hidden="true" />
      <div className={`relative z-10 flex flex-col${rowLayout} gap-6`}>
        <div className="max-w-2xl min-w-0">
          <div className="gold-rule mb-4" />
          <h3 className="text-2xl font-bold mb-2 text-balance">{heading}</h3>
          <p className="opacity-90 leading-relaxed">
            {subheading ||
              'Get a free eligibility assessment or book a one-on-one consultation with an experienced migration consultant today.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <Button asChild size="lg" variant="cta" className="text-base px-7 py-6">
            <Link to="/assessment">
              <ClipboardCheck className="mr-1 h-5 w-5" />
              Free Eligibility Check
            </Link>
          </Button>
          <Button size="lg" variant="cta" className="text-base px-7 py-6" onClick={() => openLeadForm(`${source} — Book Consultation`)}>
            <Calendar className="mr-1 h-5 w-5" />
            Book Free Consultation
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => openLeadForm(`${source} — Speak to an expert`)}
        className="relative z-10 mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
      >
        Or speak to an expert
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default CTABanner;
