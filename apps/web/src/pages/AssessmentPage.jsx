import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { CheckCircle, MessageCircle, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import PointsCalculator from '@/components/PointsCalculator.jsx';
import OccupationChecker from '@/components/OccupationChecker.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSiteContent } from '@/lib/siteContent.jsx';
import LeadForm from '@/components/LeadForm.jsx';
function AssessmentPage() {
  const { contact, assessment } = useSiteContent();
  const [isSubmitted, setIsSubmitted] = useState(false);
  if (isSubmitted) {
    return <>
        <Helmet>
          <title>Thank You — iMigrate Solutions</title>
        </Helmet>

        <Header />
        <StickyConsultationButton />

        <main className="min-h-[70vh] flex items-center justify-center section-spacing bg-background">
          <div className="container-custom">
            <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.5
          }} className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-accent" />
              </div>
              <h1 className="heading-section text-balance mb-4">Your assessment has been received</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Thank you for submitting your details. Our immigration experts will review your profile and reach out within 24 hours with personalised recommendations for Australia or Canada.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setIsSubmitted(false)} variant="outline">
                  Submit another assessment
                </Button>
                <Button asChild className="bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg transition-colors">
                  <a href="/">Return to home</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </>;
  }
  return <>
      <Helmet>
        <title>Free Eligibility Check & Points Calculator | Australia & Canada — iMigrate Solutions</title>
        <meta name="description" content="Get a free immigration eligibility assessment and calculate your points for Australia skilled migration (189/190/491) or Canada Express Entry CRS. Instant estimate plus a personalized expert review." />
        <meta name="keywords" content="Australia points calculator, Canada CRS calculator, immigration assessment, skilled migration points test, Express Entry calculator, eligibility check, Australia PR, Canada PR" />
        <link rel="canonical" href="https://www.imigratesolution.com/assessment" />
        <meta property="og:title" content="Free Eligibility Check & Points Calculator | Australia & Canada — iMigrate Solutions" />
        <meta property="og:description" content="Get a free immigration eligibility assessment and calculate your points for Australia skilled migration or Canada Express Entry CRS. Instant estimate plus expert review." />
        <meta property="og:url" content="https://www.imigratesolution.com/assessment" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.imigratesolution.com/images/imigrate-logo.jpg" />
      </Helmet>

      <Header />
      <StickyConsultationButton />

      <main>
        <section className="relative section-spacing bg-primary text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1600&auto=format"
              alt="Professional immigration consultation — expert advisor reviewing documents"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-primary/85"></div>
          <div className="container-custom relative z-10">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6
          }} className="max-w-3xl">
              <div className="gold-rule mb-5" />
              <h1 className="heading-display text-balance mb-6">{assessment.heroTitle}</h1>
              <p className="text-xl leading-relaxed opacity-90 mb-8">
                {assessment.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" variant="cta" className="text-base px-7 py-6">
                  <a href="#calculator">
                    <Calculator className="mr-1 h-5 w-5" />
                    Points Calculator
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="bg-[#25D366] text-white hover:bg-[#1fb457] shadow-md hover:shadow-lg text-base px-7 py-6"
                >
                  <a
                    href={`https://wa.me/${contact.whatsapp}?text=Hi%2C%20I%27d%20like%20a%20free%20immigration%20eligibility%20assessment`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-1 h-5 w-5" />
                    Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Australia skilled occupation eligibility checker (step 1: confirm your occupation) */}
        <OccupationChecker />

        {/* Skilled migration points calculator (Australia & Canada) */}
        <section className="section-spacing bg-background">
          <div className="container-custom">
            <PointsCalculator />
          </div>
        </section>

        <section id="assessment-form" className="section-spacing bg-background scroll-mt-24">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <Card className="shadow-xl border-border/50">
                  <CardContent className="pt-8">
                    <LeadForm source="Assessment page" />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="shadow-lg border-border/50">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">What happens next?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-accent text-sm font-semibold">1</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Our experts review your profile within 24 hours</p>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-accent text-sm font-semibold">2</span>
                        </div>
                        <p className="text-sm text-muted-foreground">We contact you with a personalized assessment</p>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-accent text-sm font-semibold">3</span>
                        </div>
                        <p className="text-sm text-muted-foreground">We recommend the best immigration pathway for you</p>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-accent text-sm font-semibold">4</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Schedule a free consultation to discuss next steps</p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-border/50 bg-primary text-primary-foreground">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">Why choose us?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-accent" />
                        <span className="text-sm opacity-90">98.6% success rate</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-accent" />
                        <span className="text-sm opacity-90">10+ years experience</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-accent" />
                        <span className="text-sm opacity-90">100% money-back guarantee</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-accent" />
                        <span className="text-sm opacity-90">Transparent pricing</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-accent" />
                        <span className="text-sm opacity-90">End-to-end support</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>;
}
export default AssessmentPage;