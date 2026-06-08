import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { useFaqs } from '@/lib/faqStore';

/**
 * "Popular questions" teaser block — shows a few FAQs from a chosen category
 * and links through to the full /faq page. Emits its own FAQ JSON-LD so the
 * questions can earn rich snippets on the page where the teaser appears.
 */
function FaqTeaser({
  categoryId = 'general',
  count = 5,
  heading = 'Frequently asked questions',
  subheading = 'Quick answers to questions we hear most often.',
}) {
  const faqCategories = useFaqs();

  const faqs = useMemo(() => {
    const cat =
      faqCategories.find((c) => c.id === categoryId) || faqCategories[0] || { faqs: [] };
    return (cat.faqs || []).slice(0, count);
  }, [faqCategories, categoryId, count]);

  const faqSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    }),
    [faqs]
  );

  if (!faqs.length) return null;

  return (
    <section className="section-spacing bg-background">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="gold-rule mx-auto mb-4" />
          <h2 className="heading-section text-balance mb-3 text-primary">{heading}</h2>
          <p className="text-lg text-muted-foreground">{subheading}</p>
        </motion.div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`teaser-${categoryId}-${i}`}
              className="bg-card border border-border rounded-xl px-6 shadow-sm"
            >
              <AccordionTrigger className="text-left font-semibold text-base md:text-lg hover:no-underline hover:text-primary py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                <p>{faq.a}</p>
                {faq.link && (
                  <Link
                    to={faq.link.to}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-cta hover:underline"
                  >
                    {faq.link.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-10">
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 font-semibold text-primary hover:text-cta transition-colors"
          >
            View all immigration FAQs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FaqTeaser;
