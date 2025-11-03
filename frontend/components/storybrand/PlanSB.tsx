'use client';

import { motion } from 'framer-motion';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';

export default function PlanSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  return (
    <section className="bg-black text-white py-12 md:py-20" id="plan" aria-labelledby="plan-title">
      <div className="container mx-auto px-4 md:px-6">
        <h2 id="plan-title" className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-8 md:mb-12 neon-glow">
          3-vaiheinen suunnitelma
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-8 text-center max-w-6xl mx-auto">
          {t.plan.steps.map((s, i) => (
            <motion.div
              key={i}
              className="neon-border p-6 md:p-8 rounded-xl max-w-sm mx-auto w-full md:w-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">{i + 1}</h3>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed">{s}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
