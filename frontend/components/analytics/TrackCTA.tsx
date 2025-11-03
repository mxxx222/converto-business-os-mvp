'use client';

import { trackEvent } from '@/lib/analytics';

export default function TrackCTA({
  label,
  variant,
  children,
}: {
  label: string;
  variant: string;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={() => trackEvent('CTA Clicked', { label, variant })}
      className="inline-block"
    >
      {children}
    </div>
  );
}
