'use client';

import { motion } from 'framer-motion';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';
import TrackCTA from '@/components/analytics/TrackCTA';

export default function HeroSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  return (
    <section className="bg-black text-white text-center py-20 px-4">
      <motion.h1
        className="text-4xl md:text-5xl font-bold neon-glow"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {t.hero.headline}
      </motion.h1>
      <p className="text-lg text-gray-300 mt-4">{t.hero.sub}</p>
      <div className="mt-10">
        <TrackCTA label="Hero CTA" variant="StoryBrand">
          <button className="neon-button">{t.hero.cta}</button>
        </TrackCTA>
      </div>
    </section>
  );
}
