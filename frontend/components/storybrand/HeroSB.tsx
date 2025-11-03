'use client';

import { motion } from 'framer-motion';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';
import { TrackCTA } from '@/components/analytics/TrackCTA';
import { TrackHeroSection } from '@/components/analytics/TrackSection';

export default function HeroSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  return (
    <TrackHeroSection
      className="relative min-h-screen bg-black text-white overflow-hidden"
      additionalProperties={{
        hero_variant: 'storybrand',
        has_trust_indicators: true,
        cta_count: 2,
      }}
    >
      {/* Mobile-optimoitu tausta */}
      <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-br from-gray-900 to-black" />

      {/* Mobile-friendly neon-efektit */}
      <div className="absolute top-10 md:top-20 left-4 md:left-20 w-32 md:w-64 h-32 md:h-64 bg-[var(--neon-green)] opacity-10 blur-2xl md:blur-3xl rounded-full" />

      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-20 md:pt-32 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Mobile-optimoitu otsikko */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 md:mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {t.hero.title?.part1 || t.hero.headline.split('–')[0]}
            <span className="text-[var(--neon-green)] block sm:inline neon-glow">
              {' '}
              {t.hero.title?.part2 || 'vapauta'}
            </span>
            {' '}
            {t.hero.title?.part3 || '10 tuntia'}
            <span className="text-[var(--neon-green)] block sm:inline neon-glow">
              {' '}
              {t.hero.title?.part4 || 'viikossa'}
            </span>
          </motion.h1>

          {/* Mobile-optimoitu alaotsikko */}
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t.hero.subtitle || t.hero.sub}
          </motion.p>

          {/* Mobile-stack CTA:t with enhanced tracking */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-8 md:mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
                  <TrackCTA
                    ctaPosition="hero"
                    ctaType="primary"
                    ctaText={typeof t.hero.cta === 'string' ? t.hero.cta : t.hero.cta?.primary || 'Kokeile 30 päivää ilmaiseksi'}
                    sectionName="hero"
                    trackHover={true}
                    trackFocus={true}
                    additionalProperties={{
                      cta_style: 'neon_button',
                      cta_color: 'green',
                      expected_conversion: 'demo_request',
                    }}
                  >
                    <button className="neon-button w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold">
                      {typeof t.hero.cta === 'string' ? t.hero.cta : t.hero.cta?.primary || 'Kokeile 30 päivää ilmaiseksi'}
                    </button>
                  </TrackCTA>

                  <TrackCTA
                    ctaPosition="hero"
                    ctaType="secondary"
                    ctaText={typeof t.hero.cta === 'string' ? 'Pyydä demo' : t.hero.cta?.secondary || 'Pyydä demo'}
                    sectionName="hero"
                    trackHover={true}
                    additionalProperties={{
                      cta_style: 'neon_border',
                      cta_color: 'green_outline',
                      expected_conversion: 'demo_request',
                    }}
                  >
                    <button className="neon-border w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-2 border-[var(--neon-green)] text-white rounded-lg hover:opacity-80 transition-all">
                      {typeof t.hero.cta === 'string' ? 'Pyydä demo' : t.hero.cta?.secondary || 'Pyydä demo'}
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
              <span>{t.hero.trust?.uptime || '99,9% käyttöaika'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--neon-green)] rounded-full"></span>
              <span>{t.hero.trust?.setup || '7 päivän käyttöönotto'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--neon-green)] rounded-full"></span>
              <span>{t.hero.trust?.customers || '50+ tyytyväistä asiakasta'}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </TrackHeroSection>
  );
}
