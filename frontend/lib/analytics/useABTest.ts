'use client';

import { useState, useEffect } from 'react';

interface ABTestConfig {
  testName: string;
  variants: Record<string, { weight: number; path: string }>;
  cookieName: string;
  cookieMaxAge: number;
}

const DEFAULT_CONFIG: ABTestConfig = {
  testName: 'storybrand_vs_original',
  variants: {
    original: { weight: 50, path: '/' },
    storybrand: { weight: 50, path: '/storybrand' },
  },
  cookieName: 'ab_test_variant',
  cookieMaxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export function useABTest(config: ABTestConfig = DEFAULT_CONFIG) {
  const [variant, setVariant] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Get variant from cookie
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${config.cookieName}=`))
      ?.split('=')[1];

    if (cookieValue && Object.keys(config.variants).includes(cookieValue)) {
      setVariant(cookieValue);
    } else {
      // Get variant from header (set by middleware)
      const headerValue =
        typeof document !== 'undefined'
          ? document
              .querySelector('meta[http-equiv="x-ab-test-variant"]')
              ?.getAttribute('content') || null
          : null;

      if (headerValue) {
        setVariant(headerValue);
      } else {
        // Default to original if not set
        setVariant('original');
      }
    }
  }, [config]);

  return {
    variant: isClient ? variant : null,
    isClient,
    isOriginal: variant === 'original',
    isStorybrand: variant === 'storybrand',
    config,
  };
}
