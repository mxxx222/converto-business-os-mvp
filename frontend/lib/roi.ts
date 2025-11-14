export type RoiInput = {
  teamSize: number; // hlö
  hoursSavedPerPerson: number; // h/kk
  hourlyCost: number; // €/h
  invoicesPerMonth: number; // kpl
  avgInvoiceValue: number; // €
  dsoReductionDays: number; // päivää
  annualDiscountRate: number; // %
  softwareCost: number; // €/kk
};

export type RoiOutput = {
  timeValueMonthly: number;
  cashflowValueMonthly: number;
  benefitsMonthly: number;
  costMonthly: number;
  netMonthly: number;
  roiPct: number; // %
  paybackDays: number;
};

export function calcROI(i: RoiInput): RoiOutput {
  const timeValueMonthly = i.teamSize * i.hoursSavedPerPerson * i.hourlyCost;

  // Kassavirran aika-arvo: DSO-pudotus vapauttaa pääomaa
  const arBefore = i.invoicesPerMonth * i.avgInvoiceValue;
  const capitalFreed = (arBefore * i.dsoReductionDays) / 30; // likimääräinen
  const monthlyRate = i.annualDiscountRate / 100 / 12;
  const cashflowValueMonthly = capitalFreed * monthlyRate;

  const benefitsMonthly = timeValueMonthly + cashflowValueMonthly;
  const costMonthly = i.softwareCost;
  const netMonthly = benefitsMonthly - costMonthly;
  const roiPct = costMonthly > 0 ? (netMonthly / costMonthly) * 100 : Infinity;
  const dailyNet = netMonthly / 30;
  const paybackDays =
    dailyNet > 0 ? Math.ceil(costMonthly / dailyNet) : Infinity;

  return {
    timeValueMonthly,
    cashflowValueMonthly,
    benefitsMonthly,
    costMonthly,
    netMonthly,
    roiPct,
    paybackDays,
  };
}

