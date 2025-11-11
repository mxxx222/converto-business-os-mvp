'use client';

import { motion } from 'framer-motion';
import data from '../../content/mapping.json';

export default function ValueProps(): JSX.Element {
  const valueProps: Array<{ title: string; desc: string }> = data.valueProps;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Miksi valita CONVERTO?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Moderni, nopea ja skaalautuva ratkaisu yrityksellesi
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
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

                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-primary-600 transition-colors">
                  {prop.title}
                </h3>

                <p className="text-slate-600 leading-relaxed">
                  {prop.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
