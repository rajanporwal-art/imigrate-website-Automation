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
  Users,
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
import { australiaVisas } from '@/data/australiaVisas';
import { useSiteContent } from '@/lib/siteContent.jsx';
import { useLeadForm } from '@/components/LeadFormModal.jsx';

function AustraliaMigrationPage() {
  const { contact, australia } = useSiteContent();
  const { openLeadForm } = useLeadForm();

  // FAQ structured data (JSON-LD) for rich results across all visa categories
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: australiaVisas.flatMap((visa) =>
      visa.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      }))
    ),
  };

  return (
    <>
      <Helmet>
        <title>Australia Skilled Migration & PR Visas | Subclass 189, 190, 491 — iMigrate Solutions</title>
        <meta
          name="description"
          content="Expert Australia skilled migration and PR visa services. Skilled Independent Visa 189, Skilled Nominated Visa 190, Skilled Work Regional Visa 491, employer sponsored, student, partner and business migration. Free assessment available."
        />
        <meta
          name="keywords"
          content="Australia Skilled Migration, Australia PR Visa, Skilled Independent Visa 189, Skilled Nominated Visa 190, Skilled Work Regional Visa 491, Australia Employer Sponsored Visa, Australia Student Visa, Australia Partner Visa, Australia Business Migration, Australia immigration consultant"
        />
        <link rel="canonical" href="https://imigratesolution.com/australia-migration" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://imigratesolution.com/" },
            { "@type": "ListItem", "position": 2, "name": "Australia Migration", "item": "https://imigratesolution.com/australia-migration" }
          ]
        })}</script>
        <meta property="og:title" content="Australia Skilled Migration & PR Visa Services | iMigrate Solutions" />
        <meta
          property="og:description"
          content="Detailed guidance on every Australian visa pathway — Subclass 189, 190, 491, employer sponsored, student, partner and business migration. Check your eligibility with a free assessment."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://imigratesolution.com/australia-migration" />
        <meta property="og:image" content="https://imigratesolution.com/images/au-melbourne-cityscape.avif" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://imigratesolution.com/images/au-melbourne-cityscape.avif" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />
      <StickyConsultationButton />

      <main>
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src="/images/au-melbourne-cityscape.avif"
              alt="Melbourne cityscape representing migration to Australia"
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
                <span className="mr-3" role="img" aria-label="Flag of Australia">🇦🇺</span>
                {australia.heroTitle}
              </h1>
              <p className="text-xl leading-relaxed mb-8 opacity-90">
                {australia.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="cta" className="text-lg px-8 py-6" onClick={() => openLeadForm('Australia hero — Free Assessment')}>
                  <ClipboardCheck className="mr-1 h-5 w-5" />
                  Free Eligibility Check
                </Button>
                <Button size="lg" variant="cta" className="text-lg px-8 py-6" onClick={() => openLeadForm('Australia hero — Book Consultation')}>
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
                    Points Calculator
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
                  <Users className="h-6 w-6 text-accent" />
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
              {australiaVisas.map((visa) => (
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
                {australia.introHeading}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {australia.introText}
              </p>
            </motion.div>

            {/* Visual highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
              {[
                { src: '/images/au-handshake-flag.jpg', alt: 'Professional handshake over the Australian flag — trusted migration partnership', caption: 'Trusted partnership' },
                { src: '/images/au-consultation-map.jpg', alt: 'Migration consultant discussing an Australia map with a client', caption: 'Expert consultation' },
                { src: '/images/au-koala-lifestyle.jpg', alt: 'New arrivals enjoying the Australian lifestyle', caption: 'A new life in Australia' },
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
        {australiaVisas.map((visa, index) => (
          <VisaCategorySection key={visa.id} visa={visa} index={index} />
        ))}

        {/* Australia FAQs */}
        <FaqTeaser
          categoryId="australia"
          count={6}
          heading="Australia immigration — frequently asked questions"
          subheading="Common questions about Australian skilled migration, PR and visa subclasses."
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
                  Speak to an Australia migration expert
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Have a question about Australian skilled migration or your PR options? Send us a message
                  and our experienced migration consultants will respond within 24 hours — or reach us
                  instantly on WhatsApp.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" variant="cta" onClick={() => openLeadForm('Australia contact — Free Eligibility Check')}>
                    <ClipboardCheck className="mr-1 h-5 w-5" />
                    Free Eligibility Check
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="bg-[#25D366] text-white hover:bg-[#1fb457] shadow-md hover:shadow-lg"
                  >
                    <a
                      href={`https://wa.me/${contact.whatsapp}?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20Australia%20migration`}
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
                  <LeadForm source="Australia page — enquiry form" />
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

export default AustraliaMigrationPage;
