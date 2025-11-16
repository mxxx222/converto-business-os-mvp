import { z } from 'zod';

export const ROIInputSchema = z.object({
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

export type ROIInput = z.infer<typeof ROIInputSchema>;

export interface ROIOutput {
  monthlyHours: string;
  monthlyCost: string;
  docflowHours: string;
  docflowCost: string;
  monthlySavings: string;
  yearlySavings: string;
  paybackDays: number;
  workDaysPerYear: number;
}

export interface Package {
  name: string;
  cost: number;
  docs: number;
  description: string;
}
