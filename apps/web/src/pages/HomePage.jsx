
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, Award, Shield, Globe, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import BenefitCard from '@/components/BenefitCard.jsx';
import TrustHighlights from '@/components/TrustHighlights.jsx';
import FaqTeaser from '@/components/FaqTeaser.jsx';
import ServiceCard from '@/components/ServiceCard.jsx';
import TestimonialCard from '@/components/TestimonialCard.jsx';
import LeadGenerationModal from '@/components/LeadGenerationModal.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import { Button } from '@/components/ui/button';
import { useSiteContent } from '@/lib/siteContent.jsx';
import { useLeadForm } from '@/components/LeadFormModal.jsx';

function HomePage() {
  const { stats, home } = useSiteContent();
  const { openLeadForm } = useLeadForm();

  const benefits = [
    {
      icon: Users,
      title: 'Specialists in Asian applicant profiles',
      description: 'Deep expertise helping professionals, entrepreneurs, and families from Malaysia, Singapore, India and Vietnam navigate Australian and Canadian immigration.',
    },
    {
      icon: Award,
      title: '98.6% success rate',
      description: 'Our track record speaks for itself. 98.6% of our clients receive positive outcomes — backed by our 100% money-back guarantee.',
    },
    {
      icon: Shield,
      title: 'Zero hidden fees',
      description: 'Transparent, fixed pricing agreed upfront. No surprises. Pay as you go — spread the cost across your immigration journey.',
    },
    {
      icon: Globe,
      title: 'End-to-end case management',
      description: 'A dedicated consultant manages your case from free eligibility check to visa grant — and beyond.',
    },
    {
      icon: TrendingUp,
      title: 'C11, Express Entry & skilled migration experts',
      description: 'Specialists in Canada C11 Entrepreneur Work Permit, Express Entry, PNP and Australia skilled migration pathways.',
    },
  ];

  const services = [
    {
      icon: Globe,
      title: '🇦🇺 Australian skilled migration',
      description: 'Navigate the points-based system with expert guidance for skilled independent and state-nominated visas.',
      link: '/australia-migration',
    },
    {
      icon: Globe,
      title: '🇨🇦 Canadian skilled migration',
      description: 'Maximize your Express Entry score and explore provincial nominee programs for faster processing.',
      link: '/canada-immigration',
    },
    {
      icon: Users,
      title: 'Student visas',
      description: 'Study in world-class institutions while building a pathway to permanent residence.',
      link: '/services#student',
    },
    {
      icon: Shield,
      title: 'Partner & family visas',
      description: 'Reunite with your loved ones through spouse, partner, parent, and child visa programs.',
      link: '/services#family',
    },
    {
      icon: TrendingUp,
      title: 'Business & investor visas',
      description: 'Establish or invest in businesses while securing your immigration status.',
      link: '/services#business',
    },
    {
      icon: Award,
      title: 'Employer sponsored visas',
      description: 'Secure permanent residence through employer sponsorship programs in both countries.',
      link: '/services#employer',
    },
  ];

  const testimonials = [
    {
      name: 'Arjun Mehta',
      country: 'India → Canada',
      visaType: 'C11 Entrepreneur Work Permit',
      testimonial: 'As a business owner from Mumbai, I was looking for a flexible route to Canada. iMigrate Solutions guided me through the C11 process seamlessly. Their expertise in structuring my business plan made all the difference. I am now running my IT consulting firm in Toronto.',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    },
    {
      name: 'Priya Nair',
      country: 'India → Australia',
      visaType: 'Skilled Independent Visa (189)',
      testimonial: "iMigrate Solutions helped me navigate Australia's points system with confidence. Their team reviewed my profile thoroughly and identified the best pathway for my nursing career. The process was transparent and professional from start to finish.",
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    },
    {
      name: 'Rajan Kumar',
      country: 'Malaysia → Canada',
      visaType: 'Express Entry',
      testimonial: 'Coming from Kuala Lumpur, I wanted a reliable partner to handle my Express Entry application. The iMigrate team was professional, responsive and kept me informed throughout the journey. I am grateful for their support in helping me and my family start a new chapter.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    },
  ];

  return (
    <>
      <Helmet>
        <title>iMigrate Solutions | Australia &amp; Canada Immigration for Malaysia, Singapore, India &amp; Vietnam | 98.6% Success Rate</title>
        <meta name="description" content="Malaysia-based immigration consultancy serving clients across Asia &amp; worldwide. Expert Australia &amp; Canada PR, Express Entry, C11 work permit &amp; skilled migration — with a FREE consultation, money-back guarantee &amp; flexible pay-as-you-go fees." />
        <meta name="keywords" content="Australia immigration Malaysia, Canada immigration Singapore, immigration consultant India, C11 entrepreneur work permit, Express Entry, skilled migration, immigration consultant Vietnam, Canada PR visa" />
        <link rel="canonical" href="https://www.imigratesolution.com/" />
        <meta property="og:title" content="iMigrate Solutions - Australia &amp; Canada Immigration Experts" />
        <meta property="og:description" content="Malaysia-based consultancy for Australia &amp; Canada immigration, serving Asia &amp; worldwide. FREE consultation, money-back guarantee &amp; flexible pay-as-you-go fees." />
        <meta property="og:url" content="https://www.imigratesolution.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.imigratesolution.com/images/imigrate-logo.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["Organization", "LocalBusiness"],
          "name": "iMigrate Solutions",
          "url": "https://www.imigratesolution.com",
          "logo": "https://www.imigratesolution.com/images/imigrate-logo.jpg",
          "description": "Expert Australia and Canada immigration consultants for clients from Malaysia, Singapore, India and Vietnam. 98.6% success rate.",
          "telephone": "+60134940302",
          "email": "contact@imigratesolution.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "KL Eco City, Levels 19, Boutique Office 1 (B-O1-D), Menara 2, No. 3 Jalan Bangsar",
            "addressLocality": "Kuala Lumpur",
            "postalCode": "59200",
            "addressCountry": "MY"
          },
          "openingHours": "Mo-Su 09:00-21:00",
          "sameAs": [],
          "areaServed": ["Malaysia", "Singapore", "India", "Vietnam"],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Immigration Services",
            "itemListElement": [
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Canada Express Entry" }},
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "C11 Entrepreneur Work Permit" }},
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Australia Skilled Migration" }},
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Provincial Nominee Program" }}
            ]
          }
        })}</script>
      </Helmet>

      <Header />
      <LeadGenerationModal />
      <StickyConsultationButton />

      <main>
        <section className="relative min-h-[100dvh] flex items-center bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1579388735156-3e71549fad0b"
              alt="Modern cityscape representing global opportunities"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/80"></div>

          <div className="container-custom relative z-10">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <h1 className="heading-display text-balance mb-6">
                  {home.heroTitle}
                </h1>
                <p className="text-xl md:text-2xl leading-relaxed mb-8 opacity-90">
                  {home.heroSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg transition-colors text-lg px-8 py-6"
                  >
                    <Link to="/assessment">
                      Free Eligibility Check
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    onClick={() => openLeadForm('Home hero — Book Free Consultation')}
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-colors"
                  >
                    Book Free Consultation
                  </Button>
                </div>
                <div className="flex items-center space-x-8 mt-12">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-3xl font-bold text-accent">{stat.value}</div>
                      <div className="text-sm opacity-90">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <TrustHighlights />

        <section className="section-spacing bg-background">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="heading-section text-balance mb-4">{home.whyHeading}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {home.whySubtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <BenefitCard key={index} {...benefit} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section className="section-spacing bg-muted">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="heading-section text-balance mb-4">{home.servicesHeading}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {home.servicesSubtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>
          </div>
        </section>

        {/* C11 Featured Section */}
        <section className="section-spacing bg-primary text-primary-foreground">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="gold-rule mb-5" />
                <span className="text-accent font-semibold text-sm uppercase tracking-widest">Featured Program</span>
                <h2 className="heading-section text-balance mt-2 mb-4">C11 Entrepreneur Work Permit</h2>
                <p className="text-lg opacity-90 mb-6">Canada's most flexible business immigration route. No minimum investment, no language test required — ideal for entrepreneurs from India, Malaysia, Singapore and beyond.</p>
                <ul className="space-y-2 mb-8">
                  {['No minimum capital investment required', 'Bring your family to Canada', 'Fast-track path to permanent residence', 'Suitable for a wide range of business types'].map(item => (
                    <li key={item} className="flex items-center gap-2 opacity-90"><CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />{item}</li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg">
                    <Link to="/c11-entrepreneur-work-permit">Learn More About C11</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" onClick={() => openLeadForm('C11 Featured — Book Consultation')}>
                    Book Free Consultation
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop" alt="Toronto skyline — Canada business immigration destination" className="rounded-2xl shadow-2xl w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section className="section-spacing bg-background">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="heading-section text-balance mb-4">{home.successHeading}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {home.successSubtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} index={index} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg" variant="outline">
                <Link to="/success-stories">
                  View all success stories
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <FaqTeaser
          categoryId="general"
          heading="Frequently asked questions"
          subheading="Quick answers about migrating to Australia and Canada — explore our full FAQ for more."
        />

        <section className="section-spacing bg-primary text-primary-foreground">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="heading-section text-balance mb-6">{home.ctaHeading}</h2>
                <p className="text-lg leading-relaxed mb-8 opacity-90">
                  {home.ctaText}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg transition-colors text-lg px-8 py-6"
                >
                  <Link to="/assessment">
                    Free Eligibility Check
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default HomePage;
