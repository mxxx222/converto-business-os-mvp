'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { TrackForm } from '@/components/analytics/TrackForm';
import { TrackFormInput } from '@/components/analytics/TrackFormInput';
import { useTracking } from '@/lib/analytics/useTracking';
import { demoRequestSchema, type DemoRequestFormData } from '@/lib/validation/demoSchema';
import { TRACKING_EVENTS } from '@/lib/analytics/events';
import { z } from 'zod';

interface DemoRequestFormProps {
  variant?: 'modal' | 'inline' | 'sidebar';
  source?: string;
  className?: string;
}

export function DemoRequestForm({
  variant = 'inline',
  source = 'website',
  className = '',
}: DemoRequestFormProps) {
  const router = useRouter();
  const { trackEvent } = useTracking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState<DemoRequestFormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    website: '', // Honeypot
    gdprConsent: false,
    marketingConsent: false,
    source,
    utm_source:
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('utm_source') || undefined
        : undefined,
    utm_medium:
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('utm_medium') || undefined
        : undefined,
    utm_campaign:
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('utm_campaign') || undefined
        : undefined,
    referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
  });

  const handleInputChange = (field: keyof DemoRequestFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      demoRequestSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path && err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent, formTracking: any) => {
    e.preventDefault();

    // Honeypot check
    if (formData.website) {
      console.warn('Spam detected via honeypot');
      return;
    }

    if (!validateForm()) {
      formTracking.trackSubmit(false, Object.keys(errors));
      trackEvent(TRACKING_EVENTS.DEMO_FORM_SUBMITTED, {
        success: false,
        errors: Object.keys(errors),
        form_variant: variant,
        source: source,
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Track successful submission
        formTracking.trackSubmit(true);
        trackEvent(TRACKING_EVENTS.DEMO_FORM_SUBMITTED, {
          form_variant: variant,
          source: source,
          has_company: !!formData.company,
          has_phone: !!formData.phone,
          has_message: !!formData.message,
          marketing_consent: formData.marketingConsent,
          submission_id: result.id,
        });

        // Track conversion in GA4
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'conversion', {
            send_to: process.env.NEXT_PUBLIC_GA4_DEMO_CONVERSION || '',
            value: 1,
            currency: 'EUR',
            transaction_id: result.id,
          });
        }

        // Redirect to thank you page
        router.push(`/thank-you?id=${result.id}&source=${source}`);
      } else {
        throw new Error(result.error || 'Lomakkeen lähetys epäonnistui');
      }
    } catch (error) {
      console.error('Demo request submission error:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Lomakkeen lähetys epäonnistui. Yritä uudelleen.'
      );

      formTracking.trackSubmit(false, [error instanceof Error ? error.message : 'Unknown error']);
      trackEvent(TRACKING_EVENTS.DEMO_FORM_SUBMITTED, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        form_variant: variant,
        source: source,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TrackForm formName="demo_request" formType="demo_request" className={`space-y-6 ${className}`}>
      {(formTracking) => (
        <form ref={formRef} onSubmit={(e) => handleSubmit(e, formTracking)} className="space-y-6">
          {/* Honeypot field - hidden from users */}
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Name field */}
          <TrackFormInput fieldName="name" formTracking={formTracking} required>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nimi *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
                placeholder="Etunimi Sukunimi"
                required
                disabled={isSubmitting}
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>
          </TrackFormInput>

          {/* Email field */}
          <TrackFormInput fieldName="email" formTracking={formTracking} required>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Sähköposti *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="etunimi.sukunimi@yritys.fi"
                required
                disabled={isSubmitting}
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>
          </TrackFormInput>

          {/* Company field */}
          <TrackFormInput fieldName="company" formTracking={formTracking}>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                Yritys
              </label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className={errors.company ? 'border-red-500' : ''}
                placeholder="Yrityksen nimi"
                disabled={isSubmitting}
              />
              {errors.company && <p className="mt-1 text-sm text-red-400">{errors.company}</p>}
            </div>
          </TrackFormInput>

          {/* Phone field */}
          <TrackFormInput fieldName="phone" formTracking={formTracking}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Puhelin
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
                placeholder="+358 40 123 4567"
                disabled={isSubmitting}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
            </div>
          </TrackFormInput>

          {/* Message field */}
          <TrackFormInput fieldName="message" formTracking={formTracking}>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                Viesti (valinnainen)
              </label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className={errors.message ? 'border-red-500' : ''}
                placeholder="Kerro lyhyesti yrityksestäsi ja automaatiotarpeistasi..."
                rows={4}
                disabled={isSubmitting}
              />
              {errors.message && <p className="mt-1 text-sm text-red-400">{errors.message}</p>}
            </div>
          </TrackFormInput>

          {/* GDPR Consent */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="gdprConsent"
                checked={formData.gdprConsent}
                onCheckedChange={(checked) => handleInputChange('gdprConsent', checked as boolean)}
                className="mt-1"
                disabled={isSubmitting}
              />
              <label htmlFor="gdprConsent" className="text-sm text-gray-300 leading-relaxed">
                Hyväksyn{' '}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  className="text-[var(--neon-green)] hover:underline"
                >
                  tietosuojaselosteen
                </a>{' '}
                ja suostun henkilötietojeni käsittelyyn yhteydenoton tarkoituksessa. *
              </label>
            </div>
            {errors.gdprConsent && (
              <p className="text-sm text-red-400">{errors.gdprConsent}</p>
            )}

            {/* Marketing consent */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="marketingConsent"
                checked={formData.marketingConsent}
                onCheckedChange={(checked) => handleInputChange('marketingConsent', checked as boolean)}
                className="mt-1"
                disabled={isSubmitting}
              />
              <label htmlFor="marketingConsent" className="text-sm text-gray-300 leading-relaxed">
                Haluan vastaanottaa Converton uutiskirjeen ja markkinointiviestejä (valinnainen)
              </label>
            </div>
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{submitError}</p>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isSubmitting || !formData.gdprConsent}
            className="w-full neon-button font-bold py-3 px-6 text-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Lähetetään...</span>
              </div>
            ) : (
              'Pyydä demo'
            )}
          </Button>

          {/* Form info */}
          <p className="text-xs text-gray-400 text-center">
            Otamme yhteyttä 24 tunnin sisään. Ei roskapostia, vain hyödyllistä tietoa.
          </p>
        </form>
      )}
    </TrackForm>
  );
}
