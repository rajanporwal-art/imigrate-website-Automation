import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ClipboardCheck, Calendar, Briefcase, Award } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import VisaCategorySection from '@/components/VisaCategorySection.jsx';
import CTABanner from '@/components/CTABanner.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useVisas } from '@/lib/visaStore';
import { useLeadForm } from '@/components/LeadFormModal.jsx';

const CANONICAL = 'https://www.imigratesolution.com/canada-visas';

function CanadaVisasPage() {
  const { openLeadForm } = useLeadForm();
  const canadaVisas = useVisas('canada');
  const visaList = canadaVisas.filter((v) => !v.pr);

  return (
    <>
      <Helmet>
        <title>Canada Visas | Work Permits, Study Permits & Temporary Pathways — iMigrate Migration Solutions</title>
        <meta
          name="description"
          content="Explore Canada's temporary and non-PR visas — work permits (including LMIA), study permits and other temporary resident pathways. Compare options and check your eligibility with a free assessment."
        />
        <meta
          name="keywords"
          content="Canada visas, Canada work permit, LMIA work permit, Canada study permit, Canada temporary resident visa, Canada visitor visa, work in Canada, study in Canada"
        />
        <link rel="canonical" href={CANONICAL} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.imigratesolution.com/' },
            { '@type': 'ListItem', position: 2, name: 'Canada Visas', item: CANONICAL },
          ],
        })}</script>
        <meta property="og:title" content="Canada Visas — Work Permits, Study Permits & Temporary Pathways | iMigrate Migration Solutions" />
        <meta property="og:description" content="Canada's work permits, study permits and temporary resident pathways explained — eligibility, requirements and how each can lead to PR. Free assessment available." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:image" content="https://www.imigratesolution.com/images/ca-vancouver.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.imigratesolution.com/images/ca-vancouver.jpg" />
      </Helmet>

      <Header />
      <StickyConsultationButton />

      <main>
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src="/images/ca-vancouver.jpg" alt="Vancouver skyline representing Canada work and study visas" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/80" />
          <div className="container-custom relative z-10 section-spacing">
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
              <div className="gold-rule mb-5" />
              <nav aria-label="Breadcrumb" className="text-sm opacity-80 mb-3">
                <Link to="/" className="hover:text-accent">Home</Link> <span className="mx-1">/</span> Canada Visas
              </nav>
              <h1 className="heading-display text-balance mb-6">
                <span className="mr-3" role="img" aria-label="Flag of Canada">🇨🇦</span>
                Canada Visas — Work, Study &amp; Temporary Pathways
              </h1>
              <p className="text-xl leading-relaxed mb-8 opacity-90">
                Explore Canada's temporary and non-permanent visa options — work permits, study
                permits and temporary resident pathways. Looking for permanent residence instead?
                See our{' '}
                <Link to="/canada-immigration" className="underline font-semibold hover:text-accent">Canada PR pathways</Link> page.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="cta" className="text-lg px-8 py-6" onClick={() => openLeadForm('Canada Visas hero — Free Assessment')}>
                  <ClipboardCheck className="mr-1 h-5 w-5" /> Free Eligibility Check
                </Button>
                <Button size="lg" variant="cta" className="text-lg px-8 py-6" onClick={() => openLeadForm('Canada Visas hero — Book Consultation')}>
                  <Calendar className="mr-1 h-5 w-5" /> Book Free Consultation
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Cards overview */}
        <section className="section-spacing bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="heading-section text-balance mb-4 text-primary">Choose your Canadian visa</h2>
              <p className="text-muted-foreground leading-relaxed">
                Select a visa category below to see eligibility, benefits, requirements and how each
                can become a pathway to permanent residence.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {visaList.map((visa) => (
                <a key={visa.id} href={`#${visa.id}`} className="group">
                  <Card className="h-full border-border/60 hover:border-accent hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent mb-3">
                        <Briefcase className="h-4 w-4" /> {visa.badge}
                      </div>
                      <h3 className="font-semibold text-lg text-primary mb-2 group-hover:text-cta transition-colors">{visa.title}</h3>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-cta">
                        Learn more <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </a>
              ))}
              {/* C11 entrepreneur work permit links to its dedicated page */}
              <Link to="/c11-entrepreneur-work-permit" className="group">
                <Card className="h-full border-border/60 hover:border-accent hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent mb-3">
                      <Briefcase className="h-4 w-4" /> C11 Work Permit
                    </div>
                    <h3 className="font-semibold text-lg text-primary mb-2 group-hover:text-cta transition-colors">C11 Entrepreneur Work Permit</h3>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-cta">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Visa category sections */}
        {visaList.map((visa, index) => (
          <VisaCategorySection key={visa.id} visa={visa} index={index} />
        ))}

        {/* Cross-link to PR */}
        <section className="section-spacing bg-muted">
          <div className="container-custom max-w-4xl">
            <div className="rounded-2xl border border-border bg-background p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-accent font-semibold text-sm mb-1">
                  <Award className="h-4 w-4" /> Aiming for permanent residence?
                </div>
                <h2 className="text-xl font-bold text-primary">Explore Canada PR pathways</h2>
                <p className="text-muted-foreground text-sm mt-1">Express Entry, Provincial Nominee Programs, family sponsorship, Start-up Visa and Atlantic programs.</p>
              </div>
              <Button asChild size="lg" variant="cta" className="shrink-0">
                <Link to="/canada-immigration">Canada PR pathways <ArrowRight className="ml-1 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-spacing bg-background">
          <div className="container-custom max-w-4xl">
            <CTABanner
              stacked
              source="Canada Visas"
              heading="Not sure which Canadian visa is right for you?"
              subheading="Get a free eligibility assessment or book a consultation with an experienced immigration consultant."
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default CanadaVisasPage;
