
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { submitLead } from '@/lib/leads';
import LeadForm from '@/components/LeadForm.jsx';

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
];

const CONSULTATION_TYPES = [
  'Initial Assessment',
  'Visa Strategy',
  'Business Immigration',
  'Student Visa',
  'Partner Visa',
  'Other'
];

function BookAppointmentPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    consultationType: '',
    notes: '',
    confirmed: false
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.confirmed) {
      toast({
        title: "Confirmation required",
        description: "Please confirm that the information provided is accurate.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    // Durably capture the booking request and forward to HubSpot.
    await submitLead({ formName: 'Book Free Consultation', fields: formData });
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSubmitting(false);
  };

  // Get tomorrow's date as minimum date for booking
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (isSuccess) {
    return (
      <>
        <Header />
        <main className="min-h-[70vh] flex items-center justify-center bg-background py-20">
          <div className="container-custom max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-3xl p-12 shadow-xl"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Appointment Requested!</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Thank you, {formData.fullName}. Your appointment request for <strong>{formData.preferredDate}</strong> at <strong>{formData.preferredTime}</strong> has been received. We will send a confirmation email shortly.
              </p>
              <Button asChild size="lg" className="bg-cta text-cta-foreground hover:bg-[hsl(var(--cta-hover))] shadow-md hover:shadow-lg">
                <a href="/">Return to Home</a>
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Book a Free Immigration Consultation | iMigrate Solutions</title>
        <meta name="description" content="Schedule a consultation with our expert immigration consultants for Australia and Canada." />
        <link rel="canonical" href="https://www.imigratesolution.com/book-appointment" />
        <meta property="og:title" content="Book a Free Immigration Consultation | iMigrate Solutions" />
        <meta property="og:description" content="Schedule a free consultation with our expert immigration consultants for Australia and Canada. Get personalised advice within 24 hours." />
        <meta property="og:url" content="https://www.imigratesolution.com/book-appointment" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.imigratesolution.com/images/imigrate-logo.jpg" />
      </Helmet>

      <Header />

      <main className="bg-background min-h-screen pb-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden py-20">
          <div className="absolute inset-0 opacity-15">
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1600&auto=format&fit=crop"
              alt="Immigration consultation with professional advisor"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/75" />
          <div className="container-custom relative z-10">
            <div className="max-w-3xl">
              <div className="gold-rule mb-5" />
              <h1 className="heading-display mb-4">Book a Free Consultation</h1>
              <p className="text-xl opacity-90">
                Take the first step towards your global future. Complete the form below and a dedicated immigration expert will contact you within 24 hours.
              </p>
            </div>
          </div>
        </section>

        <section className="section-spacing">
          <div className="container-custom max-w-4xl">
            <Card className="card-base shadow-xl border-border/50">
              <CardContent className="pt-8">
                <LeadForm source="Book a consultation page" />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default BookAppointmentPage;
