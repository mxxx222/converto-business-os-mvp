'use client';

import { ReactNode, useRef, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import { TRACKING_EVENTS } from '@/lib/analytics/events';

interface TrackFormProps {
  children: (formTracking: FormTracking) => ReactNode;
  formName: string;
  formType: string;
  className?: string;
}

export interface FormTracking {
  trackFieldInteraction: (fieldName: string, action: 'focus' | 'blur' | 'change') => void;
  trackFieldError: (fieldName: string, error: string) => void;
  trackSubmit: (success: boolean, errors?: string[]) => void;
}

export function TrackForm({ children, formName, formType, className = '' }: TrackFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const fieldInteractions = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Track form view
    trackEvent(TRACKING_EVENTS.FORM_OPENED, {
      form_name: formName,
      form_type: formType,
    });
  }, [formName, formType]);

  const trackFieldInteraction = (fieldName: string, action: 'focus' | 'blur' | 'change') => {
    const interactionKey = `${fieldName}_${action}`;
    if (!fieldInteractions.current.has(interactionKey)) {
      fieldInteractions.current.add(interactionKey);
      trackEvent('form_field_interaction', {
        form_name: formName,
        field_name: fieldName,
        action,
      });
    }
  };

  const trackFieldError = (fieldName: string, error: string) => {
    trackEvent('form_field_error', {
      form_name: formName,
      field_name: fieldName,
      error,
    });
  };

  const trackSubmit = (success: boolean, errors?: string[]) => {
    trackEvent(success ? TRACKING_EVENTS.FORM_SUBMITTED : TRACKING_EVENTS.FORM_ERROR, {
      form_name: formName,
      form_type: formType,
      success,
      errors,
    });
  };

  const formTracking: FormTracking = {
    trackFieldInteraction,
    trackFieldError,
    trackSubmit,
  };

  return <div className={className}>{children(formTracking)}</div>;
}
