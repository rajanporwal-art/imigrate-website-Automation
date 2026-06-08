import {
  Globe,
  Building2,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  TrendingUp,
} from 'lucide-react';

/**
 * Content model for each Australia visa category.
 *  - id        : anchor / route hash target
 *  - title     : SEO-optimized H2 heading
 *  - badge     : visa subclass / short label
 *  - icon      : lucide icon component
 *  - tagline   : one-line value statement
 *  - overview  : intro paragraph(s)
 *  - details   : flexible content blocks [{ heading, points[] }]
 *  - benefits  : permanent residence / lifestyle benefits (string[])
 *  - keyRequirements : quick-glance checklist (string[])
 *  - processing : ordered processing overview [{ title, desc }]
 *  - faqs      : [{ q, a }]
 */
export const australiaVisas = [
  {
    id: 'subclass-189',
    pr: true,
    title: 'Skilled Independent Visa (Subclass 189)',
    badge: 'Subclass 189',
    icon: Globe,
    tagline: 'Permanent residence for skilled workers — no employer or state sponsorship required.',
    overview:
      'The Skilled Independent Visa (Subclass 189) is a points-tested permanent residence visa for skilled workers who are not sponsored by an employer, a state or territory, or a family member. It is one of the most sought-after Australia PR visas because it gives you complete freedom to live and work anywhere in Australia, indefinitely. Selection is invitation-based through the SkillSelect Expression of Interest (EOI) system.',
    details: [
      {
        heading: 'What is the Subclass 189 visa?',
        points: [
          'A permanent residence (PR) visa granted on the strength of your skills, age, English ability and experience.',
          'No sponsorship, nomination or job offer is required.',
          'Lets you live, work and study anywhere in Australia with no geographic restrictions.',
          'Includes a pathway to Australian citizenship once residency requirements are met.',
        ],
      },
      {
        heading: 'Eligibility Criteria',
        points: [
          'Be under 45 years of age at the time of invitation.',
          'Nominate an occupation on the relevant Skilled Occupation List (MLTSSL).',
          'Obtain a positive skills assessment from the relevant assessing authority.',
          'Score at least 65 points on the points test (competitive scores are usually higher).',
          'Demonstrate Competent English or above.',
          'Meet health and character requirements.',
        ],
      },
      {
        heading: 'Skills Assessment',
        points: [
          'Your nominated occupation must be assessed as suitable by the designated assessing authority (e.g. EA, ACS, VETASSESS, CPA).',
          'The assessment verifies that your qualifications and work experience meet Australian standards.',
          'A positive skills assessment is mandatory before you can be invited to apply.',
        ],
      },
      {
        heading: 'English Language Requirements',
        points: [
          'Minimum Competent English (e.g. IELTS 6.0 in each band or equivalent PTE/TOEFL).',
          'Proficient English (IELTS 7.0) earns 10 additional points.',
          'Superior English (IELTS 8.0) earns 20 additional points — a major scoring lever.',
        ],
      },
      {
        heading: 'Points Test Requirements',
        points: [
          'Age (maximum 30 points for ages 25–32).',
          'English language ability (up to 20 points).',
          'Skilled employment — Australian and overseas experience (up to 20 points).',
          'Educational qualifications (up to 20 points).',
          'Additional points for Australian study, NAATI credentials, professional year and a skilled partner.',
        ],
      },
    ],
    benefits: [
      'Full permanent residence from the day your visa is granted.',
      'Live, work and study anywhere in Australia.',
      'Access to Medicare — Australia\'s public health system.',
      'Sponsor eligible family members for permanent residence.',
      'Enrol children in school as domestic students.',
      'Clear pathway to Australian citizenship.',
    ],
    keyRequirements: [
      'Age under 45 at invitation',
      'Positive skills assessment (MLTSSL occupation)',
      'Minimum 65 points',
      'Competent English or higher',
      'Health & character clearance',
    ],
    processing: [
      { title: 'Skills assessment & English test', desc: 'Secure a positive skills assessment and sit an approved English test.' },
      { title: 'Submit an Expression of Interest (EOI)', desc: 'Lodge your EOI in SkillSelect with your claimed points.' },
      { title: 'Receive an Invitation to Apply (ITA)', desc: 'Highest-ranked candidates are invited in periodic rounds.' },
      { title: 'Lodge the visa application', desc: 'Submit your application with supporting documents within 60 days of the invitation.' },
      { title: 'Decision & grant', desc: 'Department processing typically takes several months once lodged.' },
    ],
    faqs: [
      { q: 'How many points do I need for a Subclass 189 visa?', a: 'The minimum is 65 points, but invitations are issued to the highest-ranking candidates, so a competitive score is often 85–90+ depending on your occupation.' },
      { q: 'Do I need a job offer for the 189 visa?', a: 'No. The Skilled Independent visa is completely independent — no employer, state or family sponsorship is required.' },
      { q: 'Is the Subclass 189 a permanent visa?', a: 'Yes. It grants permanent residence immediately on grant, with full work and study rights anywhere in Australia.' },
      { q: 'How long does the 189 visa take to process?', a: 'After you receive an invitation and lodge a complete application, processing commonly takes around 5–12 months, subject to demand and document completeness.' },
    ],
  },
  {
    id: 'subclass-190',
    pr: true,
    title: 'Skilled Nominated Visa (Subclass 190)',
    badge: 'Subclass 190',
    icon: Building2,
    tagline: 'Permanent residence with state or territory nomination and 5 bonus points.',
    overview:
      'The Skilled Nominated Visa (Subclass 190) is a points-tested permanent residence visa for skilled workers who are nominated by an Australian state or territory government. State nomination awards an additional 5 points, which can be decisive for being invited. In return, you commit to living and working in the nominating state or territory for a period after arrival.',
    details: [
      {
        heading: 'What is the Subclass 190 visa?',
        points: [
          'A permanent residence visa requiring nomination by a participating state or territory.',
          'State nomination adds 5 points to your points-test score.',
          'You generally agree to settle in the nominating state for around the first two years.',
        ],
      },
      {
        heading: 'State Nomination Process',
        points: [
          'Choose a state/territory whose skilled occupation list includes your occupation.',
          'Submit an Expression of Interest (EOI) in SkillSelect and a separate state nomination application.',
          'Each state sets its own eligibility thresholds, occupation lists and ranking criteria.',
          'If nominated, you receive an invitation to apply for the visa.',
        ],
      },
      {
        heading: 'Eligibility Requirements',
        points: [
          'Be under 45 years of age at invitation.',
          'Have a positive skills assessment in a nominated occupation.',
          'Score at least 65 points (including the 5 nomination points).',
          'Meet Competent English and the specific requirements of the nominating state.',
          'Satisfy health and character requirements.',
        ],
      },
      {
        heading: 'Occupation Requirements',
        points: [
          'Your occupation must appear on the nominating state/territory\'s skilled occupation list.',
          'States prioritise occupations that address local skill shortages.',
          'Some states require demonstrated work experience or a job offer within the state.',
        ],
      },
    ],
    benefits: [
      'Permanent residence on grant.',
      'Extra 5 points to boost your ranking.',
      'Access to Medicare and social services.',
      'Include partner and dependent children in your application.',
      'Pathway to Australian citizenship.',
      'Settlement support in regions actively seeking your skills.',
    ],
    keyRequirements: [
      'State / territory nomination',
      'Age under 45 at invitation',
      'Positive skills assessment',
      'Minimum 65 points (incl. nomination)',
      'Commitment to the nominating state',
    ],
    processing: [
      { title: 'Skills assessment & English', desc: 'Obtain a positive skills assessment and approved English results.' },
      { title: 'Lodge EOI + state nomination', desc: 'Submit an EOI and apply to your chosen state or territory.' },
      { title: 'Receive nomination & invitation', desc: 'On approval the state nominates you and you are invited to apply.' },
      { title: 'Lodge the visa application', desc: 'Apply within 60 days of the invitation with full documentation.' },
      { title: 'Grant & relocate', desc: 'After grant, settle and work in the nominating state.' },
    ],
    faqs: [
      { q: 'What is the difference between the 189 and 190 visa?', a: 'Both are permanent. The 189 requires no sponsorship, while the 190 requires state/territory nomination, which adds 5 points but asks you to live in that state initially.' },
      { q: 'Can I move to another state after getting a 190 visa?', a: 'The 190 is legally a national PR visa, but you make a moral commitment to live and work in the nominating state — usually for about two years.' },
      { q: 'Does state nomination guarantee a visa?', a: 'No. Nomination gives you the 5 points and an invitation, but the visa is still assessed by the Department of Home Affairs against all criteria.' },
      { q: 'Which states are easiest for 190 nomination?', a: 'It depends entirely on your occupation and points. Our consultants match your profile to the states most likely to nominate you.' },
    ],
  },
  {
    id: 'subclass-491',
    pr: true,
    title: 'Skilled Work Regional (Provisional) Visa (Subclass 491)',
    badge: 'Subclass 491',
    icon: MapPin,
    tagline: 'Live and work in regional Australia with a 5-year pathway to permanent residence.',
    overview:
      'The Skilled Work Regional (Provisional) Visa (Subclass 491) is a 5-year provisional visa for skilled workers who want to live and work in regional Australia. It is nominated by a state or territory government or sponsored by an eligible relative living in a designated regional area, and provides a direct pathway to permanent residence through the Subclass 191 visa.',
    details: [
      {
        heading: 'Regional Migration Benefits',
        points: [
          'An extra 15 points for regional nomination or family sponsorship — the largest single points boost available.',
          'Lower competition and more accessible occupation lists than metropolitan pathways.',
          'Access to a wider range of occupations in demand across regional Australia.',
          'A clear, structured route to permanent residence.',
        ],
      },
      {
        heading: 'Eligibility',
        points: [
          'Be under 45 years of age at invitation.',
          'Have a positive skills assessment in a nominated occupation.',
          'Score at least 65 points (including the 15 regional points).',
          'Be nominated by a state/territory or sponsored by an eligible relative.',
          'Meet Competent English, health and character requirements.',
        ],
      },
      {
        heading: 'State / Territory Nomination',
        points: [
          'Most Australian states and territories (outside major metro areas) participate.',
          'Each region publishes its own occupation lists and criteria targeting local shortages.',
          'You commit to living, working and studying only in a designated regional area.',
        ],
      },
      {
        heading: 'Family Sponsorship Option',
        points: [
          'An eligible relative who is an Australian citizen or permanent resident living in a designated regional area can sponsor you.',
          'Eligible relatives include a parent, child, sibling, aunt/uncle, niece/nephew or grandparent.',
          'Family sponsorship also awards the 15 regional points.',
        ],
      },
      {
        heading: 'Pathway to Permanent Residence',
        points: [
          'After holding the 491 for at least 3 years, you can apply for the Subclass 191 permanent visa.',
          'You must have lived in a designated regional area and met a minimum taxable income requirement.',
          'The 191 grants full permanent residence with no further regional condition.',
        ],
      },
    ],
    benefits: [
      'Five-year provisional visa with full work rights.',
      'Up to 15 bonus points — a significant advantage.',
      'Access to Medicare during the provisional period.',
      'Bring your family with you to regional Australia.',
      'Direct pathway to permanent residence (Subclass 191).',
      'Lower cost of living and strong community lifestyle.',
    ],
    keyRequirements: [
      'Regional nomination or eligible family sponsor',
      'Age under 45 at invitation',
      'Positive skills assessment',
      'Minimum 65 points (incl. +15)',
      'Live & work in a designated regional area',
    ],
    processing: [
      { title: 'Skills assessment & English', desc: 'Secure a positive assessment and approved English results.' },
      { title: 'EOI + regional nomination / sponsorship', desc: 'Lodge an EOI and apply for state nomination or family sponsorship.' },
      { title: 'Invitation to apply', desc: 'Receive an invitation once nominated or sponsored.' },
      { title: 'Lodge the 491 application', desc: 'Apply for the provisional visa with full documentation.' },
      { title: 'Transition to PR (191)', desc: 'After 3 years of regional living and income, apply for permanent residence.' },
    ],
    faqs: [
      { q: 'Is the Subclass 491 a permanent visa?', a: 'No, it is a 5-year provisional visa, but it provides a direct pathway to permanent residence through the Subclass 191 visa after three years.' },
      { q: 'What counts as regional Australia?', a: 'Designated regional areas now include everywhere in Australia except Sydney, Melbourne and Brisbane. Many attractive cities such as Perth, Adelaide, the Gold Coast and Canberra qualify.' },
      { q: 'How many extra points does the 491 give?', a: 'Regional state nomination or eligible family sponsorship awards 15 points — the largest points boost of any skilled pathway.' },
      { q: 'What income do I need for the 191 PR visa?', a: 'You must meet a minimum taxable income threshold for at least three years while holding the 491 visa. Our team helps you plan to meet this requirement.' },
    ],
  },
  {
    id: 'employer-sponsored',
    pr: false,
    title: 'Australia Employer Sponsored Visas',
    badge: 'Subclasses 482 / 186 / 494',
    icon: Briefcase,
    tagline: 'Work for an approved Australian employer — temporary and permanent options.',
    overview:
      'Australia\'s employer sponsored visas allow approved Australian businesses to sponsor skilled overseas workers when they cannot fill a position locally. These visas include temporary skill shortage options and direct permanent residence pathways, making them ideal for candidates who already have — or can secure — a genuine job offer from an Australian employer.',
    details: [
      {
        heading: 'Overview of Employer Sponsored Visas',
        points: [
          'Temporary Skill Shortage visa (Subclass 482) — work for an approved sponsor for up to 4 years.',
          'Employer Nomination Scheme (Subclass 186) — permanent residence through employer nomination.',
          'Skilled Employer Sponsored Regional (Subclass 494) — regional employer sponsorship with a PR pathway.',
        ],
      },
      {
        heading: 'Employer Sponsorship Process',
        points: [
          'The employer becomes an approved Standard Business Sponsor.',
          'The employer nominates a genuine, full-time skilled position.',
          'The employer must meet labour market testing and salary (TSMIT) obligations.',
          'You apply for the visa linked to that nomination.',
        ],
      },
      {
        heading: 'Eligible Occupations',
        points: [
          'Your occupation must be on the relevant skilled occupation list for the visa stream.',
          'A positive skills assessment may be required depending on occupation and stream.',
          'Occupations span healthcare, engineering, IT, trades, hospitality management and more.',
        ],
      },
      {
        heading: 'Temporary and Permanent Options',
        points: [
          'Start on a Subclass 482 and transition to permanent residence via the 186 Temporary Residence Transition stream.',
          'Eligible candidates can apply directly for the 186 Direct Entry stream.',
          'The 494 offers a regional route to PR through the Subclass 191 visa.',
        ],
      },
    ],
    benefits: [
      'Secure a recognised job before or soon after arriving.',
      'Clear progression from temporary to permanent residence.',
      'Include your partner and children, who gain work and study rights.',
      'Access to Medicare on permanent streams.',
      'Employer support throughout the relocation process.',
      'Pathway to Australian citizenship via the permanent streams.',
    ],
    keyRequirements: [
      'Genuine job offer from an approved sponsor',
      'Occupation on the relevant list',
      'Relevant skills & experience',
      'Competent English',
      'Health & character clearance',
    ],
    processing: [
      { title: 'Secure a sponsoring employer', desc: 'Obtain a genuine job offer from an approved Australian business.' },
      { title: 'Sponsorship & nomination', desc: 'The employer lodges sponsorship and nominates your position.' },
      { title: 'Lodge your visa application', desc: 'Apply for the 482, 186 or 494 linked to the nomination.' },
      { title: 'Decision & arrival', desc: 'On grant, begin work for your sponsoring employer in Australia.' },
      { title: 'Transition to PR', desc: 'Move from a temporary visa to permanent residence when eligible.' },
    ],
    faqs: [
      { q: 'Do I need a job offer for an employer sponsored visa?', a: 'Yes. A genuine job offer and nomination from an approved Australian sponsor is the foundation of every employer sponsored visa.' },
      { q: 'Can a 482 visa lead to permanent residence?', a: 'Yes. After working for your sponsor, you can usually transition to the Subclass 186 permanent visa through the Temporary Residence Transition stream.' },
      { q: 'How long does employer sponsorship take?', a: 'Timelines vary by stream and occupation, but sponsorship, nomination and visa stages together commonly take several months.' },
      { q: 'Can my family join me?', a: 'Yes. Your partner and dependent children can be included and receive work and study rights in Australia.' },
    ],
  },
  {
    id: 'student-visa',
    pr: false,
    title: 'Australia Student Visa (Subclass 500)',
    badge: 'Subclass 500',
    icon: GraduationCap,
    tagline: 'Study at world-class institutions with work rights and post-study pathways.',
    overview:
      'The Australia Student Visa (Subclass 500) lets you live and study full-time in Australia for the duration of your enrolled course. Australia is home to globally ranked universities and vocational colleges, and a student visa can be the first step on a long-term pathway to skilled migration and permanent residence.',
    details: [
      {
        heading: 'Study Options',
        points: [
          'Universities — undergraduate, postgraduate and research degrees.',
          'Vocational Education and Training (VET) and diploma programs.',
          'English Language Intensive Courses (ELICOS).',
          'School, foundation and pathway programs.',
        ],
      },
      {
        heading: 'Genuine Student Requirements',
        points: [
          'Enrolment confirmed by a Confirmation of Enrolment (CoE) from a registered provider.',
          'Meet the Genuine Student (GS) requirement, showing a real intention to study.',
          'Demonstrate sufficient funds for tuition, living costs and travel.',
          'Hold Overseas Student Health Cover (OSHC) for the visa period.',
          'Meet the required English language level for your course.',
        ],
      },
      {
        heading: 'Work Rights',
        points: [
          'Work up to 48 hours per fortnight while your course is in session.',
          'Unlimited working hours during scheduled course breaks.',
          'Your dependants may also receive limited work rights.',
        ],
      },
      {
        heading: 'Post-Study Opportunities',
        points: [
          'Eligible graduates can apply for the Temporary Graduate visa (Subclass 485).',
          'Gain valuable Australian work experience after graduation.',
          'Use Australian study and experience to claim extra points toward skilled migration.',
          'Progress toward permanent residence through the skilled or employer streams.',
        ],
      },
    ],
    benefits: [
      'Study at internationally recognised institutions.',
      'Work part-time to support your living costs.',
      'Bring eligible family members with you.',
      'Gain a globally respected qualification.',
      'Access post-study work rights (Subclass 485).',
      'Build a long-term pathway to skilled PR.',
    ],
    keyRequirements: [
      'Confirmation of Enrolment (CoE)',
      'Genuine Student requirement',
      'Proof of financial capacity',
      'Overseas Student Health Cover (OSHC)',
      'English language proficiency',
    ],
    processing: [
      { title: 'Choose course & provider', desc: 'Select a registered course matched to your goals and budget.' },
      { title: 'Receive your CoE', desc: 'Accept your offer and obtain a Confirmation of Enrolment.' },
      { title: 'Prepare your application', desc: 'Compile GS statement, finances, OSHC and English evidence.' },
      { title: 'Lodge the Subclass 500', desc: 'Submit your student visa application online.' },
      { title: 'Arrive & study', desc: 'Begin your studies and explore post-study pathways.' },
    ],
    faqs: [
      { q: 'How many hours can I work on a student visa?', a: 'You can work up to 48 hours per fortnight while your course is in session, and unlimited hours during scheduled course breaks.' },
      { q: 'Can a student visa lead to PR?', a: 'Yes — indirectly. After graduating you can gain a Temporary Graduate visa and use your Australian study and experience to claim points toward skilled migration.' },
      { q: 'What is the Genuine Student requirement?', a: 'It replaced the previous GTE requirement and assesses whether you genuinely intend to study in Australia, based on your circumstances and study plan.' },
      { q: 'Can my family come with me?', a: 'Yes. You can include your partner and dependent children, who may also receive work or study rights.' },
    ],
  },
  {
    id: 'partner-visa',
    pr: true,
    title: 'Australia Partner Visa (Subclasses 820/801 & 309/100)',
    badge: 'Partner Visa',
    icon: Heart,
    tagline: 'Join your partner in Australia with a staged pathway to permanent residence.',
    overview:
      'The Australia Partner Visa lets the spouse or de facto partner of an Australian citizen, permanent resident or eligible New Zealand citizen live in Australia. It is generally granted in two stages — a temporary visa followed by a permanent visa — and applies whether you apply from inside Australia (820/801) or offshore (309/100).',
    details: [
      {
        heading: 'Partner Visa Overview',
        points: [
          'Onshore: Subclass 820 (temporary) leading to Subclass 801 (permanent).',
          'Offshore: Subclass 309 (temporary) leading to Subclass 100 (permanent).',
          'For married couples and genuine de facto partners, including same-sex partners.',
        ],
      },
      {
        heading: 'Eligibility Requirements',
        points: [
          'Be the spouse or de facto partner of an eligible Australian sponsor.',
          'Be in a genuine and continuing relationship to the exclusion of all others.',
          'De facto applicants generally need 12 months of cohabitation (some exceptions apply).',
          'Meet health and character requirements.',
        ],
      },
      {
        heading: 'Relationship Evidence',
        points: [
          'Financial aspects — joint accounts, shared assets and expenses.',
          'Nature of the household — shared living arrangements and responsibilities.',
          'Social aspects — joint events, friends and family recognition.',
          'Commitment — knowledge of each other, future plans and time together.',
        ],
      },
      {
        heading: 'Temporary and Permanent Stages',
        points: [
          'Stage 1: The temporary visa (820 or 309) lets you live and work in Australia.',
          'Stage 2: Around two years later, the permanent visa (801 or 100) is assessed.',
          'Long-term relationships may be eligible for the permanent stage sooner.',
        ],
      },
    ],
    benefits: [
      'Live and work in Australia with your partner.',
      'Unrestricted work rights from the temporary stage.',
      'Access to Medicare.',
      'Study in Australia.',
      'Include dependent children in your application.',
      'Pathway to permanent residence and citizenship.',
    ],
    keyRequirements: [
      'Eligible Australian sponsor',
      'Genuine, continuing relationship',
      'Strong relationship evidence',
      'Health & character clearance',
      'Sponsor obligations met',
    ],
    processing: [
      { title: 'Confirm eligibility & sponsor', desc: 'Verify the relationship and the sponsor\'s eligibility.' },
      { title: 'Gather relationship evidence', desc: 'Compile financial, social, household and commitment evidence.' },
      { title: 'Lodge the application', desc: 'Apply for the temporary and permanent visas together.' },
      { title: 'Temporary visa grant', desc: 'Live and work in Australia while the permanent stage is assessed.' },
      { title: 'Permanent visa grant', desc: 'Receive permanent residence after the eligibility period.' },
    ],
    faqs: [
      { q: 'How long does a partner visa take?', a: 'Processing times vary considerably and can range from many months to a couple of years, depending on the strength of evidence and individual circumstances.' },
      { q: 'Do I get permanent residence straight away?', a: 'Usually no. Most applicants are first granted a temporary partner visa and then assessed for the permanent visa around two years later.' },
      { q: 'Can de facto and same-sex partners apply?', a: 'Yes. De facto partners (including same-sex couples) in a genuine, continuing relationship are eligible, generally after 12 months of living together.' },
      { q: 'Can I work on a temporary partner visa?', a: 'Yes. The temporary partner visa grants full work rights and access to Medicare while your permanent application is processed.' },
    ],
  },
  {
    id: 'business-investor',
    pr: false,
    title: 'Australia Business & Investor Migration',
    badge: 'Business Innovation & Investment',
    icon: TrendingUp,
    tagline: 'For business owners, entrepreneurs and investors seeking Australian residence.',
    overview:
      'Australia\'s Business Innovation and Investment Program is designed for successful business owners, senior managers and investors who want to establish or invest in a business in Australia. These visas reward genuine business and investment activity with provisional residence and a clear pathway to permanent residence. Program settings change periodically, so tailored, up-to-date advice is essential.',
    details: [
      {
        heading: 'Business Innovation Pathways',
        points: [
          'For owners and operators with a successful business career.',
          'Requires establishing or managing a qualifying business in Australia.',
          'Provisional residence first, with a permanent stream once activity benchmarks are met.',
        ],
      },
      {
        heading: 'Investor Pathways',
        points: [
          'For investors prepared to make a designated investment in Australia.',
          'Significant investor options exist for higher investment thresholds.',
          'Investments must be held for the required period to qualify for permanence.',
        ],
      },
      {
        heading: 'Eligibility',
        points: [
          'Demonstrated business or investment track record.',
          'Sufficient net business, personal and investable assets.',
          'A genuine commitment to business or investment activity in Australia.',
          'Meet age, health and character requirements (age concessions may apply).',
        ],
      },
      {
        heading: 'Business Experience Requirements',
        points: [
          'A proven history of successfully owning or managing a qualifying business.',
          'Evidence of business turnover and ownership percentage.',
          'Management experience and a credible business plan for Australia.',
        ],
      },
      {
        heading: 'Investment Expectations',
        points: [
          'Make and maintain the required level of qualifying investment.',
          'Comply with the conditions and timeframes of the chosen stream.',
          'Satisfy residence and activity requirements before applying for PR.',
        ],
      },
      {
        heading: 'Permanent Residence Opportunities',
        points: [
          'Provisional business/investor visas transition to permanent residence on meeting benchmarks.',
          'Permanent residence provides full settlement rights for you and your family.',
          'Pathway to Australian citizenship over time.',
        ],
      },
    ],
    benefits: [
      'Grow or invest in a business in a stable, growing economy.',
      'Provisional residence with a clear PR pathway.',
      'Include your family in the application.',
      'Access to world-class infrastructure and markets.',
      'Lifestyle, education and healthcare benefits of Australian residence.',
      'Long-term pathway to citizenship.',
    ],
    keyRequirements: [
      'Proven business / investment history',
      'Sufficient assets & capital',
      'Qualifying investment or business activity',
      'Genuine commitment to Australia',
      'Health & character clearance',
    ],
    processing: [
      { title: 'Profile & strategy review', desc: 'Assess your assets, history and the best-fit stream.' },
      { title: 'State / territory nomination', desc: 'Where required, secure nomination and lodge an EOI.' },
      { title: 'Provisional visa application', desc: 'Apply for the relevant provisional business/investor visa.' },
      { title: 'Establish business / investment', desc: 'Operate the business or hold the investment as required.' },
      { title: 'Permanent residence', desc: 'Apply for PR once activity and residence benchmarks are met.' },
    ],
    faqs: [
      { q: 'How much do I need to invest for an Australian investor visa?', a: 'Investment thresholds vary by stream and change periodically. Our consultants provide the current figures and structure your investment to qualify.' },
      { q: 'Do business migration visas lead to permanent residence?', a: 'Yes. Provisional business and investor visas provide a pathway to permanent residence once you meet the relevant business activity or investment benchmarks.' },
      { q: 'Can I include my family?', a: 'Yes. Your partner and dependent children can be included and enjoy the work, study and healthcare benefits of Australian residence.' },
      { q: 'Is state nomination required for business migration?', a: 'Many business and investment streams require nomination by a state or territory government. We match your profile to the most suitable nominating state.' },
    ],
  },
];

export default australiaVisas;
