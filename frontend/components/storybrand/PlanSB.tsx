'use client';

import { motion } from 'framer-motion';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';
import { TrackPlanSection } from '@/components/analytics/TrackSection';

export default function PlanSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  const steps = [
    {
      number: 1,
      title: t.plan.step1?.title || 'Aloita pilotti',
      description: t.plan.step1?.description || t.plan.steps[0],
      icon: '🎯',
      duration: '5 min',
    },
    {
      number: 2,
      title: t.plan.step2?.title || 'Automatisoi',
      description: t.plan.step2?.description || t.plan.steps[1],
      icon: '🔗',
      duration: '1-2 päivää',
    },
    {
      number: 3,
      title: t.plan.step3?.title || 'Kasva',
      description: t.plan.step3?.description || t.plan.steps[2],
      icon: '📈',
      duration: 'Jatkuva',
    },
  ];

  return (
    <TrackPlanSection
      className="py-12 md:py-20 bg-black"
      id="plan"
      aria-labelledby="plan-title"
      additionalProperties={{
        plan_steps_count: steps.length,
        plan_complexity: 'simple',
        has_duration_estimates: true,
      }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 id="plan-title" className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8 neon-glow">
            {t.plan.title || '3-vaiheinen suunnitelma'}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            {t.plan.subtitle || 'Aloita matkasi kohti automatisoitua liiketoimintaa'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center" data-step-number={step.number} data-step-duration={step.duration}>
              {/* Connection line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-[var(--neon-green)] to-transparent -translate-y-1/2 z-0" />
              )}

              <motion.div
                className="relative z-10 neon-border p-6 md:p-8 rounded-xl max-w-sm mx-auto w-full md:w-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                {/* Step number */}
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[var(--neon-green)] text-black font-bold text-xl md:text-2xl rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-3xl md:text-4xl mb-4">{step.icon}</div>

                {/* Title */}
                <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">{step.title}</h3>

                {/* Description */}
                <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">{step.description}</p>

                {/* Duration estimate */}
                <div className="text-xs md:text-sm text-[var(--neon-green)] font-medium">⏱️ {step.duration}</div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </TrackPlanSection>
  );
}
