
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Linkedin, Instagram, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSiteContent } from '@/lib/siteContent.jsx';
import { submitLead } from '@/lib/leads';
import LegalDisclaimer from '@/components/LegalDisclaimer.jsx';

function Footer() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const { contact, social, footer } = useSiteContent();

  // Footer link columns are editable from the CMS (content.json → footer.quickLinks /
  // footer.serviceLinks); each item is { label, to }. Falls back to the defaults.
  const quickLinks = Array.isArray(footer.quickLinks) && footer.quickLinks.length ? footer.quickLinks : [
    { label: 'About Us', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Success Stories', to: '/success-stories' },
    { label: 'Book Free Consultation', to: '/assessment' },
  ];
  const serviceLinks = Array.isArray(footer.serviceLinks) && footer.serviceLinks.length ? footer.serviceLinks : [
    { label: 'Australia Migration', to: '/australia-migration' },
    { label: 'Canada Immigration', to: '/canada-immigration' },
    { label: 'Student Visas', to: '/services#student' },
    { label: 'Business Visas', to: '/services#business' },
    { label: 'Free Eligibility Check', to: '/assessment' },
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      submitLead({ formName: 'Newsletter signup', fields: { email } });
      toast({
        title: "Subscribed successfully",
        description: "You'll receive our latest immigration updates.",
      });
      setEmail('');
    }
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <img 
                src="/images/imigrate-logo.jpg" 
                alt="iMigrate Migration Solutions Logo" 
                className="h-16 w-auto rounded-lg bg-white p-2" 
              />
            </div>
            <p className="text-sm leading-relaxed opacity-90 mb-6 max-w-sm">
              {footer.tagline}
            </p>
            <div className="flex space-x-3">
              <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground rounded-full flex items-center justify-center transition-all duration-200">
                <Linkedin className="h-4 w-4 text-white" />
              </a>
              <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground rounded-full flex items-center justify-center transition-all duration-200">
                <Facebook className="h-4 w-4 text-white" />
              </a>
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground rounded-full flex items-center justify-center transition-all duration-200">
                <Instagram className="h-4 w-4 text-white" />
              </a>
              <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground rounded-full flex items-center justify-center transition-all duration-200">
                <MessageCircle className="h-4 w-4 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <span className="font-semibold text-lg mb-6 block">Quick Links</span>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.to + l.label}><Link to={l.to} className="text-sm opacity-90 hover:opacity-100 hover:text-accent transition-all duration-200">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <span className="font-semibold text-lg mb-6 block">Services</span>
            <ul className="space-y-3">
              {serviceLinks.map((l) => (
                <li key={l.to + l.label}><Link to={l.to} className="text-sm opacity-90 hover:opacity-100 hover:text-accent transition-all duration-200">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <span className="font-semibold text-lg mb-6 block">Contact Us</span>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-sm opacity-90">
                <Phone className="h-5 w-5 mt-0.5 flex-shrink-0 text-accent" />
                <span>{contact.phone}</span>
              </li>
              <li className="flex items-start space-x-3 text-sm opacity-90">
                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0 text-accent" />
                <a href={`mailto:${contact.email}`} className="break-all hover:text-accent transition-colors">{contact.email}</a>
              </li>
              <li className="flex items-start space-x-3 text-sm opacity-90">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-accent" />
                <span>{contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10">
          <div className="max-w-md">
            <span className="font-semibold text-lg mb-4 block">Subscribe to our Newsletter</span>
            <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/60"
              />
              <Button type="submit" className="bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg transition-colors">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm opacity-90">© {new Date().getFullYear()} iMigrate Migration Solutions. All rights reserved.</p>
          <div className="flex space-x-6 text-sm">
            <Link to="/privacy" className="opacity-90 hover:opacity-100 hover:text-accent transition-all duration-200">Privacy Policy</Link>
            <Link to="/terms" className="opacity-90 hover:opacity-100 hover:text-accent transition-all duration-200">Terms of Service</Link>
          </div>
        </div>
        <div className="border-t border-secondary-foreground/10 mt-6 pt-6">
          <LegalDisclaimer variant="footer" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
