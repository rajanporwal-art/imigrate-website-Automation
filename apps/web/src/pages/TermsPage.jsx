
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import LegalDisclaimer from '@/components/LegalDisclaimer.jsx';
import { useSiteContent } from '@/lib/siteContent.jsx';
import { mdToHtml } from '@/lib/markdown';

const EFFECTIVE_DATE = '1 June 2026';
const COMPANY = 'iMigrate Migration Solutions';
const WEBSITE = 'www.imigratesolution.com';
const EMAIL = 'contact@imigratesolution.com';
const ADDRESS = 'KL Eco City, Levels 19, Boutique Office 1 (B-O1-D), Menara 2, No. 3 Jalan Bangsar, 59200 Kuala Lumpur, Malaysia';

function Section({ id, title, children }) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="text-2xl font-bold text-primary mb-4 pb-2 border-b border-border">{title}</h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

const TOC = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'services', title: '2. Our Services' },
  { id: 'client-obligations', title: '3. Client Obligations' },
  { id: 'fees-payment', title: '4. Fees & Payment' },
  { id: 'money-back', title: '5. 100% Money-Back Guarantee' },
  { id: 'no-guarantees', title: '6. No Guarantee of Visa Outcome' },
  { id: 'ip', title: '7. Intellectual Property' },
  { id: 'confidentiality', title: '8. Confidentiality' },
  { id: 'limitation', title: '9. Limitation of Liability' },
  { id: 'indemnity', title: '10. Indemnification' },
  { id: 'termination', title: '11. Termination' },
  { id: 'dispute', title: '12. Disputes & Governing Law' },
  { id: 'general', title: '13. General Provisions' },
  { id: 'contact', title: '14. Contact Us' },
];

export default function TermsPage() {
  const { terms = {} } = useSiteContent();
  const heroTitle = terms.heroTitle || 'Terms of Service';
  const effDate = terms.effectiveDate || EFFECTIVE_DATE;

  if (terms.bodyMarkdown && terms.bodyMarkdown.trim()) {
    return (
      <>
        <Helmet>
          <title>Terms of Service — iMigrate Migration Solutions</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <Header />
        <main className="bg-background">
          <section className="bg-primary text-primary-foreground py-16">
            <div className="container-custom"><div className="gold-rule mb-5" /><h1 className="heading-display mb-4">{heroTitle}</h1><p className="text-lg opacity-80">Effective date: <strong>{effDate}</strong></p></div>
          </section>
          <div className="container-custom py-16 max-w-3xl cms-prose" dangerouslySetInnerHTML={{ __html: mdToHtml(terms.bodyMarkdown) }} />
        </main>
        <Footer />
      </>
    );
  }
  return (
    <>
      <Helmet>
        <title>Terms of Service — iMigrate Migration Solutions</title>
        <meta name="description" content="iMigrate Migration Solutions Terms of Service — the terms and conditions governing use of our immigration consultancy services and website." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://www.imigratesolution.com/terms" />
      </Helmet>

      <Header />

      <main className="bg-background">
        {/* Hero */}
        <section className="relative bg-primary text-primary-foreground py-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&auto=format&fit=crop"
              alt="Terms and conditions"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-primary/85" />
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="gold-rule mb-5" />
              <h1 className="heading-display mb-4">{heroTitle}</h1>
              <p className="text-lg opacity-80">
                Effective date: <strong>{effDate}</strong>
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container-custom py-16 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

            {/* Sticky Table of Contents */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 bg-muted rounded-2xl p-6">
                <h3 className="font-bold text-primary mb-4 text-sm uppercase tracking-wider">Contents</h3>
                <nav className="space-y-1">
                  {TOC.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-background"
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Terms Content */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-2xl border border-border p-8 md:p-10 shadow-sm">

                <p className="text-muted-foreground leading-relaxed mb-10">
                  These Terms of Service ("<strong>Terms</strong>") govern your access to and use of the website at <strong>{WEBSITE}</strong> and the immigration consultancy services provided by <strong>{COMPANY}</strong> ("<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>"). By accessing our website or engaging our services, you agree to be bound by these Terms. If you do not agree, please do not use our website or services.
                </p>

                <LegalDisclaimer className="mb-10" />

                <Section id="acceptance" title="1. Acceptance of Terms">
                  <p>
                    By using this website, submitting an enquiry form, signing a service agreement, or otherwise engaging {COMPANY}, you confirm that you are at least 18 years of age and have the legal capacity to enter into a binding agreement.
                  </p>
                  <p>
                    If you are acting on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms.
                  </p>
                  <p>
                    We reserve the right to modify these Terms at any time. Changes are effective immediately upon posting to our website with an updated effective date. Your continued use of our services after changes constitutes your acceptance of the revised Terms.
                  </p>
                </Section>

                <Section id="services" title="2. Our Services">
                  <p>
                    {COMPANY} provides immigration consultancy services, including but not limited to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Eligibility assessments and profile evaluations for Australian and Canadian immigration programs.</li>
                    <li>Visa strategy advice and pathway recommendations.</li>
                    <li>Preparation and review of visa applications (Subclass 189, 190, 491, 186, 482; Express Entry, PNP, C11 Work Permit, Study Permit, Family Sponsorship, and others).</li>
                    <li>Skills assessment preparation and liaison with assessing authorities.</li>
                    <li>Document review, preparation, and submission.</li>
                    <li>Ongoing case management and liaison with immigration authorities.</li>
                    <li>Business and entrepreneur immigration advice, including C11 Entrepreneur Work Permit strategy.</li>
                  </ul>
                  <p>
                    Specific services, timelines, and fees are set out in individual Service Agreements issued to each client. In the event of any conflict between these Terms and a Service Agreement, the Service Agreement shall prevail.
                  </p>
                  <p>
                    We are immigration consultants, not lawyers. We do not provide legal advice unless expressly stated in your Service Agreement. For matters requiring formal legal advice, we may refer you to a qualified immigration lawyer.
                  </p>
                </Section>

                <Section id="client-obligations" title="3. Client Obligations">
                  <p>You agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Provide accurate and complete information:</strong> you must provide truthful, accurate, and complete information and documentation at all times. Providing false, misleading, or incomplete information may invalidate your visa application, result in refusal, a potential ban, and may constitute a criminal offence under immigration law.</li>
                    <li><strong>Cooperate promptly:</strong> respond to our requests for information, documents, or instructions within the timeframes specified. Immigration authorities and visa portals often impose strict deadlines.</li>
                    <li><strong>Notify us of changes:</strong> promptly inform us of any changes to your circumstances that may affect your application (e.g. change of employment, marital status, criminal record, health).</li>
                    <li><strong>Make timely payments:</strong> pay our fees in accordance with the payment schedule in your Service Agreement.</li>
                    <li><strong>Pay government fees:</strong> government visa application charges, skills assessment fees, English test fees, and other statutory charges are your responsibility and are separate from our service fees.</li>
                    <li><strong>Comply with visa conditions:</strong> if a visa is granted, comply with all conditions attached to it.</li>
                    <li><strong>Lawful use of our website:</strong> use our website only for lawful purposes and not in any way that violates applicable law or the rights of third parties.</li>
                  </ul>
                </Section>

                <Section id="fees-payment" title="4. Fees & Payment">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">4.1 Pay As You Go model</h3>
                    <p>
                      {COMPANY} operates on a transparent, stage-by-stage payment model. Fees are charged as each agreed milestone or stage of your case is completed — you are never required to pay the full service fee upfront. Specific fee schedules and payment milestones are set out in your individual Service Agreement.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">4.2 Fee transparency</h3>
                    <p>
                      All service fees are agreed in writing before work commences. We do not charge hidden fees. Any variation to the agreed fee scope requires written agreement from both parties.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">4.3 Government and third-party fees</h3>
                    <p>
                      Government visa application charges, skills assessment fees, language test fees, police clearance fees, health examination fees, and any other statutory or third-party charges are not included in our service fees. These are your direct responsibility.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">4.4 Late payment</h3>
                    <p>
                      Late payment of our invoices may result in suspension of work on your case until the outstanding balance is settled. We reserve the right to charge interest on overdue amounts at the rate specified in your Service Agreement, or otherwise at the statutory rate under applicable Malaysian law.
                    </p>
                  </div>
                </Section>

                <Section id="money-back" title="5. 100% Money-Back Guarantee">
                  <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 mb-4">
                    <p className="font-semibold text-foreground text-base">
                      Our Guarantee: If you are assessed as not eligible for the specific service you have paid for, we will refund 100% of our service fee for that ineligible service.
                    </p>
                  </div>
                  <p>
                    The following conditions apply:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The guarantee applies to our professional service fees only, not government fees, third-party charges, or disbursements already paid on your behalf.</li>
                    <li>The guarantee applies where our assessment — conducted at the outset and in accordance with current immigration law — determines that you do not meet the eligibility criteria for the service you have engaged us for.</li>
                    <li>The guarantee does not apply where ineligibility arises as a result of: (a) inaccurate, false, or incomplete information provided by you; (b) changes to your personal circumstances after the service agreement is signed; (c) changes to immigration law or policy that occur after the agreement is signed; or (d) deliberate misrepresentation.</li>
                    <li>Refund claims must be submitted in writing within 30 days of the eligibility determination.</li>
                    <li>Refunds are processed within 14 business days of written approval by {COMPANY}.</li>
                    <li>Where only part of a service has been completed at the time of the eligibility finding, a proportional refund may apply as specified in your Service Agreement.</li>
                  </ul>
                </Section>

                <Section id="no-guarantees" title="6. No Guarantee of Visa Outcome">
                  <p>
                    Immigration decisions are made solely by the relevant government authority (e.g. the Australian Department of Home Affairs, Immigration, Refugees and Citizenship Canada). We have no authority or influence over the decisions of these authorities.
                  </p>
                  <p>
                    <strong>We do not guarantee, warrant, or represent that any visa application, nomination, or immigration pathway will be approved.</strong> Our role is to provide professional guidance, prepare the strongest possible application, and advocate for your case — but we cannot control government decision-making, changes to immigration policy, processing priorities, or discretionary assessments.
                  </p>
                  <p>
                    Any verbal or written comments about likelihood of success, processing times, or points estimates are made in good faith based on current law and your information, and do not constitute a guarantee of outcome.
                  </p>
                </Section>

                <Section id="ip" title="7. Intellectual Property">
                  <p>
                    All content on this website — including text, images, graphics, logos, icons, data, software, and compiled information — is the property of {COMPANY} or its content suppliers and is protected by applicable copyright, trademark, and intellectual property laws.
                  </p>
                  <p>
                    You may view and print pages from our website for your personal, non-commercial use only. You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any content from this website without our prior written permission.
                  </p>
                  <p>
                    Documents, reports, strategy advice, and application materials we prepare for you are subject to copyright owned by {COMPANY} until full payment of all fees has been received, at which point ownership transfers to you.
                  </p>
                </Section>

                <Section id="confidentiality" title="8. Confidentiality">
                  <p>
                    Both parties agree to keep confidential all proprietary, sensitive, or non-public information disclosed in connection with the engagement (including immigration strategies, financial information, and personal circumstances) and not to disclose such information to third parties without the other party's written consent, except as required by law or as necessary to perform the services (e.g. sharing with immigration authorities).
                  </p>
                  <p>
                    Our handling of your personal data is further governed by our <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
                  </p>
                </Section>

                <Section id="limitation" title="9. Limitation of Liability">
                  <p>
                    To the maximum extent permitted by applicable law:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Our total liability to you for any claim arising out of or in connection with our services shall not exceed the total fees paid by you to us for the specific service giving rise to the claim.</li>
                    <li>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profit, loss of opportunity, or consequential immigration delays — arising out of or in connection with our services, even if we have been advised of the possibility of such damages.</li>
                    <li>We are not liable for visa refusals, processing delays, policy changes, or adverse decisions made by government authorities outside our control.</li>
                    <li>We are not liable for any loss arising from your failure to provide accurate or timely information, or from your failure to follow our advice.</li>
                  </ul>
                  <p>
                    Nothing in these Terms limits or excludes our liability for fraud, wilful misconduct, or any liability that cannot be excluded by law.
                  </p>
                </Section>

                <Section id="indemnity" title="10. Indemnification">
                  <p>
                    You agree to indemnify, defend, and hold harmless {COMPANY} and its directors, employees, agents, and consultants from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or related to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Your breach of these Terms.</li>
                    <li>Your provision of inaccurate, false, or misleading information or documents.</li>
                    <li>Your violation of any applicable law or the rights of a third party.</li>
                    <li>Your use of our website in an unauthorised or unlawful manner.</li>
                  </ul>
                </Section>

                <Section id="termination" title="11. Termination">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">11.1 Termination by you</h3>
                    <p>
                      You may terminate a Service Agreement at any time by giving written notice to us. Upon termination, you are liable for fees for all work completed and disbursements incurred up to the date of termination, as specified in your Service Agreement.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">11.2 Termination by us</h3>
                    <p>We may terminate our engagement with you with written notice if:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>You provide false, misleading, or fraudulent information or documents.</li>
                      <li>You fail to pay our fees after a reasonable notice period.</li>
                      <li>You fail to cooperate, respond to communications, or provide necessary information within agreed timeframes.</li>
                      <li>Continuing the engagement would require us to act unethically, unlawfully, or in breach of professional obligations.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">11.3 Effect of termination</h3>
                    <p>
                      Upon termination, we will promptly return your original documents. We will retain copies of your file as required by our professional obligations and data retention policy. Provisions of these Terms that by their nature should survive termination (including limitations of liability, intellectual property, and confidentiality) shall do so.
                    </p>
                  </div>
                </Section>

                <Section id="dispute" title="12. Disputes & Governing Law">
                  <p>
                    These Terms and any dispute arising out of or in connection with them shall be governed by and construed in accordance with the laws of <strong>Malaysia</strong>.
                  </p>
                  <p>
                    In the event of a dispute, the parties agree to first attempt resolution through good-faith negotiation. If negotiation fails within 30 days, either party may refer the matter to mediation under the Mediation Act 2012 (Malaysia) before commencing formal legal proceedings.
                  </p>
                  <p>
                    Subject to the foregoing, each party irrevocably submits to the exclusive jurisdiction of the courts of Kuala Lumpur, Malaysia.
                  </p>
                </Section>

                <Section id="general" title="13. General Provisions">
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Entire agreement:</strong> these Terms, together with any Service Agreement and our Privacy Policy, constitute the entire agreement between you and {COMPANY} with respect to its subject matter and supersede all prior agreements, representations, and understandings.</li>
                    <li><strong>Severability:</strong> if any provision of these Terms is found to be invalid or unenforceable by a court of competent jurisdiction, that provision shall be severed and the remaining provisions shall continue in full force and effect.</li>
                    <li><strong>Waiver:</strong> failure to enforce any provision of these Terms shall not constitute a waiver of our right to enforce it in the future.</li>
                    <li><strong>Assignment:</strong> you may not assign or transfer your rights or obligations under these Terms without our prior written consent. We may assign our rights and obligations to a successor entity in connection with a business transfer.</li>
                    <li><strong>Force majeure:</strong> neither party shall be liable for failure to perform obligations due to circumstances beyond their reasonable control, including natural disasters, government actions, pandemics, or changes in immigration law.</li>
                    <li><strong>Website use:</strong> your use of this website is also governed by these Terms. We make no warranty that the website will be uninterrupted, error-free, or free of viruses.</li>
                    <li><strong>No legal advice:</strong> information on this website is provided for general information purposes only and does not constitute legal advice. Always consult a qualified professional regarding your specific circumstances.</li>
                  </ul>
                </Section>

                <Section id="contact" title="14. Contact Us">
                  <p>For questions about these Terms, please contact us:</p>
                  <div className="bg-muted rounded-xl p-6 mt-4 space-y-2">
                    <p><strong className="text-foreground">{COMPANY}</strong></p>
                    <p>{ADDRESS}</p>
                    <p>Email: <a href={`mailto:${EMAIL}`} className="text-primary hover:underline font-medium">{EMAIL}</a></p>
                    <p>Phone: <a href="tel:+60 11-2767 9613" className="text-primary hover:underline font-medium">+60 11-2767 9613</a></p>
                    <p>Website: <a href={`https://${WEBSITE}`} className="text-primary hover:underline font-medium">{WEBSITE}</a></p>
                  </div>
                </Section>

                {/* Back links */}
                <div className="pt-8 mt-8 border-t border-border flex flex-wrap gap-4 text-sm">
                  <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy →</Link>
                  <Link to="/contact" className="text-primary hover:underline">Contact Us →</Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
