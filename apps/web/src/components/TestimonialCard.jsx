
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

function TestimonialCard({ name, country, visaType, testimonial, image, index }) {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full shadow-lg border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4 mb-4">
            <Avatar className="w-14 h-14 rounded-xl">
              <AvatarImage src={image} alt={name} />
              <AvatarFallback className="rounded-xl bg-accent/20 text-accent font-semibold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-lg">{name}</h4>
              <p className="text-sm text-muted-foreground">{country}</p>
              <p className="text-xs text-accent font-medium mt-1">{visaType}</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed italic">"{testimonial}"</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default TestimonialCard;
