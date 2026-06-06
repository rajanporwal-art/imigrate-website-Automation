
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

function ServiceCard({ icon: Icon, title, description, link }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50">
        <CardContent className="pt-6 flex-1">
          <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
            <Icon className="h-7 w-7 text-accent" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-balance">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button asChild variant="ghost" className="group px-0 hover:bg-transparent">
            <Link to={link} className="flex items-center space-x-2">
              <span className="text-accent group-hover:text-[hsl(var(--button-hover))] font-medium transition-colors">Get started</span>
              <ArrowRight className="h-4 w-4 text-accent group-hover:text-[hsl(var(--button-hover))] group-hover:translate-x-1 transition-all duration-200" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default ServiceCard;
