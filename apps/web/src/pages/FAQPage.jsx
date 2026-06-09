import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Search, Printer, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useFaqs } from '@/lib/faqStore';
import { useLeadForm } from '@/components/LeadFormModal.jsx';

function FAQPage() {
  const faqCategories = useFaqs();
  const { openLeadForm } = useLeadForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(faqCategories[0].id);

  const query = searchQuery.trim().toLowerCase();

  // FAQPage structured data across every question (placed in <head> via Helmet).
  const faqSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqCategories.flatMap((cat) =>
        cat.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        }))
      ),
    }),
    [faqCategories]
  );

  // When searching, flatten matches across all categories; otherwise show active category.
  const searchResults = useMemo(() => {
    if (!query) return [];
    return faqCategories.flatMap((cat) =>
      cat.faqs
        .filter(
          (f) =>
            f.q.toLowerCase().includes(query) || f.a.toLowerCase().includes(query)
        )
        .map((f) => ({ ...f, category: cat.name }))
    );
  }, [query, faqCategories]);

  const activeCat = faqCategories.find((c) => c.id === activeCategory) || faqCategories[0];
  const visibleFaqs = query ? searchResults : activeCat.faqs;

  const handlePrint = () => window.print();

  const renderAnswer = (faq, idx) => (
    <AccordionItem
      key={idx}
      value={`faq-${idx}`}
      className="bg-card border border-border rounded-xl px-6 shadow-sm"
    >
      <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline hover:text-primary py-4">
        {faq.q}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
        {query && faq.category && (
          <span className="inline-block mb-2 text-xs font-semibold uppercase tracking-wide text-accent">
            {faq.category}
          </span>
        )}
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
  );

  return (
    <>
      <Helmet>
        <title>Immigration FAQs | Canada &amp; Australia Visas — iMigrate Migration Solutions</title>
        <meta
          name="description"
          content="Answers to the most common Canada and Australia immigration questions — Express Entry, PNP, work permits, C11, Subclass 189/190/491, skills assessment, PR, costs, processing times and visa refusals. Get a free assessment from an expert immigration consultant."
        />
        <meta
          name="keywords"
          content="immigration FAQ, Canada immigration consultant, Canada Work Permit, Canada PR, Express Entry, C11 Work Permit, Australia Skilled Migration, Australia PR, Subclass 189, Subclass 190, Subclass 491, visa assessment, skilled worker visa, business immigration"
        />
        <link rel="canonical" href="https://www.imigratesolution.com/faq" />
        <meta property="og:title" content="Immigration FAQs — Canada & Australia Visas | iMigrate Migration Solutions" />
        <meta property="og:description" content="Expert answers on Canada and Australia immigration: Express Entry, PNP, Subclass 189/190/491, costs, processing times and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.imigratesolution.com/faq" />
        <meta property="og:image" content="https://www.imigratesolution.com/images/imigrate-logo.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.imigratesolution.com/images/imigrate-logo.jpg" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />
      <StickyConsultationButton />

      <main className="bg-background min-h-screen pb-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-20 overflow-hidden print:hidden">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop"
              alt="Professional immigration advice and FAQs"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-primary/80" />
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="heading-display mb-6">Immigration FAQs</h1>
              <p className="text-xl opacity-90 mb-8">
                Clear, expert answers to the most common questions about migrating to Canada and Australia.
              </p>
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search e.g. Express Entry, Subclass 189, costs…"
                  className="pl-12 py-6 text-lg bg-background text-foreground rounded-full shadow-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="section-spacing">
          <div className="container-custom max-w-6xl">
            <div className="flex justify-end mb-6 print:hidden">
              <Button variant="outline" onClick={handlePrint} className="flex items-center">
                <Printer className="h-4 w-4 mr-2" /> Print FAQs
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              {/* Categories sidebar (hidden while searching) */}
              {!query && (
                <div className="md:col-span-4 print:hidden">
                  <div className="sticky top-28 space-y-2">
                    {faqCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                          activeCategory === cat.id
                            ? 'bg-primary text-primary-foreground font-medium shadow-md'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {cat.name}
                        <span className="ml-2 text-xs opacity-70">({cat.faqs.length})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ content */}
              <div className={query ? 'md:col-span-12' : 'md:col-span-8'}>
                <h2 className="text-2xl font-bold mb-6 text-primary">
                  {query ? `Search results (${visibleFaqs.length})` : activeCat.name}
                </h2>

                {visibleFaqs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {visibleFaqs.map((faq, idx) => renderAnswer(faq, idx))}
                  </Accordion>
                ) : (
                  <div className="text-center py-12 bg-muted/30 rounded-2xl border border-border">
                    <h3 className="text-xl font-semibold mb-2">No questions found</h3>
                    <p className="text-muted-foreground">
                      We couldn't find any FAQs matching your search. Try a different term, or just ask us directly.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => setSearchQuery('')}>
                      Clear search
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container-custom max-w-4xl print:hidden">
          <div className="bg-primary text-primary-foreground rounded-3xl p-10 text-center shadow-xl">
            <div className="gold-rule mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Our immigration consultants are ready to give you personalized answers for your specific situation —
              with a free, no-obligation assessment.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="cta" onClick={() => openLeadForm('FAQ page — Free Eligibility Check')}>Free Eligibility Check</Button>
              <Button size="lg" variant="cta" onClick={() => openLeadForm('FAQ page — Book Free Consultation')}>Book Free Consultation</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default FAQPage;
