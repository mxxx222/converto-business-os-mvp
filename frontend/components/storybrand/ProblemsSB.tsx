'use client';

import { motion } from 'framer-motion';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';
import { TrackProblemsSection } from '@/components/analytics/TrackSection';

export default function ProblemsSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  const problems = [
    {
      type: t.problems.external?.type || 'Ulkoinen ongelma',
      description: typeof t.problems.external === 'string' ? t.problems.external : t.problems.external?.description || 'Ulkoinen ongelma',
      icon: '⏰',
      color: 'from-red-500/20 to-red-600/20',
      severity: 'high',
    },
    {
      type: t.problems.internal?.type || 'Sisäinen ongelma',
      description: typeof t.problems.internal === 'string' ? t.problems.internal : t.problems.internal?.description || 'Sisäinen ongelma',
      icon: '😤',
      color: 'from-orange-500/20 to-orange-600/20',
      severity: 'medium',
    },
    {
      type: t.problems.philosophical?.type || 'Filosofinen ongelma',
      description: typeof t.problems.philosophical === 'string' ? t.problems.philosophical : t.problems.philosophical?.description || 'Filosofinen ongelma',
      icon: '⚡',
      color: 'from-purple-500/20 to-purple-600/20',
      severity: 'critical',
    },
  ];

  return (
    <TrackProblemsSection
      className="bg-black text-white py-12 md:py-20"
      additionalProperties={{
        problem_count: problems.length,
        problem_types: problems.map((p) => p.severity),
        section_style: 'three_column_grid',
      }}
    >
      <div id="problems" aria-labelledby="problems-title">
      <div className="container mx-auto px-4 md:px-6">
        <h2
          id="problems-title"
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 md:mb-16"
        >
          {t.problems.title || 'Tunnistamme ongelmasi'}
        </h2>

        {/* Mobile-first grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={`bg-gradient-to-br ${problem.color} bg-gray-900 p-6 md:p-8 rounded-lg border border-gray-800 hover:border-[var(--neon-green)] transition-all duration-300 hover:scale-105`}
              data-problem-type={problem.severity}
              data-problem-index={index}
            >
              {/* Suurempi emoji mobile-laitteille */}
              <div className="text-3xl md:text-4xl mb-4 text-center md:text-left">
                {problem.icon}
              </div>

              <h3 className="text-[var(--neon-green)] font-bold text-lg md:text-xl mb-3 md:mb-4 text-center md:text-left">
                {problem.type}
              </h3>

              <p className="text-gray-300 text-sm md:text-base leading-relaxed text-center md:text-left">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      </div>
    </TrackProblemsSection>
  );
}
