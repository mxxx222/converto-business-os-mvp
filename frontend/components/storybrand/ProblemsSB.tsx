'use client';

import { motion } from 'framer-motion';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';

export default function ProblemsSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  const problems = [
    t.problems.external,
    t.problems.internal,
    t.problems.philosophical,
  ];

  return (
    <section className="bg-black text-white py-16">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        {problems.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="text-lg text-gray-300"
          >
            {p}
          </motion.p>
        ))}
      </div>
    </section>
  );
}
