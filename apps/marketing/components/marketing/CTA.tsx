'use client';

import { motion } from 'framer-motion';
import data from '../../content/mapping.json';

export default function CTA(): JSX.Element {
  const cta = data.ctaBlock;

  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-white"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {cta.title}
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            {cta.subtitle}
          </p>

          <motion.a
            href={cta.cta.href}
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {cta.cta.label}
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
