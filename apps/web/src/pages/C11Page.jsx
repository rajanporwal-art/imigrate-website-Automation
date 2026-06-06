import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ChevronDown, ChevronUp, TrendingUp, Users, Globe, Shield, Award, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLeadForm } from '@/components/LeadFormModal.jsx';

const benefits = [
  {
    icon: TrendingUp,
    title: 'Fast-track to PR',
    description: 'The C11 work permit provides a clear and practical pathway to Canadian permanent residence through provincial nominee programs.',
  },
  {
    icon: Shield,
    title: 'No minimum investment required',
    description: 'Unlike many business immigration programs, the C11 work permit does not specify a minimum capital investment, making it accessible to a wider range of entrepreneurs.',
  },
  {
    icon: Users,
    title: 'Family inclusion',
    description: 'Bring your spouse and dependent children to Canada. Your spouse may be eligible for an open work permit.',
  },
  {
    icon: Briefcase,
    title: 'Flexible business types',
    description: 'Suitable for a wide variety of business sectors — retail, professional services, technology, hospitality, and more.',
  },
  {
    icon: Globe,
    title: 'Provincial support',
    description: 'Many Canadian provinces actively welcome C11 entrepreneurs and provide settlement support and networking opportunities.',
  },
  {
    icon: Award,
    title: 'Path to citizenship',
    description: 'After obtaining permanent residence, you can begin your journey toward Canadian citizenship — one of the most valued in the world.',
  },
];

const eligibilityRequirements = [
  'Intention to establish, purchase, or take over a business in Canada',
  'Active, day-to-day management of the business in Canada',
  'Sufficient financial resources to establish and operate the business',
  'Ability to create or maintain employment for Canadian citizens or permanent residents',
  'Business plan demonstrating economic benefit to Canada',
  'No minimum net worth requirement specified in legislation (officer discretion applies)',
  'Must intend to reside in the province or territory where the business is located',
];

const investmentConsiderations = [
  'Business purchase or establishment costs vary by industry and location',
  'Working capital sufficient to sustain the business and your family during initial operations',
  'Provincial business license and registration fees',
  'Professional fees (legal, accounting, immigration)',
  'Many applicants invest between CAD $150,000 and $500,000 depending on business type',
  'Some provinces have specific investment thresholds for regional programs linked to C11',
];

const processSteps = [
  {
    step: '1',
    title: 'Initial profile assessment',
    description: 'Our team evaluates your business background, financial capacity, and immigration goals to confirm C11 suitability.',
  },
  {
    step: '2',
    title: 'Business identification and due diligence',
    description: 'We assist you in identifying a suitable business opportunity in Canada and conduct due diligence on the target business.',
  },
  {
    step: '3',
    title: 'Business plan preparation',
    description: 'We prepare a comprehensive business plan tailored to IRCC requirements, demonstrating economic benefit to Canada.',
  },
  {
    step: '4',
    title: 'Work permit application lodgement',
    description: 'We compile and submit your C11 work permit application with all supporting documents.',
  },
  {
    step: '5',
    title: 'Arrival and business establishment',
    description: 'Upon approval, you travel to Canada and establish or take over operations of your business.',
  },
  {
    step: '6',
    title: 'Permanent residence pathway',
    description: 'We guide you through a provincial nominee program or other permanent residence pathway after demonstrating business establishment.',
  },
];

const faqs = [
  {
    q: 'What is the C11 Entrepreneur Work Permit?',
    a: 'The C11 Entrepreneur Work Permit is issued under Section C11 of the Immigration and Refugee Protection Regulations (IRPR). It allows foreign nationals to come to Canada to establish or purchase a business, with the work permit itself being the first step toward permanent residence.',
  },
  {
    q: 'Is there a minimum investment amount required?',
    a: 'Canadian legislation does not specify a fixed minimum investment amount for C11 work permits. However, immigration officers assess whether you have sufficient resources to establish a viable business that will create or maintain employment. In practice, most successful applicants invest between CAD $150,000 and $500,000 depending on the business type and province.',
  },
  {
    q: 'Can I bring my family to Canada on a C11 permit?',
    a: 'Yes. Your spouse or common-law partner may be eligible for an open work permit, and your dependent children may study in Canada. Our team can assist with family member applications at the same time as your C11 application.',
  },
  {
    q: 'How does the C11 work permit lead to permanent residence?',
    a: 'After operating your business in Canada for a period of time (typically 12–24 months), you can apply for permanent residence through provincial nominee programs such as the BCPNP Entrepreneur stream, the OINP Entrepreneur stream, or other provincial pathways. iMigrate Solutions guides you through this transition.',
  },
  {
    q: 'What types of businesses qualify for a C11 work permit?',
    a: 'A wide range of business types qualify, including retail, professional services, technology, food and beverage, hospitality, manufacturing, and more. The key criteria are that the business must be genuine, viable, and provide economic benefit to Canada — including employment creation.',
  },
  {
    q: 'How long does the C11 work permit process take?',
    a: 'Processing times vary depending on the visa office processing your application and the completeness of your documentation. iMigrate Solutions prepares thorough applications to minimize delays. We provide realistic timelines based on current processing conditions at the time of your application.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between p-5 text-left font-semibold hover:bg-muted transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{q}</span>
        {open ? <ChevronUp className="h-5 w-5 flex-shrink-0 text-accent" /> : <ChevronDown className="h-5 w-5 flex-shrink-0 text-accent" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-muted-foreground leading-relaxed">{a}</div>
      )}
    </div>
  );
}

function C11Page() {
  const { openLeadForm } = useLeadForm();

  return (
    <>
      <Helmet>
        <title>C11 Entrepreneur Work Permit Canada | iMigrate Solutions</title>
        <meta name="description" content="Canada's C11 Entrepreneur Work Permit — flexible business immigration with no minimum investment requirement. Fast-track to permanent residence for entrepreneurs from India, Malaysia, Singapore and beyond." />
        <meta name="keywords" content="C11 entrepreneur work permit, Canada business immigration, entrepreneur visa Canada, Canada PR for entrepreneurs, business immigration Canada" />
        <link rel="canonical" href="https://www.imigratesolution.com/c11-entrepreneur-work-permit" />
        <meta property="og:title" content="C11 Entrepreneur Work Permit — Canada | iMigrate Solutions" />
        <meta property="og:description" content="Canada's most flexible business immigration route. No minimum investment, fast-track to permanent residence." />
        <meta property="og:url" content="https://www.imigratesolution.com/c11-entrepreneur-work-permit" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.imigratesolution.com/images/imigrate-logo.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.imigratesolution.com/" },
            { "@type": "ListItem", "position": 2, "name": "C11 Entrepreneur Work Permit", "item": "https://www.imigratesolution.com/c11-entrepreneur-work-permit" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "C11 Entrepreneur Work Permit",
          "provider": { "@type": "Organization", "name": "iMigrate Solutions" },
          "description": "Expert guidance for Canada's C11 Entrepreneur Work Permit — business immigration pathway to Canadian permanent residence.",
          "areaServed": ["India", "Malaysia", "Singapore", "Canada"],
        })}</script>
      </Helmet>

      <Header />
      <StickyConsultationButton />

      <main>
        {/* Hero */}
        <section className="section-spacing bg-primary text-primary-foreground">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="gold-rule mb-5" />
              <span className="text-accent font-semibold text-sm uppercase tracking-widest">Featured Program</span>
              <h1 className="heading-display text-balance mt-2 mb-6">C11 Entrepreneur Work Permit — Canada</h1>
              <p className="text-xl leading-relaxed opacity-90 mb-8">
                Canada's premier business immigration route. Establish or purchase a business in Canada with no mandatory minimum investment and a clear fast-track to permanent residence — ideal for entrepreneurs from India, Malaysia, Singapore, and across Asia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg text-base px-7 py-6"
                  onClick={() => openLeadForm('C11 Page Hero — Book Free Consultation')}
                >
                  Book Free Consultation
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base px-7 py-6 border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Link to="/canada-immigration">Explore All Canada Pathways</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Overview */}
        <section className="section-spacing bg-background">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h2 className="heading-section text-balance mb-6">What is the C11 Entrepreneur Work Permit?</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The C11 Entrepreneur Work Permit is issued under Section C11 of the Immigration and Refugee Protection Regulations (IRPR). It is a federal work permit that allows foreign nationals to enter Canada to establish, purchase, or take over a business — with the explicit goal of progressing to permanent residence.
                </p>
                <p>
                  Unlike many business immigration programs, C11 does not mandate a minimum investment amount in legislation, giving immigration officers flexibility to assess each case on its merits. What matters most is demonstrating that the business is genuine, viable, will provide significant economic benefit to Canada, and will create or maintain employment for Canadian citizens or permanent residents.
                </p>
                <p>
                  iMigrate Solutions specializes in C11 applications for entrepreneurs from India, Malaysia, Singapore, and other Asian markets. Our team handles the entire process — from initial assessment and business identification through to permanent residence.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="section-spacing bg-muted">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="heading-section text-balance mb-4">Key benefits</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Why entrepreneurs from India, Malaysia and Singapore choose the C11 pathway.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <Card className="card-base h-full">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Eligibility + Investment */}
        <section className="section-spacing bg-background">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="heading-section text-balance mb-6">Eligibility requirements</h2>
                <ul className="space-y-3">
                  {eligibilityRequirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="heading-section text-balance mb-6">Investment considerations</h2>
                <ul className="space-y-3">
                  {investmentConsiderations.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="section-spacing bg-muted">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="heading-section text-balance mb-4">Step-by-step process</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From initial assessment to permanent residence — our end-to-end support.
              </p>
            </motion.div>
            <div className="space-y-6 max-w-3xl mx-auto">
              {processSteps.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.07 }}
                  className="flex gap-6 items-start"
                >
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-spacing bg-background">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="heading-section text-balance mb-4">Frequently asked questions</h2>
            </motion.div>
            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-spacing bg-primary text-primary-foreground">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="gold-rule mb-5 mx-auto" />
                <h2 className="heading-section text-balance mb-6">Ready to explore the C11 Entrepreneur Work Permit?</h2>
                <p className="text-lg leading-relaxed mb-8 opacity-90">
                  Book a free consultation with our Canada immigration specialists. We'll assess your eligibility, explain the process, and provide a personalized roadmap for your Canadian business immigration journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg text-base px-8 py-6"
                    onClick={() => openLeadForm('C11 Page Bottom CTA — Book Consultation')}
                  >
                    Book Free Consultation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-base px-8 py-6 border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    <Link to="/canada-immigration">All Canada Programs</Link>
                  </Button>
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

export default C11Page;
