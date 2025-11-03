export function trackEvent(
  event: string,
  data?: Record<string, any>
) {
  if (typeof window === 'undefined') return;

  // Plausible
  if ((window as any).plausible) {
    (window as any).plausible(event, { props: data });
  }

  // PostHog (vain jos käytössä)
  if (
    process.env.NEXT_PUBLIC_AB_TESTING === 'true' &&
    window.posthog
  ) {
    window.posthog.capture(event, data);
  }
}
