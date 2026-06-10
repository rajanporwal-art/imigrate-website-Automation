import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Runtime-editable site content.
 *
 * The website ships with these DEFAULTS baked in, and on load it fetches
 * /content.json and merges any values found there on top of the defaults.
 * That means you can edit /content.json in Hostinger File Manager to change
 * text, contact details, stats, etc. — no rebuild required. If the file is
 * missing or has an error, the site silently falls back to these defaults.
 */
export const DEFAULT_CONTENT = {
  contact: {
    phone: '+60 11-2767 9613',
    email: 'contact@imigratesolution.com',
    whatsapp: '601127679613',
    address:
      'KL Eco City, Levels 19, Boutique Office 1 (B-O1-D), Menara 2, No. 3 Jalan Bangsar, 59200 Kuala Lumpur',
  },
  social: {
    linkedin: 'https://linkedin.com',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
  },
  stats: [
    { value: '98.6%', label: 'Success rate' },
    { value: '20+', label: 'Countries served' },
    { value: '10+', label: 'Years experience' },
  ],
  highlights: [
    {
      title: '100% Money-Back Guarantee',
      description:
        'At iMigrate Migration Solutions, we offer a 100% money-back guarantee for complete peace of mind. If you are not eligible for the service you paid for, you will receive a full refund, reflecting our commitment to a fair, transparent, and trusted process.',
    },
    {
      title: 'Pay As You Go',
      description:
        'Enjoy flexible, stage-by-stage payment options with iMigrate Migration Solutions. Spread the cost of your immigration journey with no large upfront fees, paying only as you progress through each stage of the application process.',
    },
    {
      title: 'No Hidden Fees',
      description:
        'At iMigrate Migration Solutions, we believe in complete transparency. Our pricing is clear and upfront, with no hidden fees or unexpected charges, so you know exactly what you\'re paying for from the start.',
    },
    {
      title: 'End-to-End Support',
      description:
        'iMigrate Migration Solutions offers end-to-end immigration support from eligibility assessment through visa submission and final decision. A dedicated case manager guides you throughout the process, ensuring a smooth, accurate, and stress-free experience.',
    },
  ],
  home: {
    heroTitle: 'Australia & Canada Immigration — Trusted by Families & Entrepreneurs from Malaysia, Singapore, India & Vietnam',
    heroSubtitle:
      'A Malaysia-based immigration consultancy trusted by clients across Asia and worldwide. We guide you through Australia and Canada skilled migration, student, family and business visas — with a FREE consultation, money-back guarantee and flexible pay-as-you-go payments.',
    highlightsHeading: 'Why clients across Asia choose iMigrate Migration Solutions',
    highlightsSubtitle:
      'Risk-free, flexible and fully transparent immigration services — trusted by professionals and entrepreneurs from Malaysia, Singapore, India and Vietnam.',
    whyHeading: 'Why choose iMigrate Migration Solutions',
    whySubtitle:
      'We specialize in helping clients from Malaysia, Singapore, India and Vietnam migrate to Australia and Canada — with deep expertise, real results and zero hidden fees.',
    servicesHeading: 'Our immigration services',
    servicesSubtitle:
      'From Canada Express Entry and C11 Entrepreneur Work Permits to Australia skilled migration — comprehensive solutions tailored to your profile and goals.',
    successHeading: 'Client success stories',
    successSubtitle:
      "Real people, real results. See how we've helped professionals, families and entrepreneurs from Malaysia, Singapore, India and Vietnam achieve their immigration goals.",
    ctaHeading: 'Ready to start your immigration journey?',
    ctaText:
      'Get your free eligibility check today — our experts will review your profile and provide a personalised roadmap for Australia or Canada immigration within 24 hours.',
  },
  australia: {
    heroTitle: 'Australia Skilled Migration & PR Visa Services',
    heroSubtitle:
      'Your complete guide to migrating to Australia. From the Skilled Independent Visa (Subclass 189) to employer sponsored, student, partner and business migration — our experienced consultants guide you through every pathway to Australian permanent residence.',
    introHeading: 'Explore every Australian visa pathway',
    introText:
      "Australia offers one of the world's most respected, points-based skilled migration systems. Below you'll find dedicated, in-depth guidance for each major visa category — including eligibility, benefits, key requirements, processing steps and frequently asked questions. Not sure where you fit? Start with a free eligibility assessment.",
  },
  canada: {
    heroTitle: 'Canada Immigration & PR Visa Services',
    heroSubtitle:
      'Your complete guide to immigrating to Canada. From Express Entry skilled migration and the Provincial Nominee Program to work permits, study permits, family sponsorship and business pathways — our experienced consultants guide you to Canadian permanent residence.',
    introHeading: 'Explore every Canadian immigration pathway',
    introText:
      "Canada offers some of the world's most welcoming and well-structured immigration programs. Below you'll find dedicated, in-depth guidance for each major pathway — including eligibility, benefits, key requirements, processing steps and frequently asked questions. Not sure where you fit? Start with a free eligibility assessment.",
  },
  about: {
    heroTitle: 'About iMigrate Migration Solutions',
    heroSubtitle:
      'We are a team of dedicated immigration professionals committed to making your dream of living in Australia or Canada a reality.',
    trustText:
      'Every case is handled with complete transparency and care — backed by our 100% money-back guarantee and flexible pay-as-you-go options. You receive professional, ethical, and reliable immigration guidance at every step of your journey.',
  },
  assessment: {
    heroTitle: 'Free eligibility assessment',
    heroSubtitle:
      'Complete this comprehensive assessment to receive a personalized evaluation of your immigration options for Australia or Canada — or calculate your points instantly below.',
  },
  contactPage: {
    heroTitle: 'Contact Us',
    heroSubtitle:
      'Ready to start your immigration journey? Get in touch with our expert team today or visit our office in Kuala Lumpur.',
  },
  footer: {
    tagline:
      'Your trusted partner for Australia and Canada immigration. Expert guidance for your global journey with a proven track record of success.',
  },
};

// Deep-merge objects; arrays and primitives from `override` replace defaults.
function deepMerge(base, override) {
  if (Array.isArray(override)) return override;
  if (override && typeof override === 'object' && !Array.isArray(base)) {
    const out = { ...base };
    for (const key of Object.keys(override)) {
      if (key.startsWith('_')) continue; // ignore _README etc.
      out[key] =
        base && typeof base[key] === 'object' && base[key] !== null
          ? deepMerge(base[key], override[key])
          : override[key];
    }
    return out;
  }
  return override === undefined ? base : override;
}

const SiteContentContext = createContext(DEFAULT_CONTENT);

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    let active = true;
    // Effective content = compiled defaults ← repo-shipped content.json (always
    // current page content) ← CMS override (durable edits). 3-way merge so newly
    // added page content appears even when a CMS override already exists.
    (async () => {
      let merged = DEFAULT_CONTENT;
      try {
        const r = await fetch('/content.json', { cache: 'no-cache' });
        if (r.ok) { const d = await r.json(); if (d) merged = deepMerge(merged, d); }
      } catch (e) { /* keep defaults */ }
      try {
        const r = await fetch('/cms-overrides/content.json', { cache: 'no-cache' });
        if (r.ok) { const d = await r.json(); if (d) merged = deepMerge(merged, d); }
      } catch (e) { /* no override */ }
      if (active) setContent(merged);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}

export default useSiteContent;
