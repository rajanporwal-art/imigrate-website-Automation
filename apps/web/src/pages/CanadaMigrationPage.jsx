import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ClipboardCheck,
  Calendar,
  Calculator,
  ShieldCheck,
  Award,
  Globe2,
  Send,
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import VisaCategorySection from '@/components/VisaCategorySection.jsx';
import FaqTeaser from '@/components/FaqTeaser.jsx';
import LeadForm from '@/components/LeadForm.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { canadaVisas } from '@/data/canadaVisas';
import { useSiteContent } from '@/lib/siteContent.jsx';
import { useLeadForm } from '@/components/LeadFormModal.jsx';

function CanadaMigrationPage() {
  const { contact, canada } = useSiteContent();
  const { openLeadForm } = useLeadForm();

  return (
    <>
      <Helmet>
        <title>Canada Immigration & PR Visas | Express Entry, PNP, Work Permits — iMigrate Solutions</title>
        <meta
          name="description"
          content="Expert Canada immigration and PR visa services. Express Entry skilled migration, Provincial Nominee Program (PNP), work permits, study permits, family sponsorship, business & start-up visa and Atlantic pathways. Free assessment available."
        />
        <meta
          name="keywords"
          content="Canada Immigration, Canada PR Visa, Canada Express Entry, Provincial Nominee Program, Canada PNP, Canada Work Permit, Canada Study Permit, Canada Spousal Sponsorship, Canada Start-up Visa, Canada immigration consultant, CRS calculator"
        />
        <link rel="canonical" href="https://www.imigratesolution.com/canada-immigration" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.imigratesolution.com/" },
            { "@type": "ListItem", "position": 2, "name": "Canada Immigration", "item": "https://www.imigratesolution.com/canada-immigration" }
          ]
        })}</script>
        <meta property="og:title" content="Canada Immigration & PR Visa Services | iMigrate Solutions" />
        <meta
          property="og:description"
          content="Detailed guidance on every Canadian immigration pathway — Express Entry, PNP, work and study permits, family sponsorship, business and regional programs. Check your eligibility with a free assessment."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.imigratesolution.com/canada-immigration" />
        <meta property="og:image" content="https://www.imigratesolution.com/images/ca-toronto-hero.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.imigratesolution.com/images/ca-toronto-hero.jpg" />
      </Helmet>

      <Header />
      <StickyConsultationButton />

      <main>
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src="/images/ca-toronto-hero.jpg"
              alt="Toronto skyline at sunset representing immigration to Canada"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/80" />
          <div className="container-custom relative z-10 section-spacing">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <div className="gold-rule mb-5" />
              <h1 className="heading-display text-balance mb-6">
                <span className="mr-3" role="img" aria-label="Flag of Canada">🇨🇦</span>
                {canada.heroTitle}
              </h1>
              <p className="text-xl leading-relaxed mb-8 opacity-90">
                {canada.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="cta" className="text-lg px-8 py-6" onClick={() => openLeadForm('Canada hero — Free Assessment')}>
                  <ClipboardCheck className="mr-1 h-5 w-5" />
                  Free Eligibility Check
                </Button>
                <Button size="lg" variant="cta" className="text-lg px-8 py-6" onClick={() => openLeadForm('Canada hero — Book Consultation')}>
                  <Calendar className="mr-1 h-5 w-5" />
                  Book Free Consultation
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-colors"
                >
                  <Link to="/assessment#calculator">
                    <Calculator className="mr-1 h-5 w-5" />
                    CRS Calculator
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-10 gap-y-4 mt-12">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-accent" />
                  <span className="text-sm opacity-90">Trusted visa &amp; migration experts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-accent" />
                  <span className="text-sm opacity-90">98.6% success rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe2 className="h-6 w-6 text-accent" />
                  <span className="text-sm opacity-90">20+ countries served</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick navigation / Table of contents */}
        <section className="bg-card border-b border-border sticky top-20 z-30 hidden md:block">
          <div className="container-custom">
            <nav className="flex flex-wrap gap-x-6 gap-y-2 py-4 text-sm font-medium">
              {canadaVisas.map((visa) => (
                <a
                  key={visa.id}
                  href={`#${visa.id}`}
                  className="text-muted-foreground hover:text-cta transition-colors"
                >
                  {visa.badge}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {/* Intro */}
        <section className="section-spacing bg-background">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="heading-section text-balance mb-4 text-primary">
                {canada.introHeading}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {canada.introText}
              </p>
            </motion.div>

            {/* Visual highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
              {[
                { src: '/images/ca-toronto-cntower.jpg', alt: 'Toronto skyline and CN Tower — life in a world-class Canadian city', caption: 'World-class cities' },
                { src: '/images/ca-banff-lake.jpg', alt: 'Moraine Lake in Banff National Park — Canada\'s natural beauty', caption: 'Breathtaking nature' },
                { src: '/images/ca-vancouver.jpg', alt: 'Vancouver harbour skyline — build your future in Canada', caption: 'A new life in Canada' },
              ].map((img) => (
                <motion.figure
                  key={img.src}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="relative overflow-hidden rounded-2xl shadow-lg group"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/90 to-transparent text-primary-foreground text-sm font-medium px-4 py-3">
                    {img.caption}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>

        {/* Visa category sections */}
        {canadaVisas.map((visa, index) => (
          <VisaCategorySection key={visa.id} visa={visa} index={index} />
        ))}

        {/* Canada FAQs */}
        <FaqTeaser
          categoryId="canada"
          count={6}
          heading="Canada immigration — frequently asked questions"
          subheading="Common questions about Express Entry, PNP, work permits and Canadian PR."
        />

        {/* Contact form */}
        <section id="contact" className="section-spacing bg-muted scroll-mt-24">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="gold-rule mb-4" />
                <h2 className="heading-section text-balance mb-4 text-primary">
                  Speak to a Canada immigration expert
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Have a question about Canadian immigration or your PR options? Send us a message and our
                  experienced consultants will respond within 24 hours — or reach us instantly on WhatsApp.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" variant="cta" onClick={() => openLeadForm('Canada contact — Free Eligibility Check')}>
                    <ClipboardCheck className="mr-1 h-5 w-5" />
                    Free Eligibility Check
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="bg-[#25D366] text-white hover:bg-[#1fb457] shadow-md hover:shadow-lg"
                  >
                    <a
                      href={`https://wa.me/${contact.whatsapp}?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20Canada%20immigration`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Chat on WhatsApp
                    </a>
                  </Button>
                </div>
              </motion.div>

              <Card className="shadow-xl border-border/50">
                <CardContent className="pt-8">
                  <LeadForm source="Canada page — enquiry form" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default CanadaMigrationPage;
