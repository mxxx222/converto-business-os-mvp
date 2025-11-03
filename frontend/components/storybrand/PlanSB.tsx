'use client';

import { motion } from 'framer-motion';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';

export default function PlanSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  return (
    <section className="bg-black text-white py-20">
      <h2 className="text-3xl font-semibold text-center mb-10 neon-glow">3 Step Plan</h2>
      <div className="flex flex-col md:flex-row justify-center gap-8 text-center">
        {t.plan.steps.map((s, i) => (
          <motion.div
            key={i}
            className="neon-border p-6 rounded-xl max-w-sm mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
          >
            <h3 className="text-2xl font-bold mb-2">{i + 1}</h3>
            <p>{s}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
