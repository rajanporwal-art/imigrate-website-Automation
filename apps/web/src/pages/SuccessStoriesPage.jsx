
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import TestimonialCard from '@/components/TestimonialCard.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import { useSiteContent } from '@/lib/siteContent.jsx';

function SuccessStoriesPage() {
  const { stats, successStoriesPage = {} } = useSiteContent();
  const DEF_STORIES = [
    {
      name: 'Arjun Mehta',
      country: 'India → Canada',
      visaType: 'C11 Entrepreneur Work Permit',
      testimonial: 'As a business owner from Mumbai, I was looking for a flexible route to Canada. iMigrate Migration Solutions guided me through the C11 process seamlessly. Their expertise in structuring my business plan made all the difference. I am now running my IT consulting firm in Toronto.',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    },
    {
      name: 'Priya Nair',
      country: 'India → Australia',
      visaType: 'Skilled Independent Visa (189)',
      testimonial: "iMigrate Migration Solutions helped me navigate Australia's points system with confidence. Their team reviewed my profile thoroughly and identified the best pathway for my nursing career. The process was transparent and professional from start to finish.",
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    },
    {
      name: 'Rajan Kumar',
      country: 'Malaysia → Canada',
      visaType: 'Express Entry',
      testimonial: 'Coming from Kuala Lumpur, I wanted a reliable partner to handle my Express Entry application. The iMigrate team was professional, responsive and kept me informed throughout the journey. I am grateful for their support in helping me and my family start a new chapter.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    },
    {
      name: 'Siti Aminah',
      country: 'Malaysia → Australia',
      visaType: 'Employer Sponsored Visa (186)',
      testimonial: 'My employer wanted to sponsor my permanent residence in Australia and the process seemed complex. iMigrate Migration Solutions handled everything professionally, coordinating between my employer and the immigration authorities. I highly recommend their services.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    },
    {
      name: 'Wei Lin Tan',
      country: 'Singapore → Canada',
      visaType: 'C11 Entrepreneur Work Permit',
      testimonial: 'As a Singaporean entrepreneur, expanding into Canada was a strategic decision. iMigrate Migration Solutions made the immigration process straightforward and stress-free. Their knowledge of the C11 work permit was exceptional and their communication was always timely.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    },
    {
      name: 'Vikram Singh',
      country: 'India → Canada',
      visaType: 'Provincial Nominee Program',
      testimonial: 'After exploring multiple immigration options, iMigrate Migration Solutions identified the Provincial Nominee Program as the ideal pathway for my professional profile. Their strategic advice and thorough documentation support gave me confidence throughout the process.',
      image: 'https://images.unsplash.com/photo-1493882552576-fce827c6161e?w=400',
    },
    {
      name: 'Nurul Huda',
      country: 'Malaysia → Australia',
      visaType: 'Skilled Independent Visa (189)',
      testimonial: 'The team at iMigrate Migration Solutions was incredibly thorough in assessing my eligibility for Australian skilled migration. They helped me understand the points system and guided me toward achieving the score needed for my application. Professional service throughout.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    },
    {
      name: 'Chen Jing Wei',
      country: 'Singapore → Australia',
      visaType: 'Business Innovation Visa',
      testimonial: 'Relocating my business from Singapore to Australia was a major step. iMigrate Migration Solutions provided expert guidance on the Business Innovation visa, helping me understand all requirements and prepare a comprehensive application. Their team was knowledgeable and supportive.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    },
  ];
  const successStories = Array.isArray(successStoriesPage.stories) && successStoriesPage.stories.length ? successStoriesPage.stories : DEF_STORIES;

  return (
    <>
      <Helmet>
        <title>Immigration Success Stories | 98.6% Success Rate | iMigrate Migration Solutions</title>
        <meta name="description" content="Real success stories from professionals and entrepreneurs from Malaysia, Singapore, India and Vietnam who migrated to Australia and Canada with iMigrate Migration Solutions — 98.6% success rate." />
        <meta name="keywords" content="immigration success stories, visa approval, client testimonials, Australia immigration, Canada immigration" />
        <link rel="canonical" href="https://www.imigratesolution.com/success-stories" />
        <meta property="og:title" content="Immigration Success Stories | 98.6% Success Rate | iMigrate Migration Solutions" />
        <meta property="og:description" content="Real success stories from professionals and entrepreneurs from Malaysia, Singapore, India and Vietnam who migrated to Australia and Canada with iMigrate Migration Solutions — 98.6% success rate." />
        <meta property="og:url" content="https://www.imigratesolution.com/success-stories" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.imigratesolution.com/images/imigrate-logo.jpg" />
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
              <h1 className="heading-display text-balance mb-6">Success stories</h1>
              <p className="text-xl leading-relaxed opacity-90">
                Real people, real results. Read how we've helped thousands of clients achieve their immigration goals and build new lives in Australia and Canada.
              </p>
            </motion.div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-4xl font-bold text-accent mb-2">{stat.value}</div>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {successStories.map((story, index) => (
                <TestimonialCard key={index} {...story} index={index} />
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
                <h2 className="heading-section text-balance mb-6">Ready to write your own success story?</h2>
                <p className="text-lg leading-relaxed mb-8 opacity-90">
                  Join thousands of satisfied clients who have achieved their immigration goals with iMigrate Migration Solutions. Start your journey today with a free eligibility assessment.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/assessment"
                    className="inline-flex items-center justify-center px-8 py-3 bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg rounded-lg font-semibold transition-all duration-200"
                  >
                    Free Eligibility Check
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary rounded-lg font-semibold transition-all duration-200"
                  >
                    Book Free Consultation
                  </a>
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

export default SuccessStoriesPage;
