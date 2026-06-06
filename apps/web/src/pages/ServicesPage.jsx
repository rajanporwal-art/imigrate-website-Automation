
import React from 'react';
import { Helmet } from 'react-helmet';
import { Globe, Users, TrendingUp, GraduationCap, Heart, Briefcase, CheckCircle, ShieldCheck, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ServiceCard from '@/components/ServiceCard.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

function ServicesPage() {
  const australianServices = [
    {
      icon: Globe,
      title: 'Skilled Independent Visa (189)',
      description: 'Points-based permanent residence for skilled workers without employer or state sponsorship.',
      link: '/australia-migration#subclass-189',
    },
    {
      icon: Globe,
      title: 'State Nominated Visa (190)',
      description: 'Permanent residence with state or territory government nomination for additional points.',
      link: '/australia-migration#subclass-190',
    },
    {
      icon: Briefcase,
      title: 'Employer Sponsored Visa (186)',
      description: 'Permanent residence through employer sponsorship for skilled positions.',
      link: '/australia-migration#employer-sponsored',
    },
    {
      icon: Heart,
      title: 'Partner Visa (820/801)',
      description: 'Temporary and permanent visas for partners and spouses of Australian citizens or PR holders.',
      link: '/australia-migration#partner-visa',
    },
    {
      icon: GraduationCap,
      title: 'Student Visa (500)',
      description: 'Study at Australian institutions with pathways to post-study work rights and PR.',
      link: '/australia-migration#student-visa',
    },
    {
      icon: TrendingUp,
      title: 'Business & Investor Visa',
      description: 'Visas for business owners, investors, and entrepreneurs seeking Australian residence.',
      link: '/australia-migration#business-investor',
    },
  ];

  const canadianServices = [
    {
      icon: TrendingUp,
      title: '⭐ C11 Entrepreneur Work Permit',
      description: 'Our featured program. Work permit for entrepreneurs establishing or purchasing a business in Canada — fast-track to permanent residence.',
      link: '/c11-entrepreneur-work-permit',
    },
    {
      icon: Globe,
      title: 'Express Entry',
      description: 'Fast-track permanent residence through Federal Skilled Worker, Skilled Trades, or Canadian Experience Class.',
      link: '/canada-immigration#express-entry',
    },
    {
      icon: Globe,
      title: 'Provincial Nominee Program',
      description: 'Provincial and territorial programs offering additional pathways to permanent residence.',
      link: '/canada-immigration#pnp',
    },
    {
      icon: Briefcase,
      title: 'Start-Up Visa Program',
      description: 'Permanent residence for innovative entrepreneurs with support from designated organizations.',
      link: '/canada-immigration#business-startup',
    },
    {
      icon: GraduationCap,
      title: 'Study Permit',
      description: 'Study at Canadian institutions with post-graduation work permit opportunities.',
      link: '/canada-immigration#study-permit',
    },
    {
      icon: Heart,
      title: 'Family Sponsorship',
      description: 'Sponsor your spouse, partner, parents, or dependent children for Canadian permanent residence.',
      link: '/canada-immigration#family-sponsorship',
    },
  ];

  const businessServices = [
    {
      icon: TrendingUp,
      title: 'Business Innovation Visa',
      description: 'For business owners and entrepreneurs looking to establish or develop a business.',
      link: '/australia-migration#business-investor',
    },
    {
      icon: Briefcase,
      title: 'Investor Visa Programs',
      description: 'Investment-based immigration pathways for high-net-worth individuals.',
      link: '/canada-immigration#business-startup',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Immigration Services | Skilled Migration, Express Entry, C11 Work Permit | iMigrate Solutions</title>
        <meta name="description" content="Comprehensive immigration services for Australia and Canada including skilled migration, student visas, family sponsorship, and business immigration." />
        <meta name="keywords" content="skilled migration, Express Entry, student visa, partner visa, business immigration, investor visa, provincial nominee, C11 entrepreneur work permit" />
        <link rel="canonical" href="https://www.imigratesolution.com/services" />
        <meta property="og:title" content="Immigration Services | Skilled Migration, Express Entry, C11 Work Permit | iMigrate Solutions" />
        <meta property="og:description" content="Comprehensive immigration services for Australia and Canada including skilled migration, student visas, family sponsorship, and business immigration." />
        <meta property="og:url" content="https://www.imigratesolution.com/services" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.imigratesolution.com/images/imigrate-logo.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.imigratesolution.com/" },
            { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://www.imigratesolution.com/services" }
          ]
        })}</script>
      </Helmet>

      <Header />
      <StickyConsultationButton />

      <main>
        <section className="relative section-spacing bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&auto=format&fit=crop"
              alt="Professional immigration consultation team"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/70" />
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="gold-rule mb-5" />
              <h1 className="heading-display text-balance mb-6">Immigration Services</h1>
              <p className="text-xl leading-relaxed opacity-90">
                Comprehensive immigration solutions for Australia and Canada — tailored for professionals, entrepreneurs, and families from Malaysia, Singapore, India and Vietnam.
              </p>
            </motion.div>
          </div>
        </section>

        <section id="australian" className="section-spacing bg-background">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h2 className="heading-section text-balance mb-4">Australian immigration</h2>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Navigate Australia's points-based immigration system with expert guidance. We help you maximize your points, choose the right visa pathway, and prepare a compelling application.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {australianServices.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>
          </div>
        </section>

        <section id="canadian" className="section-spacing bg-muted">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h2 className="heading-section text-balance mb-4">Canadian immigration</h2>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Access multiple pathways to Canadian permanent residence through Express Entry, provincial programs, and specialized streams. Our experts help you identify the fastest route based on your profile.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {canadianServices.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>
          </div>
        </section>

        <section id="business" className="section-spacing bg-background">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h2 className="heading-section text-balance mb-4">Business immigration</h2>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Establish or invest in businesses while securing your immigration status. We guide entrepreneurs and investors through specialized visa programs in both countries.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              {businessServices.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-10 bg-accent/10 border-y border-accent/20">
          <div className="container-custom">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-accent/20"
              >
                <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-lg mb-1">100% Money-Back Guarantee</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    If you are not eligible for the service you paid for, you get every dollar back — no questions asked. Complete peace of mind.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-accent/20"
              >
                <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-lg mb-1">Pay As You Go</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Flexible stage-by-stage payments. No large upfront fees — you pay only as each milestone is completed and approved.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-accent/20"
              >
                <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-lg mb-1">98.6% Success Rate</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Our proven track record across Australia and Canada immigration cases speaks for itself — backed by expert case management from start to finish.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="student" className="section-spacing bg-muted">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-3">Australia &amp; Canada</span>
                <h2 className="heading-section text-balance mb-4">Student visa services</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Study at world-class institutions in Australia or Canada and build a clear pathway to permanent residence. Our student visa specialists guide you from institution selection to post-study work rights and PR.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    'GTE (Genuine Temporary Entrant) statement preparation',
                    'University, TAFE and college selection guidance',
                    'Student visa application preparation and lodgement',
                    'Student visa conditions and compliance advice',
                    'Post-study work permit (PSW / PGWP) applications',
                    'Transition to skilled or employer-sponsored PR pathways',
                    'Dependent / accompanying family member visas',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <Button asChild size="lg" className="bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg">
                  <Link to="/assessment">Free Eligibility Check</Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop"
                  alt="International students studying at a university library in Australia or Canada"
                  className="rounded-2xl shadow-2xl w-full object-cover"
                />
                <div className="mt-4 bg-white rounded-xl p-4 shadow border border-border flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-accent flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-primary">Money-Back Guarantee applies.</strong>{' '}
                    If you are not eligible after our assessment, you pay nothing.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="family" className="section-spacing bg-background">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-3">Australia &amp; Canada</span>
                <h2 className="heading-section text-balance mb-4">Partner &amp; Family Visas</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Reunite with your loved ones through partner, spouse, parent, and child visa programs. We handle the complex documentation and relationship evidence requirements so you can focus on what matters most.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    'Partner and spouse visa applications (temporary and permanent)',
                    'De facto / common-law partner visa support',
                    'Parent visa applications and contributory options',
                    'Child and dependent visa applications',
                    'Relationship evidence compilation and presentation',
                    'Statutory declarations and supporting documentation',
                    'Interview preparation and coaching',
                    'Ongoing case management and compliance advice',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <Button asChild size="lg" className="bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg">
                  <Link to="/assessment">Free Eligibility Check</Link>
                </Button>
              </motion.div>

              {/* Image right */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop"
                  alt="Family reunited after successful partner visa approval in Australia or Canada"
                  className="rounded-2xl shadow-2xl w-full object-cover"
                />
                <div className="mt-4 bg-muted rounded-xl p-4 border border-border flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-accent flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-primary">100% Money-Back Guarantee applies.</strong>{' '}
                    If you are not eligible, you pay nothing.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="employer" className="section-spacing bg-primary text-primary-foreground">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="gold-rule mb-5" />
                <span className="text-accent font-semibold text-sm uppercase tracking-widest">Australia &amp; Canada</span>
                <h2 className="heading-section text-balance mt-2 mb-4">Employer sponsored visas</h2>
                <p className="text-lg leading-relaxed mb-6 opacity-90">
                  Secure your permanent residence through employer sponsorship programs in Australia (TSS 482 → EN 186) and Canada (LMIA / closed work permit). We support both <strong>employers</strong> and <strong>employees</strong> through every stage of the sponsorship process.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    'Employer eligibility and accreditation assessment',
                    'Labour Market Impact Assessment (LMIA) Canada',
                    'Labour Market Testing (LMT) — Australia',
                    'Skills assessment applications (for employee)',
                    'TSS 482 temporary skills shortage visa (Australia)',
                    'Employer Nomination Scheme (ENS 186) permanent visa',
                    'Regional Sponsored Migration Scheme (RSMS 187)',
                    'Ongoing compliance and reporting obligations',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="opacity-90 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md">
                    <Link to="/assessment">Free Eligibility Check</Link>
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <img
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop"
                  alt="Employer and employee discussing visa sponsorship and immigration options"
                  className="rounded-2xl shadow-2xl w-full object-cover"
                />
                {/* Trust callout */}
                <div className="bg-primary-foreground/10 rounded-2xl p-5 border border-primary-foreground/20 flex items-start gap-4">
                  <CreditCard className="h-8 w-8 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Pay As You Go — No large upfront fees</p>
                    <p className="text-xs opacity-80">We charge only as each stage is completed. Spread the cost of your sponsorship application comfortably.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default ServicesPage;
