import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle, Send } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cmsFetchJson } from '@/lib/cmsFetch';
import { Card, CardContent } from '@/components/ui/card';
import { submitLead } from '@/lib/leads';

/**
 * Renders any custom form defined in /forms.json at /form/:slug.
 * Submissions are captured durably and synced to our CRM like every other form.
 */
function FormRenderer() {
  const { slug } = useParams();
  const [form, setForm] = useState(undefined); // undefined = loading, null = not found
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    cmsFetchJson('forms.json')
      .then((data) => {
        const f = (data && data.forms ? data.forms : []).find((x) => x.slug === slug);
        setForm(f || null);
      })
      .catch(() => setForm(null));
    window.scrollTo(0, 0);
  }, [slug]);

  const setField = (name, val) => setValues((p) => ({ ...p, [name]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await submitLead({ formName: form.title || 'Custom form', fields: values });
    setSubmitting(false);
    setDone(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>{form && form.title ? `${form.title} — iMigrate Migration Solutions` : 'Form — iMigrate Migration Solutions'}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Header />
      <StickyConsultationButton />

      <main className="bg-background min-h-[70vh]">
        <section className="section-spacing bg-primary text-primary-foreground">
          <div className="container-custom max-w-3xl">
            <div className="gold-rule mb-5" />
            <h1 className="heading-display text-balance mb-4">
              {form === undefined ? 'Loading…' : form ? form.title : 'Form not found'}
            </h1>
            {form && form.intro && <p className="text-xl opacity-90">{form.intro}</p>}
          </div>
        </section>

        <section className="section-spacing">
          <div className="container-custom max-w-2xl">
            {form === null && (
              <div className="text-center">
                <p className="text-muted-foreground mb-6">This form doesn’t exist or has been removed.</p>
                <Button asChild variant="cta"><Link to="/">Back to home</Link></Button>
              </div>
            )}

            {form && done && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-accent" />
                </div>
                <h2 className="heading-section text-primary mb-3">{form.successMessage || 'Thank you!'}</h2>
                <p className="text-muted-foreground mb-8">We’ve received your details and will be in touch shortly.</p>
                <Button asChild variant="cta"><Link to="/">Return to home</Link></Button>
              </motion.div>
            )}

            {form && !done && (
              <Card className="shadow-xl border-border/50">
                <CardContent className="pt-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Honeypot */}
                    <input type="text" name="website" tabIndex="-1" autoComplete="off" value={values.website || ''} onChange={(e) => setField('website', e.target.value)} className="hidden" aria-hidden="true" />
                    {(form.fields || []).map((field) => (
                      <div key={field.name}>
                        <Label htmlFor={`f-${field.name}`}>
                          {field.label}{field.required ? ' *' : ''}
                        </Label>
                        {field.type === 'textarea' ? (
                          <Textarea id={`f-${field.name}`} required={field.required} rows={4} value={values[field.name] || ''} onChange={(e) => setField(field.name, e.target.value)} className="text-gray-900" />
                        ) : field.type === 'select' ? (
                          <select id={`f-${field.name}`} required={field.required} value={values[field.name] || ''} onChange={(e) => setField(field.name, e.target.value)} className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring">
                            <option value="">Select…</option>
                            {(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <Input id={`f-${field.name}`} type={field.type || 'text'} required={field.required} value={values[field.name] || ''} onChange={(e) => setField(field.name, e.target.value)} className="text-gray-900" />
                        )}
                      </div>
                    ))}
                    <Button type="submit" size="lg" variant="cta" className="w-full" disabled={submitting}>
                      {submitting ? 'Sending…' : (<><Send className="mr-1 h-5 w-5" /> {form.submitText || 'Submit'}</>)}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default FormRenderer;
