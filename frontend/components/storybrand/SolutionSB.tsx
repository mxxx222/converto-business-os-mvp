'use client';

import { motion } from 'framer-motion';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';

export default function SolutionSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  const lines = [t.solution.empathy, t.solution.authority, t.solution.result];

  return (
    <section className="bg-black text-white py-12 md:py-20 text-center" id="solution" aria-labelledby="solution-title">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <h2 id="solution-title" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 md:mb-12 neon-glow">
          Ratkaisu
        </h2>
        {lines.map((line, i) => (
          <motion.p
            key={i}
            className="text-base sm:text-lg md:text-xl mt-4 md:mt-6 text-gray-300 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </section>
  );
}
