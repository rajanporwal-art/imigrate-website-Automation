import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import { mdToHtml } from '@/lib/markdown';

/**
 * Renders a CMS-built page from a block array (managed in cms-overrides/pages.json
 * via the visual page builder in /cms.html). Presentational: the page object is
 * resolved/looked-up by the caller. Supports the core block types the builder
 * offers: hero, heading, richtext, image, button, cards, testimonials, faq,
 * list, table, banner, cta, spacer.
 */
function Block({ b }) {
  if (!b || !b.type) return null;
  switch (b.type) {
    case 'hero':
      return (
        <section
          className="bg-primary text-primary-foreground section-spacing"
          style={b.bgImage ? { backgroundImage: `linear-gradient(rgba(11,31,68,.72),rgba(11,31,68,.72)),url(${b.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <div className="container-custom text-center">
            <h1 className="heading-hero mb-4">{b.heading}</h1>
            {b.subheading && <p className="text-lg opacity-90 max-w-2xl mx-auto">{b.subheading}</p>}
            {b.ctaText && (
              <div className="mt-6">
                <a href={b.ctaUrl || '#'} className="inline-block bg-cta text-cta-foreground font-semibold px-6 py-3 rounded-lg shadow-md hover:opacity-90 transition">{b.ctaText}</a>
              </div>
            )}
          </div>
        </section>
      );
    case 'heading': {
      const Tag = `h${Math.min(Math.max(parseInt(b.level || 2, 10), 1), 4)}`;
      return <div className="container-custom mt-10"><Tag className="heading-section text-primary">{b.text}</Tag></div>;
    }
    case 'richtext':
      return <div className="container-custom max-w-3xl my-6 cms-prose" dangerouslySetInnerHTML={{ __html: mdToHtml(b.markdown || '') }} />;
    case 'image':
      return (
        <figure className="container-custom my-8 text-center">
          {b.url && <img src={b.url} alt={b.alt || ''} loading="lazy" className="rounded-xl mx-auto max-w-full" />}
          {b.caption && <figcaption className="text-sm text-muted-foreground mt-2">{b.caption}</figcaption>}
        </figure>
      );
    case 'button':
      return (
        <div className="container-custom my-6">
          <a href={b.url || '#'} target={b.newTab ? '_blank' : undefined} rel={b.newTab ? 'noopener noreferrer' : undefined}
            className={`inline-block font-semibold px-6 py-3 rounded-lg transition ${b.style === 'outline' ? 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground' : 'bg-cta text-cta-foreground hover:opacity-90'}`}>
            {b.text || 'Button'}
          </a>
        </div>
      );
    case 'cards':
      return (
        <section className="container-custom my-10">
          {b.heading && <h2 className="heading-section text-primary text-center mb-6">{b.heading}</h2>}
          <div className="grid md:grid-cols-3 gap-6">
            {(b.items || []).map((it, i) => (
              <div key={i} className="rounded-xl border border-border p-6 bg-card shadow-sm">
                {it.icon && <div className="text-3xl mb-2">{it.icon}</div>}
                <h3 className="font-semibold text-lg mb-2">{it.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{it.text}</p>
              </div>
            ))}
          </div>
        </section>
      );
    case 'testimonials':
      return (
        <section className="container-custom my-10">
          {b.heading && <h2 className="heading-section text-primary text-center mb-6">{b.heading}</h2>}
          <div className="grid md:grid-cols-2 gap-6">
            {(b.items || []).map((it, i) => (
              <blockquote key={i} className="rounded-xl border border-border p-6 bg-card shadow-sm">
                <p className="italic text-foreground">“{it.quote}”</p>
                <footer className="mt-3 font-semibold text-primary">{it.name}{it.role ? `, ${it.role}` : ''}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      );
    case 'faq':
      return (
        <section className="container-custom my-10 max-w-3xl">
          {b.heading && <h2 className="heading-section text-primary mb-6">{b.heading}</h2>}
          {(b.items || []).map((it, i) => (
            <details key={i} className="border-b border-border py-3">
              <summary className="font-semibold cursor-pointer">{it.q}</summary>
              <p className="text-muted-foreground mt-2">{it.a}</p>
            </details>
          ))}
        </section>
      );
    case 'list':
      return (
        <section className="container-custom my-8 max-w-3xl">
          {b.heading && <h3 className="font-semibold text-lg mb-3">{b.heading}</h3>}
          <ul className="list-disc pl-6 space-y-1 text-foreground">{(b.items || []).map((it, i) => <li key={i}>{it}</li>)}</ul>
        </section>
      );
    case 'table':
      return (
        <section className="container-custom my-8 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead><tr>{(b.headers || []).map((h, i) => <th key={i} className="border border-border p-2 bg-muted text-left">{h}</th>)}</tr></thead>
            <tbody>{(b.rows || []).map((r, i) => <tr key={i}>{(r || []).map((c, j) => <td key={j} className="border border-border p-2">{c}</td>)}</tr>)}</tbody>
          </table>
        </section>
      );
    case 'banner':
      return <div className="my-6" style={{ background: b.bgColor || '#0b1f44' }}><div className="container-custom py-4 text-center text-white font-medium">{b.text}</div></div>;
    case 'cta':
      return (
        <section className="bg-muted section-spacing my-10">
          <div className="container-custom text-center">
            <h2 className="heading-section text-primary mb-3">{b.heading}</h2>
            {b.text && <p className="text-muted-foreground mb-5 max-w-2xl mx-auto">{b.text}</p>}
            {b.buttonText && <a href={b.buttonUrl || '#'} className="inline-block bg-cta text-cta-foreground font-semibold px-6 py-3 rounded-lg">{b.buttonText}</a>}
          </div>
        </section>
      );
    case 'spacer':
      return <div style={{ height: (parseInt(b.size, 10) || 40) + 'px' }} />;
    default:
      return null;
  }
}

export default function CmsPage({ page }) {
  // Set title/description directly too — reliable for async-loaded CMS pages
  // where react-helmet can miss the update.
  useEffect(() => {
    if (!page) return;
    document.title = page.metaTitle || page.title || 'iMigrate Migration Solutions';
    if (page.metaDescription) {
      let m = document.head.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'description'); document.head.appendChild(m); }
      m.setAttribute('content', page.metaDescription);
    }
  }, [page]);
  if (!page) return null;
  return (
    <>
      <Helmet>
        <title>{page.metaTitle || page.title || 'iMigrate Migration Solutions'}</title>
        {page.metaDescription && <meta name="description" content={page.metaDescription} />}
      </Helmet>
      <Header />
      <main>{(page.blocks || []).map((b, i) => <Block key={i} b={b} />)}</main>
      <StickyConsultationButton />
      <Footer />
    </>
  );
}
