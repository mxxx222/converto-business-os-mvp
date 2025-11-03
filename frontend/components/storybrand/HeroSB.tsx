'use client';

import { motion } from 'framer-motion';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';
import TrackCTA from '@/components/analytics/TrackCTA';

export default function HeroSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  return (
    <section className="bg-black text-white text-center py-12 md:py-20 px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold neon-glow mb-4 md:mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {t.hero.headline}
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t.hero.sub}
        </motion.p>

        {/* Mobile-stack CTA:t */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-8 md:mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <TrackCTA label="Hero CTA Primary" variant="StoryBrand">
            <button className="neon-button w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold">
              {t.hero.cta}
            </button>
          </TrackCTA>
        </motion.div>

        {/* Mobile-friendly trust indicators */}
        <motion.div
          className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm md:text-base text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--neon-green)] rounded-full"></span>
            <span>99,9% käyttöaika</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--neon-green)] rounded-full"></span>
            <span>7 päivän käyttöönotto</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--neon-green)] rounded-full"></span>
            <span>50+ tyytyväistä asiakasta</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
