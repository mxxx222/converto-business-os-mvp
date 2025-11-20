import { z } from 'zod'

// Customer form validation schema
export const customerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(100, 'Company name too long'),
  email: z.string().email('Invalid email address'),
  plan: z.enum(['starter', 'professional', 'enterprise'], {
    errorMap: () => ({ message: 'Please select a plan' })
  }),
  status: z.enum(['active', 'trial', 'suspended', 'churned'], {
    errorMap: () => ({ message: 'Please select a status' })
  }),
  billingCycle: z.enum(['monthly', 'annual']).optional(),
  stripeCustomerId: z.string().optional()
})

export type CustomerFormData = z.infer<typeof customerSchema>

// Optional: Add more validation schemas as needed
export const documentFiltersSchema = z.object({
  status: z.string().optional(),
  customerId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
})

export type DocumentFiltersFormData = z.infer<typeof documentFiltersSchema>

