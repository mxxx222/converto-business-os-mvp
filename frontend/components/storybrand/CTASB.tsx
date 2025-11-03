'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

import { TrackCTA } from '@/components/analytics/TrackCTA';
import { TrackSection } from '@/components/analytics/TrackSection';
import { TRACKING_EVENTS } from '@/lib/analytics/events';
import { useSBTranslation } from '@/lib/i18n/useSBTranslation';
import { DemoForm } from './DemoForm';

export default function CTASB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);
  const [showDemoForm, setShowDemoForm] = useState(false);

  const handleDemoClick = () => {
    setShowDemoForm(true);
    // Track demo form open
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('demo_form_opened', {
        variant: 'storybrand',
        source: 'cta_section',
      });
    }
  };

  const handlePilotClick = () => {
    // Track pilot CTA click
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('pilot_cta_clicked', {
        variant: 'storybrand',
        source: 'cta_section',
      });
    }
    // Redirect to pilot page
    window.location.href = '/business-os/pilot';
  };

  const successMetrics = [
    {
      value: '+40%',
      label: t.cta.success?.metric1 || 'Enemmän aikaa strategialle',
      icon: '📈',
    },
    {
      value: '0',
      label: t.cta.success?.metric2 || 'Ydinvirheitä kirjanpidossa',
      icon: '✅',
    },
    {
      value: '24/7',
      label: t.cta.success?.metric3 || 'Asiakastuki vastaa',
      icon: '🚀',
    },
  ];

  return (
    <TrackSection
      sectionName="final_cta"
      eventName={TRACKING_EVENTS.FINAL_CTA_PRIMARY}
      className="bg-gradient-to-r from-gray-900 to-black py-12 md:py-20"
      additionalProperties={{
        has_failure_scenario: true,
        has_success_metrics: true,
        metrics_count: successMetrics.length,
        cta_count: 2,
      }}
    >
      <div id="cta" aria-labelledby="cta-title">
        <div className="container mx-auto px-4 md:px-6 text-center">
        {/* Mobile-optimoitu failure scenario */}
        <motion.div
          className="mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 id="cta-title" className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">
            {t.cta.failure?.title || 'Älä anna rutiinien varjostaa potentiaaliasi'}
          </h2>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t.cta.failure?.description || 'Aloita ilmainen 30 päivän pilotti ja koe, miten paljon aikaa vapautuu kasvulle.'}
          </p>
        </motion.div>

        {showDemoForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 md:mb-12"
          >
            <DemoForm source="storybrand" variant="storybrand" />
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <TrackCTA
              ctaPosition="bottom"
              ctaType="primary"
              ctaText={typeof t.cta.primary === 'string' ? t.cta.primary : t.cta.primary?.text || 'Aloita nyt'}
              sectionName="final_cta"
              trackHover={true}
              trackFocus={true}
              additionalProperties={{
                cta_context: 'after_failure_scenario',
                expected_urgency: 'high',
                conversion_intent: 'demo_request',
              }}
            >
              <button
                onClick={handlePilotClick}
                className="neon-button w-full sm:w-auto px-8 md:px-12 py-4 text-lg md:text-xl font-bold"
              >
                {typeof t.cta.primary === 'string' ? t.cta.primary : t.cta.primary?.text || 'Aloita nyt'}
              </button>
            </TrackCTA>

            <TrackCTA
              ctaPosition="bottom"
              ctaType="secondary"
              ctaText={typeof t.cta.secondary === 'string' ? t.cta.secondary : t.cta.secondary?.text || 'Pyydä demo'}
              sectionName="final_cta"
              trackHover={true}
              additionalProperties={{
                cta_context: 'after_failure_scenario',
                expected_urgency: 'medium',
                conversion_intent: 'pdf_download',
              }}
            >
              <button
                onClick={handleDemoClick}
                className="w-full sm:w-auto border-2 border-gray-500 px-8 md:px-12 py-4 text-lg md:text-xl text-white rounded-lg hover:border-[var(--neon-green)] hover:opacity-80 transition-all"
              >
                {typeof t.cta.secondary === 'string' ? t.cta.secondary : t.cta.secondary?.text || 'Pyydä demo'}
              </button>
            </TrackCTA>
          </motion.div>
        )}

        {/* Mobile-optimoitu success scenario */}
        <motion.div
          className="bg-gray-800/50 rounded-lg p-6 md:p-8 border border-gray-700 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg md:text-xl font-bold text-[var(--neon-green)] mb-4 md:mb-6">
            {t.cta.success?.title || 'Kun valitset Converton:'}
          </h3>

          {/* Mobile-friendly metriikat */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-center">
            {successMetrics.map((metric, index) => (
              <div key={index} className="p-4" data-metric-index={index} data-metric-value={metric.value}>
                <div className="text-xl md:text-2xl mb-2">{metric.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-sm md:text-base text-gray-400">{metric.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial quote */}
          {t.cta.testimonial && (
            <blockquote className="mt-6 md:mt-8 text-base md:text-lg italic text-gray-300">
              "{t.cta.testimonial}"
            </blockquote>
          )}
        </motion.div>
        </div>
      </div>
    </TrackSection>
  );
}
