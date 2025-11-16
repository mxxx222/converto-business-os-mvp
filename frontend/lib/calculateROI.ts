import { ROIInput, ROIOutput, ROIInputSchema } from '@/types/roi';

export function calculateROI(input: ROIInput): ROIOutput {
  // Validate input
  const validated = ROIInputSchema.parse(input);
  const { invoices, minutesPerDoc, hourlyRate, packageCost } = validated;
  
  // Current state
  const monthlyHours = (invoices * minutesPerDoc) / 60;
  const monthlyCost = monthlyHours * hourlyRate;
  
  // With DocFlow (15s = 0.25 min per doc)
  const DOCFLOW_SECONDS_PER_DOC = 15;
  const docflowMinutes = invoices * (DOCFLOW_SECONDS_PER_DOC / 60);
  const docflowHours = docflowMinutes / 60;
  const docflowCost = docflowHours * hourlyRate;
  
  // Savings
  const monthlySavings = monthlyCost - docflowCost - packageCost;
  const yearlySavings = monthlySavings * 12;
  const paybackDays = monthlySavings > 0 
    ? Math.ceil((packageCost / monthlySavings) * 30)
    : Infinity;
  
  // Work days saved per year (8h workday)
  const hoursSavedPerYear = (monthlyHours - docflowHours) * 12;
  const workDaysPerYear = Math.floor(hoursSavedPerYear / 8);
  
  return {
    monthlyHours: monthlyHours.toFixed(1),
    monthlyCost: monthlyCost.toFixed(0),
    docflowHours: docflowHours.toFixed(1),
    docflowCost: docflowCost.toFixed(0),
    monthlySavings: monthlySavings.toFixed(0),
    yearlySavings: yearlySavings.toFixed(0),
    paybackDays,
    workDaysPerYear
  };
}
