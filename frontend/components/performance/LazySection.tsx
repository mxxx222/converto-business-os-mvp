'use client';

import { useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  className?: string;
}

export function LazySection({ children, className }: LazySectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '100px', // Lataa 100px ennen näkyvyyttä
  });

  return (
    <div ref={ref} className={className}>
      {isInView ? children : <div className="h-96 bg-gray-900/20" />}
    </div>
  );
}
