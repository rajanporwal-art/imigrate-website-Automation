
import React from 'react';
import { motion } from 'framer-motion';

function BenefitCard({ icon: Icon, title, description, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex items-start space-x-4 p-6 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2 text-balance">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export default BenefitCard;
