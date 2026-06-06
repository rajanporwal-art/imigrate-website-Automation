import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ListChecks, Sparkles } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import CTABanner from '@/components/CTABanner.jsx';

/**
 * Renders a complete, SEO-structured section for a single visa category:
 * Overview, detail blocks (Eligibility / Requirements / etc.), Benefits grid,
 * Key Requirements, Processing Overview, FAQ accordion and a CTA banner.
 */
function VisaCategorySection({ visa, index }) {
  const Icon = visa.icon;
  const altBg = index % 2 === 1;

  return (
    <section
      id={visa.id}
      className={`section-spacing scroll-mt-24 ${altBg ? 'bg-muted' : 'bg-background'}`}
    >
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center gap-5 mb-8">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Icon className="h-8 w-8 text-accent" />
            </div>
            <div>
              <span className="inline-block mb-2 px-3 py-1 rounded-full bg-accent/15 text-xs font-semibold uppercase tracking-wide text-foreground">
                {visa.badge}
              </span>
              <h2 className="heading-section text-balance text-primary">{visa.title}</h2>
              <p className="text-muted-foreground mt-1">{visa.tagline}</p>
            </div>
          </div>

          {/* Overview */}
          <div className="mb-10 max-w-4xl">
            <h3 className="text-lg font-semibold mb-2 text-primary">Overview</h3>
            <p className="body-text max-w-none text-muted-foreground">{visa.overview}</p>
          </div>

          {/* Detail blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {visa.details.map((block) => (
              <Card key={block.heading} className="border-border/60 shadow-sm h-full">
                <CardContent className="pt-6">
                  <h3 className="text-base font-semibold mb-3 text-primary flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-accent shrink-0" />
                    {block.heading}
                  </h3>
                  <ul className="space-y-2">
                    {block.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits + Key Requirements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 rounded-2xl bg-primary text-primary-foreground p-8 shadow-lg">
              <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Benefits
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visa.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm opacity-90">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-2 border-accent/40 shadow-sm">
              <CardContent className="pt-6">
                <h3 className="text-base font-semibold mb-4 text-primary">Key Requirements</h3>
                <ul className="space-y-3">
                  {visa.keyRequirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <span className="text-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Processing Overview */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold mb-5 text-primary">Processing Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {visa.processing.map((step, i) => (
                <div key={i} className="relative rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-accent text-accent-foreground font-bold flex items-center justify-center mb-3">
                    {i + 1}
                  </div>
                  <h4 className="text-sm font-semibold text-primary mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ accordion */}
          <div className="mb-10 max-w-4xl">
            <h3 className="text-lg font-semibold mb-3 text-primary">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="rounded-xl border border-border bg-card px-5">
              {visa.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`${visa.id}-faq-${i}`}>
                  <AccordionTrigger className="text-base font-medium text-primary hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* CTA after every visa section */}
          <CTABanner
            heading={`Check your eligibility for the ${visa.badge}`}
            subheading="Get a free, no-obligation assessment of your profile or book a consultation with our experienced migration consultants."
          />
        </motion.div>
      </div>
    </section>
  );
}

export default VisaCategorySection;
