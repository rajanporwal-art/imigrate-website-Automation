
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function WhatsAppButton({ phoneNumber = "61298765432", message = "Hello, I would like to inquire about immigration services" }) {
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <MessageCircle className="h-5 w-5 mr-2" />
      Chat on WhatsApp
    </Button>
  );
}

export default WhatsAppButton;
