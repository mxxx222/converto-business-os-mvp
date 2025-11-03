import { z } from 'zod';

export const demoRequestSchema = z.object({
  name: z
    .string()
    .min(2, 'Nimi on liian lyhyt (vähintään 2 merkkiä)')
    .max(50, 'Nimi on liian pitkä (enintään 50 merkkiä)')
    .regex(/^[a-zA-ZäöåÄÖÅ\s-']+$/, 'Nimi sisältää virheellisiä merkkejä'),

  email: z
    .string()
    .email('Virheellinen sähköpostiosoite')
    .min(5, 'Sähköpostiosoite on liian lyhyt')
    .max(100, 'Sähköpostiosoite on liian pitkä')
    .toLowerCase(),

  company: z
    .string()
    .min(2, 'Yrityksen nimi on liian lyhyt (vähintään 2 merkkiä)')
    .max(100, 'Yrityksen nimi on liian pitkä (enintään 100 merkkiä)')
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .regex(/^(\+358|0)[0-9\s-]{8,15}$/, 'Virheellinen puhelinnumero (suomalainen muoto)')
    .optional()
    .or(z.literal('')),

  message: z
    .string()
    .min(10, 'Viesti on liian lyhyt (vähintään 10 merkkiä)')
    .max(1000, 'Viesti on liian pitkä (enintään 1000 merkkiä)')
    .optional()
    .or(z.literal('')),

  // Honeypot field for spam protection
  website: z.string().max(0, 'Spam detected').optional(),

  // GDPR consent
  gdprConsent: z
    .boolean()
    .refine((val) => val === true, 'Tietosuojaseloste on hyväksyttävä'),

  // Marketing consent (optional)
  marketingConsent: z.boolean().optional(),

  // Source tracking
  source: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  referrer: z.string().optional(),
});

export type DemoRequestFormData = z.infer<typeof demoRequestSchema>;

// Server-side schema with additional metadata
export const demoRequestServerSchema = demoRequestSchema.extend({
  // Server-added fields
  timestamp: z.string(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  session_id: z.string().optional(),
  page_variant: z.enum(['original', 'storybrand']).optional(),
  device_type: z.enum(['mobile', 'tablet', 'desktop']).optional(),
});

export type DemoRequestServerData = z.infer<typeof demoRequestServerSchema>;
