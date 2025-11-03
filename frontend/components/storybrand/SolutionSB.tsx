'use client';

import { motion } from 'framer-motion';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';
import { TrackSolutionSection } from '@/components/analytics/TrackSection';

export default function SolutionSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  const authorityPoints = [
    {
      metric: '99,9%',
      label: t.solution.authority?.uptime || 'Käyttöaika',
      icon: '🔧',
    },
    {
      metric: '50+',
      label: t.solution.authority?.customers || 'Asiakasta',
      icon: '🏢',
    },
    {
      metric: '7',
      label: t.solution.authority?.setup || 'Päivän käyttöönotto',
      icon: '⚡',
    },
  ];

  return (
    <TrackSolutionSection
      className="py-12 md:py-20 bg-gray-900"
      additionalProperties={{
        has_authority_section: true,
        authority_points_count: authorityPoints.length,
        section_layout: 'empathy_authority_solution',
      }}
    >
      <div id="solution" aria-labelledby="solution-title">
      <div className="container mx-auto px-4 md:px-6">
        {/* Empathy Statement */}
        <div className="text-center mb-12 md:mb-16">
          <h2 id="solution-title" className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8">
            {t.solution.empathy?.title || 'Ymmärrämme'}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {typeof t.solution.empathy === 'string' ? t.solution.empathy : t.solution.empathy?.description || 'Ymmärrämme, miten turhauttavaa manuaalinen työ on.'}
          </p>
        </div>

        {/* Authority Section */}
        <div className="mb-12 md:mb-16">
          <h3 className="text-xl md:text-2xl font-bold text-[var(--neon-green)] text-center mb-8 md:mb-12">
            {t.solution.authority?.title || 'Olemme auttaneet 50+ yritystä'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {authorityPoints.map((point, index) => (
              <div
                key={index}
                className="text-center bg-gray-800/50 p-6 md:p-8 rounded-lg border border-gray-700 hover:border-[var(--neon-green)] transition-colors"
                data-authority-point={index}
              >
                <div className="text-2xl md:text-3xl mb-3">{point.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">{point.metric}</div>
                <div className="text-sm md:text-base text-gray-400">{point.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Solution Statement */}
        <div className="text-center">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">
            {t.solution.statement?.title || 'Ratkaisu'}
          </h3>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t.solution.statement?.description || t.solution.result}
          </p>
        </div>
      </div>
      </div>
    </TrackSolutionSection>
  );
}
