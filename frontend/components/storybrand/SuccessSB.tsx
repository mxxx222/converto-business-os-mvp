'use client';

import { motion } from 'framer-motion';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';

export default function SuccessSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  const metrics = [t.success.metric1, t.success.metric2, t.success.metric3];

  return (
    <section className="bg-black text-white py-20 text-center">
      <h2 className="text-3xl neon-glow mb-10">Results</h2>
      <div className="flex flex-col md:flex-row justify-center gap-8">
        {metrics.map((m, i) => (
          <motion.div
            key={i}
            className="neon-border p-6 rounded-lg max-w-xs mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
          >
            {m}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
