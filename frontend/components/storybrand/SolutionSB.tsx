'use client';

import { motion } from 'framer-motion';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';

export default function SolutionSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  const lines = [t.solution.empathy, t.solution.authority, t.solution.result];

  return (
    <section className="bg-black text-white py-20 text-center">
      {lines.map((line, i) => (
        <motion.p
          key={i}
          className="text-lg mt-4 text-gray-300"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.2 }}
        >
          {line}
        </motion.p>
      ))}
    </section>
  );
}
