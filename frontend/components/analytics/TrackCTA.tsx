'use client';

import { useState, ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics';
import { TRACKING_EVENTS } from '@/lib/analytics/events';

interface TrackCTAProps {
  children: ReactNode;
  ctaPosition: string;
  ctaType: 'primary' | 'secondary';
  ctaText: string;
  sectionName: string;
  trackHover?: boolean;
  trackFocus?: boolean;
  additionalProperties?: Record<string, any>;
}

export function TrackCTA({
  children,
  ctaPosition,
  ctaType,
  ctaText,
  sectionName,
  trackHover = false,
  trackFocus = false,
  additionalProperties = {},
}: TrackCTAProps) {
  const [hasHovered, setHasHovered] = useState(false);
  const [hasFocused, setHasFocused] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    trackEvent(TRACKING_EVENTS.CTA_CLICKED, {
      cta_position: ctaPosition,
      cta_type: ctaType,
      cta_text: ctaText,
      section_name: sectionName,
      click_x: Math.round(rect.left + rect.width / 2),
      click_y: Math.round(rect.top + rect.height / 2),
      timestamp: new Date().toISOString(),
      ...additionalProperties,
    });
  };

  const handleHover = () => {
    if (trackHover && !hasHovered) {
      setHasHovered(true);
      trackEvent(TRACKING_EVENTS.CTA_HOVER, {
        cta_position: ctaPosition,
        cta_type: ctaType,
        cta_text: ctaText,
        section_name: sectionName,
        ...additionalProperties,
      });
    }
  };

  const handleFocus = () => {
    if (trackFocus && !hasFocused) {
      setHasFocused(true);
      trackEvent(TRACKING_EVENTS.CTA_FOCUS, {
        cta_position: ctaPosition,
        cta_type: ctaType,
        cta_text: ctaText,
        section_name: sectionName,
        ...additionalProperties,
      });
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleHover}
      onFocus={handleFocus}
      className="inline-block"
    >
      {children}
    </div>
  );
}

// Backward compatibility
export default TrackCTA;
