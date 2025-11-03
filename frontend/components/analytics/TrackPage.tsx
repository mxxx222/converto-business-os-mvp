'use client';

import { useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import { TRACKING_EVENTS } from '@/lib/analytics/events';

interface TrackPageProps {
  children: ReactNode;
  pageName: string;
  pageType?: string;
  enableScrollTracking?: boolean;
  enableExitIntent?: boolean;
  additionalProperties?: Record<string, any>;
}

export function TrackPage({
  children,
  pageName,
  pageType = 'landing',
  enableScrollTracking = true,
  enableExitIntent = false,
  additionalProperties = {},
}: TrackPageProps) {
  const pathname = usePathname();

  // Track page view
  useEffect(() => {
    trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
      page_name: pageName,
      page_type: pageType,
      page_path: pathname,
      timestamp: new Date().toISOString(),
      ...additionalProperties,
    });
  }, [pathname, pageName, pageType, additionalProperties]);

  // Scroll depth tracking
  useEffect(() => {
    if (!enableScrollTracking) return;

    const scrollDepths = [25, 50, 75, 100];
    const trackedDepths = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);

      scrollDepths.forEach((depth) => {
        if (scrollPercent >= depth && !trackedDepths.has(depth)) {
          trackedDepths.add(depth);
          trackEvent(TRACKING_EVENTS.PAGE_SCROLL_DEPTH, {
            page_name: pageName,
            scroll_depth: depth,
            ...additionalProperties,
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableScrollTracking, pageName, additionalProperties]);

  // Exit intent tracking
  useEffect(() => {
    if (!enableExitIntent) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        trackEvent(TRACKING_EVENTS.PAGE_EXIT_INTENT, {
          page_name: pageName,
          ...additionalProperties,
        });
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [enableExitIntent, pageName, additionalProperties]);

  return <>{children}</>;
}
