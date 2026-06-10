
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Mail, Phone, MapPin, Clock, Send, Linkedin, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyConsultationButton from '@/components/StickyConsultationButton.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { submitLead } from '@/lib/leads';
import { useSiteContent } from '@/lib/siteContent.jsx';
import LeadForm from '@/components/LeadForm.jsx';

function ContactPage() {
  const { toast } = useToast();
  const { contactPage, contact = {} } = useSiteContent();
  const cPhone = contact.phone || '+60 11-2767 9613';
  const cEmail = contact.email || 'contact@imigratesolution.com';
  const cAddress = contact.address || 'KL Eco City, Levels 19, Boutique Office 1 (B-O1-D), Menara 2, No. 3 Jalan Bangsar, 59200 Kuala Lumpur';
  const cHours = contact.businessHours || 'Mon-Sun: 9:00 AM - 9:00 PM';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await submitLead({ formName: 'Contact form', fields: formData });
    toast({
      title: "Message sent successfully",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <>
      <Helmet>
        <title>Contact iMigrate Migration Solutions | Free Immigration Consultation</title>
        <meta name="description" content="Get in touch with iMigrate Migration Solutions. Book an appointment, ask questions, or visit our office in Kuala Lumpur." />
        <link rel="canonical" href="https://www.imigratesolution.com/contact" />
        <meta property="og:title" content="Contact iMigrate Migration Solutions | Free Immigration Consultation" />
        <meta property="og:description" content="Get in touch with iMigrate Migration Solutions. Book a free consultation, ask questions, or visit our office in Kuala Lumpur." />
        <meta property="og:url" content="https://www.imigratesolution.com/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.imigratesolution.com/images/imigrate-logo.jpg" />
      </Helmet>

      <Header />
      <StickyConsultationButton />

      <main>
        {/* Hero Section */}
        <section className="relative py-24 bg-secondary text-secondary-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1697638164340-6c5fc558bdf2"
              alt="Modern office interior"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-secondary/80 mix-blend-multiply"></div>
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="heading-display text-balance mb-6">{contactPage.heroTitle}</h1>
              <p className="text-xl leading-relaxed opacity-90 mb-8">
                {contactPage.heroSubtitle}
              </p>
              <Button asChild size="lg" className="bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg">
                <a href="/book-appointment">Book a Free Consultation</a>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="section-spacing bg-background">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="card-base">
                  <CardContent className="pt-8">
                    <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
                    <LeadForm source="Contact page" />
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info & Socials */}
              <div className="space-y-6">
                <Card className="card-base">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-6">Contact Information</h3>
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Phone</p>
                          <a href={`tel:${cPhone}`} className="text-muted-foreground hover:text-primary transition-colors">
                            {cPhone}
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Email</p>
                          <a href={`mailto:${cEmail}`} className="text-muted-foreground hover:text-primary transition-colors break-all">
                            {cEmail}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Office Address</p>
                          <p className="text-muted-foreground">
                            {cAddress}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Business Hours</p>
                          <p className="text-muted-foreground">Mon-Sun: 9:00 AM - 9:00 PM</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-border">
                      <h4 className="font-medium mb-4">Connect with us</h4>
                      <div className="flex space-x-3">
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-200">
                          <Linkedin className="h-5 w-5" />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-200">
                          <Facebook className="h-5 w-5" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-200">
                          <Instagram className="h-5 w-5" />
                        </a>
                        <a href="https://wa.me/601127679613" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-200">
                          <MessageCircle className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="pb-24 bg-background">
          <div className="container-custom">
            <div className="rounded-2xl overflow-hidden shadow-lg h-[500px] border border-border">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=101.6700,3.1150,101.6800,3.1250&layer=mapnik&marker=3.1196,101.6743"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                title="iMigrate Migration Solutions KL Eco City Office"
              ></iframe>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default ContactPage;
