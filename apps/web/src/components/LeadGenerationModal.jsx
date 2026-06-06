
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PopupLeadForm from '@/components/PopupLeadForm.jsx';

function LeadGenerationModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem('hasSeenLeadModal');
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('hasSeenLeadModal', 'true');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Start your immigration journey today</DialogTitle>
          <DialogDescription>
            Get a free consultation with our immigration experts. We've helped people from over 40 countries achieve their dreams.
          </DialogDescription>
        </DialogHeader>
        <PopupLeadForm source="Homepage pop-up" />
      </DialogContent>
    </Dialog>
  );
}

export default LeadGenerationModal;
