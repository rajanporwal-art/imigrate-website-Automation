
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import LegalDisclaimer from '@/components/LegalDisclaimer.jsx';

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
  { id: 'information-we-collect', title: '1. Information We Collect' },
  { id: 'how-we-use', title: '2. How We Use Your Information' },
  { id: 'legal-basis', title: '3. Legal Basis for Processing' },
  { id: 'sharing', title: '4. Sharing of Information' },
  { id: 'data-retention', title: '5. Data Retention' },
  { id: 'cookies', title: '6. Cookies & Tracking' },
  { id: 'your-rights', title: '7. Your Rights' },
  { id: 'data-security', title: '8. Data Security' },
  { id: 'international-transfers', title: '9. International Transfers' },
  { id: 'children', title: '10. Children\'s Privacy' },
  { id: 'third-party-links', title: '11. Third-Party Links' },
  { id: 'changes', title: '12. Changes to This Policy' },
  { id: 'contact', title: '13. Contact Us' },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — iMigrate Migration Solutions</title>
        <meta name="description" content="iMigrate Migration Solutions Privacy Policy — how we collect, use, and protect your personal information." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <Header />

      <main className="bg-background">
        {/* Hero */}
        <section className="relative bg-primary text-primary-foreground py-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&auto=format&fit=crop"
              alt="Privacy policy documents"
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
              <h1 className="heading-display mb-4">Privacy Policy</h1>
              <p className="text-lg opacity-80">
                Effective date: <strong>{EFFECTIVE_DATE}</strong>
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

            {/* Policy Content */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-2xl border border-border p-8 md:p-10 shadow-sm">

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {COMPANY} ("<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>") is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website at <strong>{WEBSITE}</strong> or use any of our immigration consultancy services. Please read this policy carefully. If you disagree with its terms, please discontinue use of our site.
                </p>

                <LegalDisclaimer className="mb-10" />

                <Section id="information-we-collect" title="1. Information We Collect">
                  <p>We collect information that you provide directly to us and information collected automatically when you use our website.</p>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">1.1 Information you provide</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Identity data:</strong> full name, date of birth, age, nationality, country of citizenship, country of residence.</li>
                      <li><strong>Contact data:</strong> email address, phone number, postal address.</li>
                      <li><strong>Professional data:</strong> occupation, employer, years of experience, qualifications, education level.</li>
                      <li><strong>Immigration data:</strong> visa history, travel history, criminal history declarations, marital status, family composition, language test scores, skills assessment results.</li>
                      <li><strong>Financial data:</strong> investment budget, proof of funds (where required for a visa application). We do not collect or store full payment card details.</li>
                      <li><strong>Documents:</strong> passport copies, educational certificates, employment records, police clearances, CV / résumé, LinkedIn profile URL, and any other documents you upload or share with us.</li>
                      <li><strong>Communications:</strong> records of your correspondence with us, including emails, form submissions, and consultation notes.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">1.2 Information collected automatically</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Usage data:</strong> pages visited, time spent, referring URLs, search queries, click-through data.</li>
                      <li><strong>Device data:</strong> IP address, browser type and version, operating system, device identifiers.</li>
                      <li><strong>Cookie data:</strong> session cookies, preference cookies, analytics and marketing cookies (see Section 6).</li>
                      <li><strong>UTM / attribution data:</strong> campaign source, medium, and keyword stored in your browser for first-touch attribution.</li>
                    </ul>
                  </div>
                </Section>

                <Section id="how-we-use" title="2. How We Use Your Information">
                  <p>We use your personal information for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Providing our services:</strong> assessing your immigration eligibility, preparing and lodging visa applications, providing case management and legal advice.</li>
                    <li><strong>Client communication:</strong> responding to enquiries, sending appointment reminders, providing updates on your case, sending invoices.</li>
                    <li><strong>CRM and lead management:</strong> we use our CRM to manage client records, schedule follow-ups, and track the progress of enquiries and active cases.</li>
                    <li><strong>Marketing communications:</strong> with your consent, sending newsletters, immigration news, and promotional content about our services. You may unsubscribe at any time.</li>
                    <li><strong>Analytics and improvement:</strong> understanding how visitors use our website to improve our content and user experience.</li>
                    <li><strong>Legal compliance:</strong> complying with applicable immigration laws, professional regulations, anti-money laundering obligations, and lawful requests from authorities.</li>
                    <li><strong>Fraud prevention and security:</strong> detecting and preventing fraudulent activity.</li>
                  </ul>
                </Section>

                <Section id="legal-basis" title="3. Legal Basis for Processing">
                  <p>We process your personal data on the following legal bases under applicable data protection law (including Malaysia's Personal Data Protection Act 2010 — "<strong>PDPA</strong>"):</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Contract performance:</strong> processing necessary to perform our consultancy agreement with you or to take steps at your request prior to entering a contract.</li>
                    <li><strong>Consent:</strong> where you have given express consent, such as for marketing emails or cookie use. You may withdraw consent at any time.</li>
                    <li><strong>Legitimate interests:</strong> where processing is necessary for our legitimate business interests (e.g. analytics, fraud prevention, improving our services), provided those interests are not overridden by your rights.</li>
                    <li><strong>Legal obligation:</strong> where we are required to process data to comply with a legal obligation.</li>
                  </ul>
                </Section>

                <Section id="sharing" title="4. Sharing of Information">
                  <p>We do not sell, rent, or trade your personal information to third parties for their own marketing purposes. We may share your information in the following circumstances:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Service providers:</strong> trusted third-party processors who assist us in operating our business — including our CRM (client management and email), cloud storage providers, and our payment processor. These providers are contractually bound to protect your data and may only use it for the services they provide to us.</li>
                    <li><strong>Immigration authorities:</strong> government departments and official bodies in Australia, Canada, Malaysia, or other relevant jurisdictions, as required to process your visa or immigration application.</li>
                    <li><strong>Professional advisers:</strong> solicitors, barristers, or other regulated professionals who need access to your information to provide legal advice in connection with your matter.</li>
                    <li><strong>Business transfers:</strong> in the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction. We will notify you before your data is transferred and becomes subject to a different privacy policy.</li>
                    <li><strong>Legal requirements:</strong> where we are legally required to disclose information by law, court order, or regulatory authority.</li>
                  </ul>
                </Section>

                <Section id="data-retention" title="5. Data Retention">
                  <p>
                    We retain your personal data for as long as necessary to fulfil the purposes for which it was collected, including for the duration of our professional engagement with you and for any legally required retention period thereafter.
                  </p>
                  <p>
                    For immigration matters, client files are generally retained for a minimum of <strong>seven (7) years</strong> after the conclusion of a matter, to comply with professional obligations, potential legal proceedings, and audit requirements.
                  </p>
                  <p>
                    Marketing contact data is retained until you withdraw consent or request deletion, whichever occurs first. Website analytics data is retained in aggregated form for up to two years.
                  </p>
                </Section>

                <Section id="cookies" title="6. Cookies & Tracking Technologies">
                  <p>Our website uses cookies and similar tracking technologies. Cookies are small text files placed on your device that help us provide a better experience.</p>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Types of cookies we use:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Essential cookies:</strong> necessary for the website to function. Cannot be disabled.</li>
                      <li><strong>Analytics cookies:</strong> help us understand how visitors interact with our site (e.g. Google Analytics). Data is aggregated and anonymous.</li>
                      <li><strong>CRM session cookie:</strong> used to link your form submissions to your browsing session for lead-source attribution in our CRM. This cookie is set when you visit our site and is referenced when you submit a form.</li>
                      <li><strong>Marketing / preference cookies:</strong> used to personalise content and ads. Only set with your consent.</li>
                    </ul>
                  </div>
                  <p>
                    You can control cookies through your browser settings. Disabling cookies may affect certain website functionality. Our website respects browser-level "Do Not Track" signals where technically feasible.
                  </p>
                </Section>

                <Section id="your-rights" title="7. Your Rights">
                  <p>Under Malaysia's Personal Data Protection Act 2010 and other applicable data protection laws, you have the following rights:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Right of access:</strong> request a copy of the personal data we hold about you.</li>
                    <li><strong>Right of correction:</strong> request that inaccurate or incomplete data be corrected.</li>
                    <li><strong>Right to withdraw consent:</strong> where processing is based on consent, withdraw it at any time without affecting the lawfulness of prior processing.</li>
                    <li><strong>Right to object:</strong> object to processing based on legitimate interests, including direct marketing.</li>
                    <li><strong>Right of erasure:</strong> request deletion of your personal data where there is no compelling reason for us to continue processing it (subject to our legal retention obligations).</li>
                    <li><strong>Right to data portability:</strong> receive a copy of your data in a structured, machine-readable format where technically feasible.</li>
                  </ul>
                  <p>
                    To exercise any of these rights, please contact us at <a href={`mailto:${EMAIL}`} className="text-primary hover:underline font-medium">{EMAIL}</a>. We will respond within 30 days. There is no charge for reasonable requests; however we may charge a reasonable fee for manifestly unfounded or excessive requests.
                  </p>
                </Section>

                <Section id="data-security" title="8. Data Security">
                  <p>
                    We implement appropriate technical and organisational measures to protect your personal data against accidental or unlawful destruction, loss, alteration, unauthorised disclosure, or access. These measures include:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Encrypted data transmission over HTTPS/TLS.</li>
                    <li>Access controls limiting who within our organisation can access client data.</li>
                    <li>Password-protected admin portals for managing lead and client data.</li>
                    <li>CV and document uploads stored in web-access-protected directories.</li>
                    <li>Regular backups of client data stored in secured environments.</li>
                  </ul>
                  <p>
                    Despite our best efforts, no method of transmission over the internet is completely secure. We cannot guarantee absolute security and encourage you to take precautions when sharing sensitive documents electronically.
                  </p>
                </Section>

                <Section id="international-transfers" title="9. International Data Transfers">
                  <p>
                    As an immigration consultancy serving clients globally and working with Australian and Canadian immigration authorities, your personal data may be transferred to and processed in countries outside Malaysia. Where such transfers occur, we ensure appropriate safeguards are in place, including standard contractual clauses or equivalent protections.
                  </p>
                  <p>
                    In particular, data submitted through our CRM may be stored on servers located outside Malaysia. Our CRM and hosting providers are certified under applicable data-transfer frameworks and maintain appropriate security standards.
                  </p>
                </Section>

                <Section id="children" title="10. Children's Privacy">
                  <p>
                    Our services are not directed to individuals under the age of 18. We do not knowingly collect personal data from children. If you are a parent or guardian and believe your child has provided us with personal data, please contact us at <a href={`mailto:${EMAIL}`} className="text-primary hover:underline font-medium">{EMAIL}</a> and we will delete it promptly.
                  </p>
                </Section>

                <Section id="third-party-links" title="11. Third-Party Links">
                  <p>
                    Our website may contain links to third-party websites, including official government immigration portals (e.g. immi.homeaffairs.gov.au, canada.ca). We are not responsible for the privacy practices of those websites and encourage you to read their privacy policies. This Privacy Policy applies solely to information collected by iMigrate Migration Solutions.
                  </p>
                </Section>

                <Section id="changes" title="12. Changes to This Privacy Policy">
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. The updated policy will be posted on this page with a revised effective date. We encourage you to review this page periodically. For material changes, we will provide more prominent notice (such as an email notification to active clients).
                  </p>
                </Section>

                <Section id="contact" title="13. Contact Us">
                  <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data-handling practices, please contact our Privacy Officer:</p>
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
                  <Link to="/terms" className="text-primary hover:underline">Terms of Service →</Link>
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
