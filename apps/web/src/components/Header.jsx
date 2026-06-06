
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Linkedin, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useSiteContent } from '@/lib/siteContent.jsx';
import { useLeadForm } from '@/components/LeadFormModal.jsx';

function Header() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { contact, social } = useSiteContent();
  const { openLeadForm } = useLeadForm();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Australia PR', path: '/australia-migration' },
    { name: 'Canada PR', path: '/canada-immigration' },
    { name: 'C11 Permit', path: '/c11-entrepreneur-work-permit' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background text-foreground shadow-sm border-b border-border">
      {/* Top contact bar */}
      <div className="bg-secondary text-secondary-foreground py-1.5 hidden md:block">
        <div className="container-custom flex justify-between items-center text-xs">
          <div className="flex items-center gap-6">
            <span>📧 {contact.email}</span>
            <span>📞 {contact.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors" aria-label="LinkedIn"><Linkedin className="h-3.5 w-3.5" /></a>
            <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors" aria-label="Facebook"><Facebook className="h-3.5 w-3.5" /></a>
            <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors" aria-label="Instagram"><Instagram className="h-3.5 w-3.5" /></a>
            <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors" aria-label="WhatsApp"><MessageCircle className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      </div>

      {/* Main nav row */}
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/images/imigrate-logo.jpg"
              alt="iMigrate Solutions Logo"
              className="h-12 md:h-14 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:text-primary hover:bg-muted'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA buttons */}
          <div className="hidden xl:flex items-center gap-2 flex-shrink-0">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-xs px-3"
            >
              <Link to="/assessment">Free Eligibility Check</Link>
            </Button>
            <Button
              size="sm"
              className="bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg transition-colors text-xs px-3 whitespace-nowrap"
              onClick={() => openLeadForm('Header — Book Free Consultation')}
            >
              Book Free Consultation
            </Button>
          </div>

          {/* Mobile hamburger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="xl:hidden">
              <Button variant="ghost" size="icon" className="text-foreground flex-shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background text-foreground overflow-y-auto">
              <div className="flex flex-col space-y-1 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      isActive(link.path)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-4 flex flex-col gap-2 border-t border-border mt-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-primary text-primary text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/assessment">Free Eligibility Check</Link>
                  </Button>
                  <Button
                    className="w-full bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md text-sm"
                    onClick={() => { setIsOpen(false); openLeadForm('Header mobile — Book Consultation'); }}
                  >
                    Book Free Consultation
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Header;
