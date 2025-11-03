import posthog from './posthog';

export function trackEvent(
  event: string,
  data?: Record<string, any>
) {
  // Plausible
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(event, { props: data });
  }

  // PostHog (vain jos käytössä)
  if (
    process.env.NEXT_PUBLIC_AB_TESTING === 'true' &&
    posthog?.capture
  ) {
    posthog.capture(event, data);
  }
}
