import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ClipboardCheck, Calendar, GraduationCap, Award } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import VisaCategorySection from '@/components/VisaCategorySection.jsx';
import CTABanner from '@/components/CTABanner.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { australiaVisas } from '@/data/australiaVisas';
import { useLeadForm } from '@/components/LeadFormModal.jsx';

const CANONICAL = 'https://www.imigratesolution.com/australia-visas';

function AustraliaVisasPage() {
  const { openLeadForm } = useLeadForm();
  const visaList = australiaVisas.filter((v) => !v.pr);

  return (
    <>
      <Helmet>
        <title>Australia Visas | Student, Work, Employer Sponsored & Business Visas — iMigrate Migration Solutions</title>
        <meta
          name="description"
          content="Explore Australia's temporary and non-PR visas — Student Visa (Subclass 500), employer sponsored work visas (482/186/494) and business & investor migration. Compare pathways and check your eligibility with a free assessment."
        />
        <meta
          name="keywords"
          content="Australia visas, Australia Student Visa, Subclass 500, Australia employer sponsored visa, Subclass 482, Subclass 494, Australia work visa, Australia business visa, Australia investor visa, temporary visa Australia"
        />
        <link rel="canonical" href={CANONICAL} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.imigratesolution.com/' },
            { '@type': 'ListItem', position: 2, name: 'Australia Visas', item: CANONICAL },
          ],
        })}</script>
        <meta property="og:title" content="Australia Visas — Student, Work, Employer & Business | iMigrate Migration Solutions" />
        <meta property="og:description" content="Australia's student, employer sponsored and business visas explained — eligibility, requirements and pathways. Free assessment available." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:image" content="https://www.imigratesolution.com/images/au-koala-lifestyle.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.imigratesolution.com/images/au-koala-lifestyle.jpg" />
      </Helmet>

      <Header />
      <StickyConsultationButton />

      <main>
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src="/images/au-koala-lifestyle.jpg" alt="Australian lifestyle representing student, work and business visas" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/80" />
          <div className="container-custom relative z-10 section-spacing">
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
              <div className="gold-rule mb-5" />
              <nav aria-label="Breadcrumb" className="text-sm opacity-80 mb-3">
                <Link to="/" className="hover:text-accent">Home</Link> <span className="mx-1">/</span> Australia Visas
              </nav>
              <h1 className="heading-display text-balance mb-6">
                <span className="mr-3" role="img" aria-label="Flag of Australia">🇦🇺</span>
                Australia Visas — Student, Work &amp; Business Pathways
              </h1>
              <p className="text-xl leading-relaxed mb-8 opacity-90">
                Explore Australia's temporary and non-permanent visa options — from student and
                employer sponsored work visas to business and investor migration. Looking for
                permanent residence instead? See our{' '}
                <Link to="/australia-migration" className="underline font-semibold hover:text-accent">Australia PR &amp; skilled migration</Link> page.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="cta" className="text-lg px-8 py-6" onClick={() => openLeadForm('Australia Visas hero — Free Assessment')}>
                  <ClipboardCheck className="mr-1 h-5 w-5" /> Free Eligibility Check
                </Button>
                <Button size="lg" variant="cta" className="text-lg px-8 py-6" onClick={() => openLeadForm('Australia Visas hero — Book Consultation')}>
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
              <h2 className="heading-section text-balance mb-4 text-primary">Choose your Australian visa</h2>
              <p className="text-muted-foreground leading-relaxed">
                Select a visa category below to see eligibility, benefits, requirements and how to apply.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {visaList.map((visa) => (
                <a key={visa.id} href={`#${visa.id}`} className="group">
                  <Card className="h-full border-border/60 hover:border-accent hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent mb-3">
                        <GraduationCap className="h-4 w-4" /> {visa.badge}
                      </div>
                      <h3 className="font-semibold text-lg text-primary mb-2 group-hover:text-cta transition-colors">{visa.title}</h3>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-cta">
                        Learn more <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </a>
              ))}
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
                  <Award className="h-4 w-4" /> Planning to settle permanently?
                </div>
                <h2 className="text-xl font-bold text-primary">Explore Australia PR &amp; skilled migration</h2>
                <p className="text-muted-foreground text-sm mt-1">Subclass 189, 190 and 491, the points test, state nomination and the skilled occupation list.</p>
              </div>
              <Button asChild size="lg" variant="cta" className="shrink-0">
                <Link to="/australia-migration">Australia PR pathways <ArrowRight className="ml-1 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-spacing bg-background">
          <div className="container-custom max-w-4xl">
            <CTABanner
              stacked
              source="Australia Visas"
              heading="Not sure which Australian visa is right for you?"
              subheading="Get a free eligibility assessment or book a consultation with an experienced migration consultant."
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default AustraliaVisasPage;
