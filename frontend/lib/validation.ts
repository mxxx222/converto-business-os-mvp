import { z } from 'zod';

// Common validation schemas
export const EmailSchema = z.string()
  .email('Virheellinen sähköpostiosoite')
  .min(1, 'Sähköposti on pakollinen');

export const NameSchema = z.string()
  .min(2, 'Nimi on liian lyhyt')
  .max(100, 'Nimi on liian pitkä')
  .regex(/^[a-zA-ZäöåÄÖÅ\s-']+$/, 'Nimi sisältää virheellisiä merkkejä');

export const CompanySchema = z.string()
  .min(2, 'Yrityksen nimi on liian lyhyt')
  .max(200, 'Yrityksen nimi on liian pitkä');

export const PhoneSchema = z.string()
  .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, 'Virheellinen puhelinnumero')
  .optional()
  .or(z.literal(''));

// Form validation schemas
export const ContactFormSchema = z.object({
  email: EmailSchema,
  name: NameSchema,
  company: CompanySchema,
  phone: PhoneSchema,
  message: z.string()
    .min(10, 'Viesti on liian lyhyt')
    .max(1000, 'Viesti on liian pitkä')
});

export const BetaSignupFormSchema = z.object({
  email: EmailSchema,
  name: NameSchema,
  company: CompanySchema,
  phone: PhoneSchema,
  monthly_invoices: z.enum(['1-50', '50-200', '200-500', '500-2000', '2000+'], {
    errorMap: () => ({ message: 'Valitse laskujen määrä' })
  }),
  document_types: z.array(z.string()).min(1, 'Valitse vähintään yksi dokumenttityyppi'),
  start_timeline: z.enum(['Immediately', 'Within 1 month', 'Within 3 months', 'Just exploring'], {
    errorMap: () => ({ message: 'Valitse aikataulu' })
  }),
  weekly_feedback_ok: z.boolean()
});

export const ROICalculatorSchema = z.object({
  invoices: z.number()
    .min(1, 'Laskuja tulee olla vähintään 1')
    .max(100000, 'Epärealistinen määrä laskuja'),
  minutesPerDoc: z.number()
    .min(0.1, 'Aika tulee olla positiivinen')
    .max(1440, 'Aika ei voi olla yli 24h'),
  hourlyRate: z.number()
    .min(0, 'Tuntipalkka tulee olla positiivinen')
    .max(1000, 'Epärealistinen tuntipalkka'),
  packageCost: z.number()
    .min(0, 'Pakettihinta tulee olla positiivinen')
});

// API validation schemas
export const DocumentUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Tiedosto on liian suuri (max 10MB)')
    .refine(
      (file) => ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Tuetut tiedostotyypit: PDF, JPEG, PNG, WebP'
    ),
  type: z.enum(['purchase_invoice', 'receipt', 'freight_document', 'order_confirmation', 'contract'])
});

export const UserRegistrationSchema = z.object({
  email: EmailSchema,
  name: NameSchema,
  company: CompanySchema,
  password: z.string()
    .min(8, 'Salasana tulee olla vähintään 8 merkkiä')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Salasana tulee sisältää isoja ja pieniä kirjaimia sekä numeroita'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Salasanat eivät täsmää',
  path: ['confirmPassword']
});

// Utility functions for validation
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: { field: string; message: string }[];
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return { success: false, errors };
    }
    return { 
      success: false, 
      errors: [{ field: 'general', message: 'Validointi epäonnistui' }] 
    };
  }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
  return phoneRegex.test(phone);
}

// Finnish business ID validation
export function validateBusinessId(businessId: string): boolean {
  const cleanId = businessId.replace(/[\s\-]/g, '');
  
  if (!/^\d{7}\d$/.test(cleanId)) {
    return false;
  }
  
  const digits = cleanId.split('').map(Number);
  const checksum = digits[7];
  const weights = [7, 9, 10, 5, 8, 4, 2];
  
  const sum = digits.slice(0, 7).reduce((acc, digit, index) => {
    return acc + digit * weights[index];
  }, 0);
  
  const remainder = sum % 11;
  const expectedChecksum = remainder < 2 ? remainder : 11 - remainder;
  
  return checksum === expectedChecksum;
}
