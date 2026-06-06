/**
 * Comprehensive, SEO-optimized FAQ database for iMigrate Solutions.
 * Grouped by category. Each FAQ: { q, a, link? }
 *  - q: question (used in headings + FAQPage JSON-LD)
 *  - a: plain-text answer (used in JSON-LD schema — keep it plain text)
 *  - link (optional): { to, label } rendered as an internal "Learn more" link
 *
 * Figures (points, funds, fees, timeframes) are written as guidance and change
 * over time — answers encourage a personalised assessment for exact, current numbers.
 */
export const faqCategories = [
  {
    id: 'general',
    name: 'General Immigration',
    faqs: [
      {
        q: 'Should I migrate to Canada or Australia?',
        a: "Both Canada and Australia offer world-class, points-based skilled migration systems with strong pathways to permanent residence and citizenship. The right choice depends on your occupation, age, English ability, qualifications and family situation — an occupation in demand in one country may score better in the other. The best first step is a free assessment so we can compare your eligibility and likely timelines for each destination side by side.",
        link: { to: '/assessment', label: 'Get a free Canada vs Australia assessment' },
      },
      {
        q: 'Do I really need an immigration consultant, or can I apply myself?',
        a: 'You can lodge many applications yourself, but immigration rules change frequently and small mistakes — a wrong occupation code, a weak skills assessment, or missing evidence — can cost you points, money, or a refusal that affects future applications. A professional immigration consultant maximises your points, chooses the strongest visa pathway for your profile, and prepares a complete, well-evidenced application the first time.',
      },
      {
        q: 'What does an immigration consultant actually do?',
        a: 'A good immigration consultant assesses your eligibility, recommends the best visa pathway, helps you maximise your points score, manages your skills assessment and English testing strategy, prepares and reviews your documentation, lodges your application correctly, and supports you through to the visa grant. We act as your single point of contact and keep your case on track from the first assessment to settlement.',
        link: { to: '/services', label: 'See our immigration services' },
      },
      {
        q: 'How do I know if I am eligible to migrate to Australia or Canada?',
        a: 'Eligibility for skilled migration generally depends on your age, English language ability, skilled work experience, qualifications and whether your occupation is in demand. The fastest way to find out is to complete our free online assessment or use our points calculator — then our consultants confirm your real options and the strongest pathway for your profile.',
        link: { to: '/assessment', label: 'Check your eligibility for free' },
      },
      {
        q: 'How long does the whole immigration process take?',
        a: 'Timeframes vary widely by visa type and your individual circumstances. As a guide, fast skilled pathways such as Canada Express Entry can finalise in around six months after an invitation, while points-tested Australian visas, partner visas and business visas can take many months to a couple of years including preparation. We give you a realistic, personalised timeline at your consultation.',
      },
      {
        q: 'Can my family migrate with me?',
        a: 'Yes. Most skilled and business visas for both Australia and Canada let you include your spouse or partner and dependent children in the same application, and they receive the same residence rights. Partner and family sponsorship visas are also available to reunite families. We make sure every eligible family member is included correctly.',
      },
      {
        q: 'Will I get permanent residence (PR) straight away?',
        a: 'It depends on the pathway. Some visas — such as the Australian Subclass 189/190 and most Canada Express Entry programs — grant permanent residence immediately. Others, like the Australian Subclass 491 or many work permits, are provisional or temporary and lead to PR after you meet certain conditions. We always explain whether a pathway is direct PR or a staged route before you commit.',
      },
      {
        q: 'Do I need a job offer to migrate?',
        a: 'Not always. Many of the most popular pathways — the Australian Subclass 189 and Canada Express Entry — do not require a job offer. A job offer or employer sponsorship can add points or open additional visa options, but it is not essential for skilled independent migration.',
      },
      {
        q: 'Is now a good time to apply for immigration?',
        a: 'Immigration programs, occupation lists and points cut-offs change regularly, so the best time to apply is usually as soon as you are eligible — waiting can mean rule changes, an older age (which reduces points), or expired test results. Starting your assessment early gives you time to improve your profile and act quickly when the right opportunity opens.',
        link: { to: '/book-appointment', label: 'Book a free consultation' },
      },
    ],
  },

  {
    id: 'canada',
    name: 'Canada Immigration',
    faqs: [
      {
        q: 'What is Canada Express Entry and how does it work?',
        a: 'Express Entry is the Canadian government\'s online system for managing skilled-worker applications for permanent residence under three programs: the Federal Skilled Worker Program, the Canadian Experience Class and the Federal Skilled Trades Program. You create a profile, receive a Comprehensive Ranking System (CRS) score, and the highest-ranked candidates are invited to apply for Canada PR in regular draws — often finalising in around six months after an invitation.',
        link: { to: '/canada-immigration#express-entry', label: 'Learn about Canada Express Entry' },
      },
      {
        q: 'What is a good CRS score for Express Entry?',
        a: 'There is no fixed pass mark — the cut-off changes with each draw. Recent general draws have often landed in the 470–540 range, while category-based and provincial draws can be lower. Because a Provincial Nominee Program nomination adds 600 points, candidates with lower CRS scores can still secure an invitation through a PNP. Use our CRS calculator to estimate your score, then book an expert review.',
        link: { to: '/assessment#calculator', label: 'Estimate your CRS score' },
      },
      {
        q: 'What is a Provincial Nominee Program (PNP)?',
        a: 'A Provincial Nominee Program lets a Canadian province or territory nominate skilled workers who want to settle there and meet local labour-market needs. An Express Entry-aligned ("enhanced") nomination adds 600 CRS points and effectively guarantees an invitation, while "base" streams are processed directly by the province. PNPs are one of the most powerful routes to Canada PR for candidates whose CRS is below recent cut-offs.',
        link: { to: '/canada-immigration#pnp', label: 'Explore Provincial Nominee Programs' },
      },
      {
        q: 'Do I need a job offer for Canada PR?',
        a: 'No, a job offer is not mandatory for Canada PR through Express Entry. Many candidates are invited with no Canadian job offer. However, a valid job offer can add CRS points and a provincial nomination or an LMIA-backed offer can significantly strengthen your application.',
      },
      {
        q: 'What is an LMIA and do I need one?',
        a: 'A Labour Market Impact Assessment (LMIA) is a document a Canadian employer obtains to show that hiring a foreign worker will not negatively affect the local labour market. Many employer-specific work permits require a positive LMIA, and an LMIA-backed job offer can also add CRS points toward Express Entry. Some roles are LMIA-exempt under the International Mobility Program (for example intra-company transfers).',
      },
      {
        q: 'How do I get a Canada work permit?',
        a: 'A Canadian work permit is usually either employer-specific (tied to one employer, often requiring an LMIA) or open (not tied to a specific employer, such as a spouse or post-graduation work permit). Securing a genuine job offer is the first step for employer-specific permits. Canadian work experience is also highly valuable because it counts toward the Canadian Experience Class and many PNP streams.',
        link: { to: '/canada-immigration#work-permits', label: 'See Canada work permit options' },
      },
      {
        q: 'What is the C11 Entrepreneur Work Permit?',
        a: 'The C11 is an LMIA-exempt work permit for foreign entrepreneurs and self-employed individuals who will own and actively operate a business that provides significant economic, social or cultural benefit to Canada. It suits business owners who want to establish or buy a business in Canada and can be a stepping stone toward permanent residence. A strong, credible business plan and proof of funds are essential — we help structure the application properly.',
        link: { to: '/contact', label: 'Ask about the C11 work permit' },
      },
      {
        q: 'How can I immigrate to Canada as a business owner or investor?',
        a: 'Canada welcomes entrepreneurs and investors through the federal Start-up Visa Program, the Self-Employed Persons Program, provincial entrepreneur streams, and work-permit routes such as the C11 and intra-company transfer. The Start-up Visa grants permanent residence to founders of innovative businesses backed by a designated organisation. The right option depends on your capital, business experience and goals.',
        link: { to: '/canada-immigration#business-startup', label: 'Explore Canada business immigration' },
      },
      {
        q: 'How do I get Canadian permanent residence (PR)?',
        a: 'The main routes to Canada PR are Express Entry (federal skilled programs), Provincial Nominee Programs, family sponsorship, and business/start-up pathways. Each has its own eligibility criteria covering work experience, language, education and funds. We assess your profile against every program and recommend the fastest, most reliable route to your PR.',
        link: { to: '/canada-immigration', label: 'View all Canada PR pathways' },
      },
      {
        q: 'Can I sponsor my spouse or family to immigrate to Canada?',
        a: 'Yes. Canadian citizens and permanent residents can sponsor a spouse, common-law or conjugal partner, dependent children, and in some cases parents and grandparents. Spousal sponsorship requires strong, genuine relationship evidence, and the sponsor agrees to support the family member financially for a set period. Many inland spousal applicants can also apply for an open work permit while their application is processed.',
        link: { to: '/canada-immigration#family-sponsorship', label: 'Learn about family sponsorship' },
      },
      {
        q: 'How do I get a Canada study permit?',
        a: 'To study in Canada you generally need an acceptance letter (Letter of Acceptance) from a Designated Learning Institution (DLI), proof of sufficient funds, a Provincial Attestation Letter where required, and a genuine intention to study. A Canadian education plus a Post-Graduation Work Permit can build a strong pathway to permanent residence.',
        link: { to: '/canada-immigration#study-permit', label: 'See Canada study permit details' },
      },
      {
        q: 'Can I work while studying in Canada?',
        a: 'Yes. Study permit holders can usually work part-time during the academic session and full-time during scheduled breaks, subject to current government limits. After graduating from an eligible program you may qualify for a Post-Graduation Work Permit (PGWP) of up to three years, which is valuable for permanent residence.',
      },
      {
        q: 'How do I apply for a Canada visitor visa?',
        a: 'A visitor visa (Temporary Resident Visa) or an eTA lets you visit Canada temporarily for tourism, family visits or business. You must show genuine temporary intent, sufficient funds, and ties to your home country. We help present a strong, well-documented application to reduce the risk of refusal.',
      },
      {
        q: 'What are the language requirements for Canada immigration?',
        a: 'Most economic programs require an approved English (IELTS/CELPIP) or French (TEF/TCF) test, measured in Canadian Language Benchmarks (CLB). Express Entry generally needs at least CLB 7, and higher results substantially boost your CRS score. Strong French can add valuable bonus points even if English is your main language.',
      },
      {
        q: 'How much money do I need to immigrate to Canada (settlement funds)?',
        a: 'Express Entry requires proof of settlement funds unless you have a valid job offer or are already authorised to work in Canada. The required amount depends on your family size and is updated each year by the government. We confirm the current figure for your situation and advise how to evidence your funds correctly.',
      },
      {
        q: 'How long does Canada PR take to process?',
        a: 'After receiving an Invitation to Apply through Express Entry, complete PR applications are commonly processed in around six months. PNP base streams and family sponsorship can take longer — often 12 months or more. Preparation time before you apply (language tests, ECA, documents) is additional, so starting early matters.',
      },
      {
        q: 'How much does Canada immigration cost?',
        a: 'Costs typically include government processing fees, the right-of-permanent-residence fee, language testing, an Educational Credential Assessment, medicals, police clearances, and professional service fees. The total varies by program and family size. We give you a clear, itemised breakdown upfront — with no hidden charges and flexible pay-as-you-go options.',
        link: { to: '/contact', label: 'Request a cost breakdown' },
      },
      {
        q: 'Why are Canada visa applications refused?',
        a: 'Common reasons for refusal include insufficient or inconsistent documentation, weak proof of funds, doubts about genuine temporary intent (for visitor and study permits), failing to meet program criteria, or errors in the application. Many refusals are avoidable with proper preparation — our role is to identify and fix weaknesses before you lodge.',
      },
    ],
  },

  {
    id: 'australia',
    name: 'Australia Immigration',
    faqs: [
      {
        q: 'How does Australia skilled migration work?',
        a: 'Australia uses a points-tested system for skilled migration. You nominate an occupation on the relevant skilled occupation list, obtain a positive skills assessment, sit an English test, and submit an Expression of Interest (EOI) through SkillSelect. The highest-ranked candidates are invited to apply for visas such as the Subclass 189, 190 or 491. A minimum of 65 points is required, but competitive scores are usually higher.',
        link: { to: '/australia-migration', label: 'Explore Australia skilled migration' },
      },
      {
        q: 'What is the Subclass 189 visa?',
        a: 'The Skilled Independent visa (Subclass 189) is a points-tested permanent residence visa for skilled workers who are not sponsored by an employer, state or family member. It gives you full freedom to live and work anywhere in Australia, includes your family, and provides a direct pathway to citizenship. Selection is invitation-based through SkillSelect.',
        link: { to: '/australia-migration#subclass-189', label: 'Subclass 189 full details' },
      },
      {
        q: 'What is the Subclass 190 visa?',
        a: 'The Skilled Nominated visa (Subclass 190) is a points-tested permanent residence visa requiring nomination by an Australian state or territory. State nomination adds 5 points to your score, which can be decisive for being invited. In return, you commit to living and working in the nominating state for an initial period.',
        link: { to: '/australia-migration#subclass-190', label: 'Subclass 190 full details' },
      },
      {
        q: 'What is the Subclass 491 visa?',
        a: 'The Skilled Work Regional (Provisional) visa (Subclass 491) is a five-year visa for skilled workers nominated by a state/territory or sponsored by an eligible relative in regional Australia. It awards 15 bonus points — the largest available — and provides a direct pathway to permanent residence through the Subclass 191 visa after three years of regional living and meeting income requirements.',
        link: { to: '/australia-migration#subclass-491', label: 'Subclass 491 full details' },
      },
      {
        q: 'How many points do I need for Australia PR?',
        a: 'You need a minimum of 65 points to be eligible, but because invitations go to the highest-ranked candidates, competitive scores are often 85–95+ depending on your occupation. Points come from age, English, skilled employment, qualifications, study in Australia, and state/regional nomination. Our points calculator gives you an instant estimate.',
        link: { to: '/assessment#calculator', label: 'Use the Australia points calculator' },
      },
      {
        q: 'What is a skills assessment and do I need one?',
        a: 'A skills assessment is a mandatory evaluation by the assessing authority for your occupation (for example ACS, Engineers Australia, VETASSESS or CPA) confirming that your qualifications and experience meet Australian standards. You must have a positive skills assessment before you can be invited to apply for most skilled visas. Choosing the correct occupation and assessing authority is critical — we guide this step carefully.',
      },
      {
        q: 'What is state nomination and how do I get it?',
        a: 'State or territory nomination is when an Australian state government nominates you for a Subclass 190 or 491 visa, adding 5 or 15 points respectively. Each state publishes its own occupation lists and criteria targeting local skill shortages, and you usually submit an Expression of Interest plus a separate state application. We match your profile to the states most likely to nominate you.',
      },
      {
        q: 'What are employer sponsored visas in Australia?',
        a: 'Employer sponsored visas let an approved Australian business sponsor a skilled worker. The main options are the Temporary Skill Shortage visa (Subclass 482), the Employer Nomination Scheme (Subclass 186, permanent), and the Skilled Employer Sponsored Regional visa (Subclass 494). They suit candidates who have, or can secure, a genuine job offer and provide clear pathways to permanent residence.',
        link: { to: '/australia-migration#employer-sponsored', label: 'See employer sponsored visas' },
      },
      {
        q: 'How do Australian partner visas work?',
        a: 'Partner visas let the spouse or de facto partner of an Australian citizen, permanent resident or eligible New Zealand citizen live in Australia. They are generally granted in two stages — a temporary visa followed by a permanent visa around two years later — and require strong evidence of a genuine, continuing relationship.',
        link: { to: '/australia-migration#partner-visa', label: 'Learn about partner visas' },
      },
      {
        q: 'Can I migrate to Australia through business or investment?',
        a: 'Yes. The Business Innovation and Investment Program is for successful business owners, senior managers and investors. It offers provisional visas leading to permanent residence for those who establish or invest in a qualifying business or make a designated investment. Eligibility depends on your business/investment track record, assets and a genuine commitment to Australia.',
        link: { to: '/australia-migration#business-investor', label: 'Explore business & investor migration' },
      },
      {
        q: 'What are the English language requirements for Australia?',
        a: 'Most skilled visas require at least Competent English (for example IELTS 6.0 in each band, or equivalent PTE/TOEFL). Higher levels are rewarded with points: Proficient English (IELTS 7.0) adds 10 points and Superior English (IELTS 8.0) adds 20 points — often the easiest way to lift a borderline score.',
      },
      {
        q: 'What are the Australian occupation lists?',
        a: 'Your nominated occupation must appear on the relevant skilled occupation list, which determines the visas you can apply for. The lists are reviewed periodically and differ by visa and by state. Selecting the right occupation that matches both your experience and an eligible list is one of the most important decisions in your application.',
      },
      {
        q: 'How long does an Australian PR visa take to process?',
        a: 'After you receive an invitation and lodge a complete application, processing for points-tested skilled visas commonly takes several months to around a year, depending on demand and how complete your documentation is. Preparation beforehand — skills assessment and English testing — adds time, so an early start is an advantage.',
      },
      {
        q: 'How much does it cost to migrate to Australia?',
        a: 'Costs generally include the Department of Home Affairs visa application charge, skills assessment fees, English testing, health examinations, police checks, and professional service fees. The visa charge alone is significant and rises for included family members. We provide a transparent, itemised quote upfront with flexible pay-as-you-go options.',
        link: { to: '/contact', label: 'Request an Australia cost estimate' },
      },
      {
        q: 'What is the Australia points calculator?',
        a: 'The points calculator estimates your score under the General Skilled Migration points test based on your age, English, work experience, qualifications and nomination. It gives you an instant indication of whether you meet the 65-point minimum and how competitive you are. It is a guide only — book an expert review for an accurate assessment.',
        link: { to: '/assessment#calculator', label: 'Try the points calculator' },
      },
      {
        q: 'Why are Australian visa applications refused?',
        a: 'Common reasons include an incorrect occupation or failed skills assessment, claiming points that cannot be evidenced, insufficient English results, incomplete documentation, or health and character issues. Most refusals stem from avoidable errors — a thorough, professionally prepared application greatly reduces the risk.',
      },
    ],
  },

  {
    id: 'assessment',
    name: 'Assessment & Consultation',
    faqs: [
      {
        q: 'What is a free visa assessment?',
        a: 'Our free visa assessment is a no-obligation review of your profile — age, occupation, qualifications, experience and English — to identify which Australian and Canadian visa pathways you may qualify for. You complete a short online form or use our points calculators, and our consultants follow up with personalised options.',
        link: { to: '/assessment', label: 'Start your free assessment' },
      },
      {
        q: 'What happens during a consultation?',
        a: 'In a consultation, a senior consultant reviews your eligibility in detail, explains the most suitable visa options and timelines, identifies ways to maximise your points, and answers your specific questions. You leave with a clear understanding of your best pathway and the next steps.',
        link: { to: '/book-appointment', label: 'Book a free consultation' },
      },
      {
        q: 'Is the initial assessment really free?',
        a: 'Yes. Your initial eligibility assessment is completely free and carries no obligation. It helps you understand your options before deciding whether to engage our services, and helps us understand your case so any advice we give is accurate and tailored.',
      },
      {
        q: 'What information do I need for an assessment?',
        a: 'To get the most accurate assessment, have your age, nationality, occupation and years of experience, highest qualification, and any English test results ready. You can also upload your CV/resume so our consultants can review your background in detail. Nothing needs to be certified at this stage.',
        link: { to: '/assessment', label: 'Complete the assessment form' },
      },
      {
        q: 'How accurate is the online points calculator?',
        a: 'Our Australia points and Canada CRS calculators give a reliable indicative estimate based on the information you enter, but they are not an official assessment. Final eligibility depends on a verified skills assessment, test results and document checks — book an expert review to confirm your real score.',
      },
      {
        q: 'Can you assess me for both Canada and Australia?',
        a: 'Absolutely. Many clients are eligible for both countries, and we routinely compare your options side by side so you can choose the destination with the best fit, fastest timeline and strongest chance of success.',
        link: { to: '/assessment', label: 'Get a dual-country assessment' },
      },
    ],
  },

  {
    id: 'fees',
    name: 'Fees & Payment',
    faqs: [
      {
        q: 'How much do your immigration services cost?',
        a: 'Our professional fees depend on the complexity of your visa pathway and the services you need. We always agree a clear, fixed fee upfront before any work begins, so you know exactly what you are paying for. Government charges, skills assessment and testing fees are separate and itemised in your quote.',
        link: { to: '/contact', label: 'Request a personalised quote' },
      },
      {
        q: 'Do you offer a pay-as-you-go option?',
        a: 'Yes. We offer flexible, stage-by-stage pay-as-you-go payments so you can spread the cost of your application across milestones rather than paying a large amount upfront. This keeps the process affordable and transparent.',
      },
      {
        q: 'What is your money-back guarantee?',
        a: 'We stand behind our process with a 100% money-back guarantee: if you engage us for a service you are not actually eligible for, you get your money back. It reflects our commitment to honest, accurate advice — we will never take on a case we do not believe in.',
        link: { to: '/about', label: 'Read about our guarantees' },
      },
      {
        q: 'Are government fees included in your fees?',
        a: 'No. Government visa application charges, skills assessment fees, English testing, medicals and police checks are paid to third parties and are separate from our professional service fee. We list every expected cost in your quote so there are no surprises.',
      },
      {
        q: 'Are there any hidden charges?',
        a: 'None. Transparent, fixed pricing agreed upfront is one of our core promises — you always know exactly what you are paying for, with every cost itemised before you commit.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept major secure payment methods and can arrange milestone-based instalments under our pay-as-you-go option. Contact our team to discuss the most convenient arrangement for you.',
        link: { to: '/contact', label: 'Discuss payment options' },
      },
    ],
  },

  {
    id: 'process',
    name: 'Process & Documentation',
    faqs: [
      {
        q: 'What documents will I need for my visa application?',
        a: 'Typical documents include your passport, qualifications and transcripts, detailed work references, an English (or French) test result, a skills assessment or credential evaluation, proof of funds, and police and medical clearances. The exact list depends on your visa — we provide a tailored, step-by-step document checklist so nothing is missed.',
      },
      {
        q: 'Do my documents need to be translated or certified?',
        a: 'Documents not in English (or French, for Canada) usually need a certified translation, and many documents must be certified copies. Requirements vary by country and document type. We tell you exactly what needs translating or certifying and how, to meet official standards.',
      },
      {
        q: 'What is a police clearance or character requirement?',
        a: 'Both Australia and Canada require applicants (and adult family members) to meet character requirements, usually evidenced by police clearance certificates from every country you have lived in for a significant period. We help you obtain the correct certificates at the right time so they remain valid at decision.',
      },
      {
        q: 'What are the health or medical requirements?',
        a: 'Most permanent and many temporary visas require a health examination by an approved panel physician to meet health criteria. The check typically includes a medical exam and, in some cases, x-rays and blood tests. We coordinate the timing so your medicals stay valid through to grant.',
      },
      {
        q: 'How long are documents and test results valid?',
        a: 'Validity varies: English test results are generally valid for around two to three years, skills assessments for up to three years, and police and medical checks for about 12 months. Because these expiry dates affect your timeline, we plan your application sequence so nothing expires before a decision.',
      },
      {
        q: 'What happens after I submit my application?',
        a: 'After lodgement, the relevant department reviews your application, may request additional information, and conducts character and health checks before making a decision. We monitor your case, respond to any requests promptly, and keep you updated at every stage through to the grant.',
      },
      {
        q: 'What happens if my application is refused?',
        a: 'Depending on the visa and country, you may have options to request a review, appeal, or re-apply with a stronger application. The best protection is a complete, well-evidenced application the first time. If you have had a previous refusal, we can review what went wrong and advise on the most realistic way forward.',
        link: { to: '/contact', label: 'Speak to us about a refusal' },
      },
    ],
  },
];

export default faqCategories;
