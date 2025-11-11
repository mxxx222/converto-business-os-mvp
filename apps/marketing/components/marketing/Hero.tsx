'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCallback } from 'react';
import data from '../../content/mapping.json';

export default function Hero(): JSX.Element {
  const hero = data.hero;

  // Parallax motion values
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const sx = useSpring(mvX, { stiffness: 120, damping: 20, mass: 0.3 });
  const sy = useSpring(mvY, { stiffness: 120, damping: 20, mass: 0.3 });
  // Map to subtle transforms
  const titleTiltX = useTransform(sy, [ -50, 50 ], [ 6, -6 ]);
  const titleTiltY = useTransform(sx, [ -50, 50 ], [ -6, 6 ]);
  const float1X = useTransform(sx, (v) => v * 0.4);
  const float1Y = useTransform(sy, (v) => v * 0.4);
  const float2X = useTransform(sx, (v) => v * -0.3);
  const float2Y = useTransform(sy, (v) => v * -0.25);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Normalize to [-50, 50]
    const dx = ((e.clientX - cx) / rect.width) * 100;
    const dy = ((e.clientY - cy) / rect.height) * 100;
    mvX.set(Math.max(-50, Math.min(50, dx)));
    mvY.set(Math.max(-50, Math.min(50, dy)));
  }, [mvX, mvY]);

  return (
    <section className="hero-gradient min-h-screen flex items-center justify-center px-4" onMouseMove={onMouseMove}>
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold gradient-text mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ rotateX: titleTiltX as unknown as number, rotateY: titleTiltY as unknown as number }}
          >
            {hero.title}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
                 <motion.a
                   href="/pilot"
                   className="btn-primary text-lg px-8 py-4"
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   🚀 Liity Pilot-Ohjelmaan
                 </motion.a>

                 <motion.a
                   href="/pricing"
                   className="btn-secondary text-lg px-8 py-4"
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   Hinnoittelu
                 </motion.a>
          </motion.div>
        </motion.div>

        {/* Floating elements for visual appeal */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ x: float1X, y: float1Y }}
        />

        <motion.div
          className="absolute bottom-20 right-10 w-16 h-16 bg-accent-200 rounded-full opacity-20"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -180, -360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ x: float2X, y: float2Y }}
        />
      </div>
    </section>
  );
}
