
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '@/lib/siteContent.jsx';
import { useLeadForm } from '@/components/LeadFormModal.jsx';

function StickyConsultationButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { contact } = useSiteContent();
  const { openLeadForm } = useLeadForm();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-40 flex flex-col gap-2 sm:gap-3"
        >
          {/* WhatsApp — circle on mobile, pill on desktop */}
          <a
            href={`https://wa.me/${contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full font-semibold
              w-11 h-11 p-0
              sm:w-auto sm:h-auto sm:px-4 sm:py-3 sm:text-sm"
          >
            <MessageCircle className="h-5 w-5 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">WhatsApp Us</span>
          </a>
          {/* Book Consultation — circle on mobile, pill on desktop */}
          <button
            onClick={() => openLeadForm('Sticky button — Book Free Consultation')}
            aria-label="Book Free Consultation"
            className="flex items-center justify-center gap-2 bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-xl transition-all duration-300 rounded-full font-semibold
              w-11 h-11 p-0
              sm:w-auto sm:h-auto sm:px-5 sm:py-3 sm:text-sm"
          >
            <Calendar className="h-5 w-5 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Book Free Consultation</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StickyConsultationButton;
