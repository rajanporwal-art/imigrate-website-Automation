
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Wallet, BadgeCheck, Headset } from 'lucide-react';
import { useSiteContent } from '@/lib/siteContent.jsx';

/**
 * Prominent trust / benefit highlights band.
 * The first two cards (Money-Back Guarantee & Pay As You Go) are visually
 * featured with navy background, gold icon, and a "Featured" badge.
 */
const ICONS = [ShieldCheck, Wallet, BadgeCheck, Headset];

const BADGES = ['⭐ Our Promise', '⭐ Our Model', null, null];

function TrustHighlights() {
  const { highlights, home } = useSiteContent();

  return (
    <section className="section-spacing bg-muted">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="gold-rule mx-auto mb-4" />
          <h2 className="heading-section text-balance mb-4 text-primary">{home.highlightsHeading}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {home.highlightsSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => {
            const Icon = ICONS[index] || ShieldCheck;
            const featured = index < 2;
            const badge = BADGES[index];

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`relative rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${
                  featured
                    ? 'bg-primary text-primary-foreground border-accent/50 ring-2 ring-accent/30'
                    : 'bg-card text-card-foreground border-border'
                }`}
              >
                {/* Badge label for featured cards */}
                {badge && (
                  <span className="absolute -top-3 left-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                    {badge}
                  </span>
                )}

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                    featured ? 'bg-accent' : 'bg-accent/10'
                  }`}
                >
                  <Icon className={`h-7 w-7 ${featured ? 'text-accent-foreground' : 'text-accent'}`} />
                </div>

                {/* Title — larger & bolder for featured */}
                <h3
                  className={`mb-2 text-balance leading-snug ${
                    featured ? 'text-xl font-bold' : 'text-lg font-semibold'
                  }`}
                >
                  {item.title}
                </h3>

                <p
                  className={`text-sm leading-relaxed flex-1 ${
                    featured ? 'opacity-90' : 'text-muted-foreground'
                  }`}
                >
                  {item.description}
                </p>

                {/* Visual accent line for featured */}
                {featured && (
                  <div className="mt-4 h-1 w-10 rounded-full bg-accent" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TrustHighlights;
