'use client';

import { motion } from 'framer-motion';
import data from '../../content/mapping.json';

export default function FeaturesGrid(): JSX.Element {
  const feats = data.features;

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Ominaisuudet
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Kaikki mitä tarvitset moderniin liiketoimintaan
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {feats.map((f: { title?: string; desc?: string }, index: number) => (
            <motion.div
              key={f.title || `feature-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card group hover:border-primary-300 transition-all duration-300"
            >
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-white text-2xl font-bold">
                    {index + 1}
                  </div>
                </motion.div>

                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-primary-600 transition-colors">
                  {f.title || `Ominaisuus ${index + 1}`}
                </h3>

                <p className="text-slate-600 leading-relaxed">
                  {f.desc || 'Moderni ratkaisu liiketoimintaasi'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
