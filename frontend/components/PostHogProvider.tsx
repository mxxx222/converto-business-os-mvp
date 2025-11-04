'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
// import { initPostHog, trackPageView } from '@/lib/analytics/posthog'; // Optional - PostHog not installed
const initPostHog = () => {}; // Mock
const trackPageView = (path: string) => {}; // Mock

function PostHogProviderInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize PostHog
    initPostHog();
  }, []);

  useEffect(() => {
    // Track page views
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <PostHogProviderInner>{children}</PostHogProviderInner>
    </Suspense>
  );
}
