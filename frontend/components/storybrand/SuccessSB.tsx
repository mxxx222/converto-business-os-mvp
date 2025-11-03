'use client';

import { motion } from 'framer-motion';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';

export default function SuccessSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  const metrics = [t.success.metric1, t.success.metric2, t.success.metric3];

  return (
    <section className="bg-black text-white py-12 md:py-20 text-center" id="success" aria-labelledby="success-title">
      <div className="container mx-auto px-4 md:px-6">
        <h2 id="success-title" className="text-2xl sm:text-3xl md:text-4xl neon-glow mb-8 md:mb-12">
          Tulokset
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-8 max-w-6xl mx-auto">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              className="neon-border p-6 md:p-8 rounded-lg max-w-xs mx-auto w-full md:w-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <p className="text-sm md:text-base text-gray-300">{m}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
