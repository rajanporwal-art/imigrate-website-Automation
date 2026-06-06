import React from 'react';
import { Helmet } from 'react-helmet';
import { Target, Eye, Award, Users, Shield, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { useSiteContent } from '@/lib/siteContent.jsx';

function AboutPage() {
  const { stats, about } = useSiteContent();

  const values = [
    {
      icon: Shield,
      title: 'Integrity',
      description: 'We operate with complete transparency and honesty in all client interactions.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We maintain the highest professional standards and stay current with immigration law changes.',
    },
    {
      icon: Users,
      title: 'Client-focused',
      description: 'Your success is our success. We treat every case with personalized attention.',
    },
    {
      icon: TrendingUp,
      title: 'Results-driven',
      description: 'Our 98.6% success rate speaks to our commitment to achieving positive outcomes.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>About iMigrate Solutions | Trusted Immigration Consultants | 98.6% Success Rate</title>
        <meta name="description" content="Learn about iMigrate Solutions, your trusted immigration consultancy with 10+ years of experience helping clients migrate to Australia and Canada." />
        <meta name="keywords" content="immigration consultancy, trusted immigration experts, Australia immigration experts, Canada immigration experts, money-back guarantee immigration" />
        <link rel="canonical" href="https://imigratesolution.com/about" />
        <meta property="og:title" content="About iMigrate Solutions | Trusted Immigration Consultants | 98.6% Success Rate" />
        <meta property="og:description" content="Learn about iMigrate Solutions — trusted immigration consultancy with 10+ years of experience and a 98.6% success rate helping clients migrate to Australia and Canada." />
        <meta property="og:url" content="https://imigratesolution.com/about" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://imigratesolution.com/images/imigrate-logo.jpg" />
      </Helmet>

      <Header />
      <StickyConsultationButton />

      <main>
        <section className="section-spacing bg-primary text-primary-foreground">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="heading-display text-balance mb-6">{about.heroTitle}</h1>
              <p className="text-xl leading-relaxed opacity-90">
                {about.heroSubtitle}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-spacing bg-background">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="heading-section text-balance mb-6">Our story</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    iMigrate Solutions was built on a simple belief: immigration should be accessible, transparent, and successful for everyone with the right qualifications and determination. That belief drives everything we do — and it's backed by a 98.6% success rate, a 100% money-back guarantee, and honest, pay-as-you-go pricing.
                  </p>
                  <p>
                    Having navigated our own immigration journeys, we understand the challenges, uncertainties, and complexities that applicants face. We set out to create a consultancy that provides expert, ethical guidance while treating every client with the respect and attention they deserve — no false promises, no hidden fees.
                  </p>
                  <p>
                    Today, we've helped individuals and families from over 20 countries successfully migrate to Australia and Canada. Our team of experienced immigration consultants brings together decades of combined experience, deep knowledge of immigration law, and a genuine passion for helping people achieve their goals.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src="/images/au-consultation-map.jpg"
                  alt="Professional team collaborating in modern office environment"
                  className="rounded-2xl shadow-2xl"
                />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section-spacing bg-muted">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="order-2 lg:order-1"
              >
                <img
                  src="/images/au-handshake-flag.jpg"
                  alt="Strategic planning and goal setting for immigration success"
                  className="rounded-2xl shadow-2xl"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="order-1 lg:order-2"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="h-8 w-8 text-accent" />
                  <h2 className="heading-section text-balance">Our mission</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  To provide expert, ethical, and personalized immigration services that transform lives and create opportunities for individuals and families seeking to build their future in Australia or Canada.
                </p>

                <div className="flex items-center space-x-3 mb-4">
                  <Eye className="h-8 w-8 text-accent" />
                  <h2 className="heading-section text-balance">Our vision</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To be the most trusted and respected immigration consultancy, known for our integrity, expertise, and unwavering commitment to client success.
                </p>
              </motion.div>
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
              <h2 className="heading-section text-balance mb-4">Our values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                These core principles guide everything we do and every decision we make.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full text-center shadow-lg border-border/50">
                    <CardContent className="pt-8">
                      <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <value.icon className="h-8 w-8 text-accent" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-spacing bg-primary text-primary-foreground">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="heading-section text-balance mb-6">Why clients trust us</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-4xl font-bold text-accent mb-2">{stat.value}</div>
                      <p className="opacity-90">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-lg leading-relaxed opacity-90">
                  {about.trustText}
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default AboutPage;