'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useInView } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';
import { TRACKING_EVENTS } from '@/lib/analytics/events';

interface TrackSectionProps {
  children: ReactNode;
  className?: string;
  sectionName: string;
  eventName?: string;
  additionalProperties?: Record<string, any>;
  trackScrollDepth?: boolean;
}

export function TrackSection({
  children,
  className = '',
  sectionName,
  eventName = TRACKING_EVENTS.SECTION_VIEW,
  additionalProperties = {},
  trackScrollDepth = false,
}: TrackSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-100px',
  });

  useEffect(() => {
    if (isInView) {
      trackEvent(eventName, {
        section_name: sectionName,
        timestamp: new Date().toISOString(),
        ...additionalProperties,
      });
    }
  }, [isInView, sectionName, eventName, additionalProperties]);

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}

// Specific section trackers
export function TrackHeroSection(props: Omit<TrackSectionProps, 'sectionName' | 'eventName'>) {
  return <TrackSection sectionName="hero" eventName="hero_section_view" {...props} />;
}

export function TrackProblemsSection(props: Omit<TrackSectionProps, 'sectionName' | 'eventName'>) {
  return <TrackSection sectionName="problems" eventName="problems_section_view" {...props} />;
}

export function TrackSolutionSection(props: Omit<TrackSectionProps, 'sectionName' | 'eventName'>) {
  return <TrackSection sectionName="solution" eventName="solution_section_view" {...props} />;
}

export function TrackPlanSection(props: Omit<TrackSectionProps, 'sectionName' | 'eventName'>) {
  return <TrackSection sectionName="plan" eventName="plan_section_view" {...props} />;
}

export function TrackSuccessSection(props: Omit<TrackSectionProps, 'sectionName' | 'eventName'>) {
  return <TrackSection sectionName="success" eventName="success_section_view" {...props} />;
}
