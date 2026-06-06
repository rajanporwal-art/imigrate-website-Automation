import React, { createContext, useContext, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PopupLeadForm from '@/components/PopupLeadForm.jsx';

/**
 * Global provider for the single, site-wide lead form. Any component can call
 * `useLeadForm().openLeadForm('Button label')` to open the standardized form as
 * a modal. The button label + current page are captured for lead-source tracking.
 */
const LeadFormContext = createContext({ openLeadForm: () => {} });

export function LeadFormProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState('Website');

  const openLeadForm = useCallback((src) => {
    setSource(src || 'Website');
    setOpen(true);
  }, []);

  return (
    <LeadFormContext.Provider value={{ openLeadForm }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Free Eligibility Check</DialogTitle>
            <DialogDescription>
              Complete the form and our immigration experts will review your profile and contact you within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <PopupLeadForm source={source} />
        </DialogContent>
      </Dialog>
    </LeadFormContext.Provider>
  );
}

export function useLeadForm() {
  return useContext(LeadFormContext);
}

export default LeadFormProvider;
