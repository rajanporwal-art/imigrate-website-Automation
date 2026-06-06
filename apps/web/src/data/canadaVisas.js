import {
  Globe,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Rocket,
  Compass,
} from 'lucide-react';

/**
 * Content model mirrors australiaVisas.js so both country pages can share the
 * same VisaCategorySection component and layout.
 */
export const canadaVisas = [
  {
    id: 'express-entry',
    title: 'Canada Express Entry (Skilled Migration)',
    badge: 'Express Entry',
    icon: Globe,
    tagline: 'The fastest federal route to Canadian permanent residence for skilled workers.',
    overview:
      'Express Entry is the Canadian government\'s flagship online system for managing skilled-worker applications for permanent residence. It covers three federal programs — the Federal Skilled Worker Program, the Canadian Experience Class and the Federal Skilled Trades Program. Candidates are ranked by a Comprehensive Ranking System (CRS) score, and the highest-ranked profiles receive an Invitation to Apply (ITA) in regular draws. Many applicants receive PR in around six months once invited.',
    details: [
      {
        heading: 'Programs managed under Express Entry',
        points: [
          'Federal Skilled Worker Program (FSWP) — for skilled workers with foreign experience.',
          'Canadian Experience Class (CEC) — for those with skilled Canadian work experience.',
          'Federal Skilled Trades Program (FSTP) — for qualified tradespeople.',
        ],
      },
      {
        heading: 'Eligibility Criteria',
        points: [
          'Skilled work experience in an eligible occupation (NOC TEER 0, 1, 2 or 3).',
          'Language ability in English or French (IELTS/CELPIP or TEF) meeting minimum CLB levels.',
          'Education — Canadian credential or an Educational Credential Assessment (ECA) for foreign study.',
          'Sufficient settlement funds (unless you have a valid job offer or are already working in Canada).',
        ],
      },
      {
        heading: 'Comprehensive Ranking System (CRS)',
        points: [
          'Core human capital — age, education, language and work experience.',
          'Spouse/partner factors where applicable.',
          'Skill transferability — combinations of education, experience and language.',
          'Additional points — provincial nomination (+600), French proficiency, Canadian study or a sibling in Canada.',
        ],
      },
      {
        heading: 'Pathway to Permanent Residence',
        points: [
          'Create an Express Entry profile and enter the pool.',
          'Receive an Invitation to Apply when your CRS meets the draw cut-off.',
          'Submit a complete PR application within 60 days.',
          'On approval, receive Confirmation of Permanent Residence (COPR).',
        ],
      },
    ],
    benefits: [
      'Permanent residence for you and your family.',
      'Fast processing — often around six months after an ITA.',
      'Live, work and study anywhere in Canada.',
      'Access to universal healthcare and social benefits.',
      'Pathway to Canadian citizenship.',
      'Include your spouse and dependent children.',
    ],
    keyRequirements: [
      'Eligible skilled work experience (NOC)',
      'Language test (IELTS/CELPIP or TEF)',
      'ECA for foreign education',
      'Competitive CRS score',
      'Proof of settlement funds',
    ],
    processing: [
      { title: 'Language test & ECA', desc: 'Sit an approved language test and get your credentials assessed.' },
      { title: 'Create Express Entry profile', desc: 'Enter the pool with your CRS score.' },
      { title: 'Receive an ITA', desc: 'Top-ranked candidates are invited in regular draws.' },
      { title: 'Submit PR application', desc: 'Lodge documents within 60 days of the invitation.' },
      { title: 'Confirmation of PR', desc: 'Receive COPR and complete your landing in Canada.' },
    ],
    faqs: [
      { q: 'How long does Canada Express Entry take?', a: 'Most complete PR applications are processed within about six months after you receive an Invitation to Apply.' },
      { q: 'What CRS score do I need for Express Entry?', a: 'It varies by draw. Recent cut-offs often sit around 470–540, though category-based and provincial draws can be lower. A provincial nomination adds 600 points.' },
      { q: 'Do I need a job offer for Express Entry?', a: 'No. A job offer is not mandatory, though a valid one can add CRS points. Many candidates are invited with no Canadian job offer.' },
      { q: 'Can I include my family?', a: 'Yes. Your spouse or common-law partner and dependent children can be included in the same PR application.' },
    ],
  },
  {
    id: 'pnp',
    title: 'Provincial Nominee Program (PNP)',
    badge: 'PNP',
    icon: MapPin,
    tagline: 'Get nominated by a Canadian province and add 600 CRS points to your profile.',
    overview:
      'The Provincial Nominee Program (PNP) lets Canadian provinces and territories nominate skilled workers who want to settle in their region and meet local labour-market needs. Nearly every province (except Quebec, which runs its own system) operates a PNP. A provincial nomination is one of the most powerful routes to PR — an Express Entry-aligned nomination adds 600 CRS points, effectively guaranteeing an invitation.',
    details: [
      {
        heading: 'How the PNP works',
        points: [
          'Each province runs streams targeting skilled workers, graduates, semi-skilled workers and entrepreneurs.',
          'Some streams are "enhanced" (linked to Express Entry); others are "base" (direct to the province).',
          'Provinces select candidates from their own pools or from the federal Express Entry pool.',
        ],
      },
      {
        heading: 'Eligibility Requirements',
        points: [
          'Skills, education and experience that match the province\'s in-demand occupations.',
          'A genuine intention to live and work in the nominating province.',
          'Meeting the specific stream\'s language, work-experience and sometimes job-offer requirements.',
        ],
      },
      {
        heading: 'Enhanced vs base nomination',
        points: [
          'Enhanced (Express Entry-linked) nomination adds 600 CRS points and leads to a fast federal PR application.',
          'Base nomination is processed directly by IRCC, outside Express Entry, with longer timelines.',
          'Both lead to the same outcome — Canadian permanent residence.',
        ],
      },
    ],
    benefits: [
      'Adds 600 CRS points with an enhanced nomination.',
      'Access to streams for many skill levels, including semi-skilled roles.',
      'Permanent residence for you and your family.',
      'Settle in a province actively seeking your skills.',
      'Often lower CRS thresholds than federal draws.',
      'Pathway to Canadian citizenship.',
    ],
    keyRequirements: [
      'Province-specific eligibility match',
      'Intention to settle in the province',
      'Language & work-experience criteria',
      'Express Entry profile (for enhanced streams)',
      'Sometimes a provincial job offer',
    ],
    processing: [
      { title: 'Identify the right province', desc: 'Match your profile to a province and stream.' },
      { title: 'Express Interest / apply', desc: 'Submit an EOI or stream application to the province.' },
      { title: 'Receive nomination', desc: 'The province nominates you (enhanced = +600 CRS).' },
      { title: 'Apply for PR', desc: 'Lodge your PR application with IRCC.' },
      { title: 'Land as a PR', desc: 'Receive your COPR and settle in your province.' },
    ],
    faqs: [
      { q: 'Which is better — Express Entry or PNP?', a: 'They work together. If your CRS is below recent cut-offs, a PNP nomination adds 600 points and effectively secures an invitation. We recommend the best route for your profile.' },
      { q: 'Do I have to stay in the nominating province?', a: 'You commit to settling in the nominating province. PR is national, but you should genuinely intend to live and work there, especially initially.' },
      { q: 'Can I apply to a PNP without a job offer?', a: 'Many streams do not require a job offer, though some do. The right stream depends on your occupation, experience and target province.' },
      { q: 'How long does a PNP take?', a: 'Enhanced (Express Entry) nominations are fast — often around six months for the PR stage. Base streams take longer, frequently 12–18 months.' },
    ],
  },
  {
    id: 'work-permits',
    title: 'Canada Work Permits',
    badge: 'Work Permits',
    icon: Briefcase,
    tagline: 'Work in Canada through employer-specific or open work permits.',
    overview:
      'A Canadian work permit allows foreign nationals to work in Canada temporarily and, in many cases, build experience that leads to permanent residence. Work permits fall into two broad categories: employer-specific (tied to one employer, often requiring a Labour Market Impact Assessment) and open (not tied to a specific employer). Canadian work experience is highly valuable for the Canadian Experience Class and many PNP streams.',
    details: [
      {
        heading: 'Types of work permits',
        points: [
          'Employer-specific work permit — tied to one employer, job and location.',
          'Open work permit — work for almost any employer (e.g. spouses, graduates, some pilots).',
          'International Mobility Program (IMP) — LMIA-exempt categories such as intra-company transfers and trade agreements.',
        ],
      },
      {
        heading: 'Labour Market Impact Assessment (LMIA)',
        points: [
          'Many employer-specific permits require the employer to obtain a positive LMIA.',
          'An LMIA confirms that hiring a foreign worker will not negatively affect the Canadian labour market.',
          'A positive LMIA can also add CRS points toward Express Entry.',
        ],
      },
      {
        heading: 'Pathways to permanent residence',
        points: [
          'Gain skilled Canadian work experience to qualify for the Canadian Experience Class.',
          'Use Canadian work experience to boost your CRS score.',
          'Many PNP streams target workers already employed in the province.',
        ],
      },
    ],
    benefits: [
      'Start working and earning in Canada sooner.',
      'Build Canadian experience that supports PR.',
      'Spouses may qualify for an open work permit.',
      'Dependent children can study in Canada.',
      'Access to a strong, high-wage labour market.',
      'Stepping stone to permanent residence.',
    ],
    keyRequirements: [
      'Job offer (for employer-specific permits)',
      'LMIA or LMIA-exemption',
      'Proof of qualifications & experience',
      'Intent to leave at permit expiry (temporary)',
      'Health & security admissibility',
    ],
    processing: [
      { title: 'Secure a job offer', desc: 'Obtain a genuine offer from a Canadian employer.' },
      { title: 'LMIA / exemption', desc: 'Employer obtains an LMIA or confirms an IMP exemption.' },
      { title: 'Apply for the permit', desc: 'Submit your work permit application with documents.' },
      { title: 'Begin work in Canada', desc: 'Arrive and start your role on a valid permit.' },
      { title: 'Transition to PR', desc: 'Use Canadian experience for Express Entry or a PNP.' },
    ],
    faqs: [
      { q: 'Can a work permit lead to permanent residence?', a: 'Yes. Skilled Canadian work experience is a strong asset for the Canadian Experience Class and many PNP streams, and can significantly raise your CRS score.' },
      { q: 'What is an open work permit?', a: 'An open work permit lets you work for almost any employer in Canada. It is available to certain groups such as spouses of skilled workers and some graduates.' },
      { q: 'Do I always need an LMIA?', a: 'No. Many roles fall under LMIA-exempt categories of the International Mobility Program, such as intra-company transfers or international agreements.' },
      { q: 'Can my spouse work in Canada too?', a: 'In many cases your spouse can apply for an open work permit while you hold a valid skilled work permit.' },
    ],
  },
  {
    id: 'study-permit',
    title: 'Canada Study Permit',
    badge: 'Study Permit',
    icon: GraduationCap,
    tagline: 'Study at top Canadian institutions with work rights and a PR pathway.',
    overview:
      'A Canada Study Permit lets international students study at a Designated Learning Institution (DLI). Canada is a leading study destination thanks to its world-class universities and colleges, affordable tuition relative to peers, and strong post-graduation pathways. Graduates can obtain a Post-Graduation Work Permit (PGWP) and use their Canadian study and work experience to apply for permanent residence.',
    details: [
      {
        heading: 'Study options',
        points: [
          'Universities — undergraduate, graduate and doctoral programs.',
          'Colleges and institutes — diplomas, certificates and applied degrees.',
          'Language and pathway programs.',
        ],
      },
      {
        heading: 'Eligibility requirements',
        points: [
          'Acceptance at a Designated Learning Institution (DLI).',
          'Proof of funds for tuition and living costs (and a Provincial Attestation Letter where required).',
          'Genuine intent to study and ties that support a temporary stay.',
          'Meet language, academic and admissibility requirements.',
        ],
      },
      {
        heading: 'Work rights & post-study pathways',
        points: [
          'Work part-time during studies and full-time during scheduled breaks (subject to current rules).',
          'Eligible graduates can obtain a Post-Graduation Work Permit (PGWP).',
          'Canadian study and work experience strengthen Express Entry and PNP applications.',
        ],
      },
    ],
    benefits: [
      'Study at globally ranked institutions.',
      'Work while you study to support living costs.',
      'Post-Graduation Work Permit after eligible programs.',
      'Spouse may be eligible for a work permit.',
      'Build a clear pathway to permanent residence.',
      'Experience life in one of the world\'s most welcoming countries.',
    ],
    keyRequirements: [
      'Acceptance from a DLI',
      'Proof of sufficient funds',
      'Provincial Attestation Letter (if applicable)',
      'Genuine student intent',
      'Health & security admissibility',
    ],
    processing: [
      { title: 'Choose a DLI & program', desc: 'Select a designated institution and course.' },
      { title: 'Receive your acceptance', desc: 'Obtain a letter of acceptance and any attestation letter.' },
      { title: 'Prepare finances & documents', desc: 'Show funds and prepare your study plan.' },
      { title: 'Apply for the study permit', desc: 'Submit your application online.' },
      { title: 'Study & transition to PR', desc: 'Study, work, get a PGWP and pursue PR.' },
    ],
    faqs: [
      { q: 'Can I work while studying in Canada?', a: 'Yes. Study permit holders can usually work part-time during the academic session and full-time during scheduled breaks, subject to current government limits.' },
      { q: 'What is a PGWP?', a: 'The Post-Graduation Work Permit lets eligible graduates of qualifying programs work in Canada for up to three years, building experience that supports PR.' },
      { q: 'Can a study permit lead to PR?', a: 'Yes. Canadian education plus post-graduation work experience are valuable for the Canadian Experience Class and many PNP streams.' },
      { q: 'Can my family come with me?', a: 'Your spouse may be eligible for a work permit and your dependent children can study in Canada, depending on your program and circumstances.' },
    ],
  },
  {
    id: 'family-sponsorship',
    title: 'Canada Family & Spousal Sponsorship',
    badge: 'Family Sponsorship',
    icon: Heart,
    tagline: 'Reunite with your loved ones in Canada through family sponsorship.',
    overview:
      'Canada places a strong emphasis on family reunification. Canadian citizens and permanent residents can sponsor eligible family members — including a spouse, common-law or conjugal partner, dependent children, and parents and grandparents — to become permanent residents. Successfully sponsored family members enjoy the full rights of Canadian PR.',
    details: [
      {
        heading: 'Who can be sponsored',
        points: [
          'Spouse, common-law partner or conjugal partner.',
          'Dependent children (including adopted children).',
          'Parents and grandparents (through dedicated programs).',
          'In limited circumstances, other relatives.',
        ],
      },
      {
        heading: 'Sponsor eligibility',
        points: [
          'Be a Canadian citizen or permanent resident, at least 18 years old.',
          'Agree to financially support the sponsored person for a set period.',
          'Meet income requirements for certain categories (e.g. parents and grandparents).',
          'Not be subject to certain prohibitions (e.g. undischarged bankruptcy or relevant offences).',
        ],
      },
      {
        heading: 'Relationship evidence (spousal/partner)',
        points: [
          'Proof of a genuine relationship — photos, communication, joint finances and travel.',
          'Marriage certificate or proof of cohabitation for common-law partners.',
          'Consistent, credible documentation across the application.',
        ],
      },
    ],
    benefits: [
      'Bring your closest family members to Canada permanently.',
      'Sponsored persons gain full PR rights.',
      'Access to healthcare and social benefits.',
      'Spouses can often apply for an open work permit while the application is processed.',
      'Build your life together in Canada.',
      'Pathway to citizenship for sponsored family.',
    ],
    keyRequirements: [
      'Eligible Canadian sponsor (citizen/PR)',
      'Qualifying relationship',
      'Financial support undertaking',
      'Genuine relationship evidence',
      'Admissibility (health & security)',
    ],
    processing: [
      { title: 'Confirm eligibility', desc: 'Verify both sponsor and applicant eligibility.' },
      { title: 'Gather evidence', desc: 'Compile relationship and supporting documents.' },
      { title: 'Submit the application', desc: 'Lodge sponsorship and PR applications together.' },
      { title: 'Processing & checks', desc: 'IRCC reviews the relationship and admissibility.' },
      { title: 'PR for your family', desc: 'Sponsored family members become permanent residents.' },
    ],
    faqs: [
      { q: 'How long does spousal sponsorship take?', a: 'Processing times vary, but spousal/partner applications commonly take around 12 months, depending on completeness and individual circumstances.' },
      { q: 'Can my spouse work while we wait?', a: 'In many inland spousal cases your partner can apply for an open work permit while the application is being processed.' },
      { q: 'Can I sponsor my parents and grandparents?', a: 'Yes, through dedicated programs (such as the Parents and Grandparents Program or the Super Visa for extended visits). Income requirements apply.' },
      { q: 'What proof of relationship is needed?', a: 'Strong, consistent evidence of a genuine relationship — joint finances, communication history, photos, travel and, where relevant, a marriage certificate or proof of cohabitation.' },
    ],
  },
  {
    id: 'business-startup',
    title: 'Canada Business & Start-up Visa',
    badge: 'Business & Start-up',
    icon: Rocket,
    tagline: 'For entrepreneurs and investors building innovative businesses in Canada.',
    overview:
      'Canada actively welcomes entrepreneurs, investors and self-employed individuals who can contribute to its economy. The federal Start-up Visa Program offers permanent residence to founders of innovative businesses backed by a designated organisation, while the Self-Employed Persons Program and various provincial entrepreneur streams provide additional pathways for business migrants.',
    details: [
      {
        heading: 'Start-up Visa Program',
        points: [
          'For founders of innovative, scalable businesses with growth potential.',
          'Requires a letter of support from a designated venture capital fund, angel investor group or business incubator.',
          'Grants permanent residence to qualifying founders (and their families).',
        ],
      },
      {
        heading: 'Other business pathways',
        points: [
          'Self-Employed Persons Program — for those with relevant experience in cultural or athletic activities.',
          'Provincial entrepreneur streams — provinces nominate business owners who invest and create jobs.',
          'Intra-company transfer work permits for establishing a Canadian branch.',
        ],
      },
      {
        heading: 'Eligibility',
        points: [
          'A qualifying business idea and, for the Start-up Visa, support from a designated organisation.',
          'Sufficient settlement funds.',
          'Meet language requirements (typically CLB 5 or above).',
          'Meet health, character and admissibility requirements.',
        ],
      },
    ],
    benefits: [
      'Permanent residence for founders and their families (Start-up Visa).',
      'Build a business in a stable, innovation-friendly economy.',
      'Access to investors, incubators and global markets.',
      'No mandatory minimum personal investment for the Start-up Visa.',
      'Lifestyle, healthcare and education benefits of Canadian residence.',
      'Pathway to Canadian citizenship.',
    ],
    keyRequirements: [
      'Qualifying / innovative business',
      'Letter of support (Start-up Visa)',
      'Sufficient settlement funds',
      'Language ability (CLB 5+)',
      'Admissibility (health & security)',
    ],
    processing: [
      { title: 'Develop your business case', desc: 'Refine your business concept and strategy.' },
      { title: 'Secure designated support', desc: 'Obtain a letter of support from a designated organisation.' },
      { title: 'Apply for PR / nomination', desc: 'Lodge the Start-up Visa or provincial stream application.' },
      { title: 'Establish your business', desc: 'Set up and operate your venture in Canada.' },
      { title: 'Permanent residence', desc: 'Receive PR and grow your business in Canada.' },
    ],
    faqs: [
      { q: 'Does the Start-up Visa give permanent residence?', a: 'Yes. The federal Start-up Visa Program grants permanent residence to qualifying founders and their families, provided requirements are met.' },
      { q: 'How much do I need to invest?', a: 'The Start-up Visa has no mandatory minimum personal investment, but you need a letter of support from a designated organisation and enough settlement funds. Provincial entrepreneur streams set their own investment levels.' },
      { q: 'Can my family come with me?', a: 'Yes. Your spouse and dependent children can be included and enjoy the benefits of Canadian residence.' },
      { q: 'What is a designated organisation?', a: 'An approved Canadian venture capital fund, angel investor group or business incubator that agrees to support your start-up.' },
    ],
  },
  {
    id: 'atlantic-regional',
    title: 'Atlantic Immigration & Regional Pathways',
    badge: 'Atlantic & Regional',
    icon: Compass,
    tagline: 'Employer-driven pathways to PR in Atlantic Canada and rural communities.',
    overview:
      'Beyond the main federal and provincial routes, Canada runs targeted regional programs to bring skilled workers and graduates to specific areas. The Atlantic Immigration Program (AIP) supports employers in the four Atlantic provinces, while the Rural and Northern Immigration Pilot (RNIP) and similar community-driven programs help smaller communities attract newcomers — often with lower thresholds and strong settlement support.',
    details: [
      {
        heading: 'Atlantic Immigration Program (AIP)',
        points: [
          'For New Brunswick, Nova Scotia, Prince Edward Island and Newfoundland and Labrador.',
          'Employer-driven — requires a job offer from a designated employer.',
          'Includes a settlement plan to help you and your family integrate.',
        ],
      },
      {
        heading: 'Rural & community pathways',
        points: [
          'Community-driven programs (such as the Rural and Northern Immigration Pilot) help smaller towns attract talent.',
          'Often feature in-demand occupation lists tailored to local needs.',
          'A genuine intention to live in the community is required.',
        ],
      },
      {
        heading: 'Eligibility',
        points: [
          'A qualifying job offer from a designated/eligible employer.',
          'Relevant work experience and education.',
          'Language ability meeting the program minimum.',
          'Proof of funds and intention to settle in the region.',
        ],
      },
    ],
    benefits: [
      'Direct, employer-supported pathway to permanent residence.',
      'Often lower entry thresholds than federal draws.',
      'Strong settlement and community support.',
      'Affordable cost of living and welcoming communities.',
      'Bring your family and access healthcare and schooling.',
      'Pathway to Canadian citizenship.',
    ],
    keyRequirements: [
      'Job offer from a designated employer',
      'Relevant experience & education',
      'Language ability (program minimum)',
      'Intention to settle in the region',
      'Proof of funds',
    ],
    processing: [
      { title: 'Find a designated employer', desc: 'Secure a job offer from an eligible regional employer.' },
      { title: 'Endorsement / settlement plan', desc: 'Obtain endorsement and a settlement plan where required.' },
      { title: 'Apply for PR', desc: 'Submit your permanent residence application.' },
      { title: 'Relocate to the region', desc: 'Move to the Atlantic province or community.' },
      { title: 'Settle as a PR', desc: 'Build your life with local settlement support.' },
    ],
    faqs: [
      { q: 'What is the Atlantic Immigration Program?', a: 'An employer-driven PR pathway for the four Atlantic provinces. With a job offer from a designated employer and a settlement plan, skilled workers and graduates can become permanent residents.' },
      { q: 'Are regional programs easier than Express Entry?', a: 'They often have lower thresholds and strong support, but they require a genuine job offer and intention to live in the specific region. We assess which route best fits you.' },
      { q: 'Do I need a job offer for these pathways?', a: 'Yes. Atlantic and most rural/community programs are employer-driven and require a qualifying job offer.' },
      { q: 'Can my family join me?', a: 'Yes. Your spouse and dependent children are included, and Atlantic programs provide settlement support for the whole family.' },
    ],
  },
];

export default canadaVisas;
