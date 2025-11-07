'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

export default function ROICalculator() {
  const [invoices, setInvoices] = useState(200)
  const [receipts, setReceipts] = useState(100)
  const [hourlyRate, setHourlyRate] = useState(40)

  const calculations = useMemo(() => {
    // Time estimates (hours per document)
    const invoiceTimeHours = invoices * 0.25 // 15 minutes per invoice
    const receiptTimeHours = receipts * 0.1  // 6 minutes per receipt
    const totalHours = invoiceTimeHours + receiptTimeHours
    
    // Current monthly cost
    const currentCost = totalHours * hourlyRate
    
    // DocFlow cost (Business plan as default)
    const docflowCost = 299
    
    // Monthly and annual savings
    const monthlySavings = Math.max(0, currentCost - docflowCost)
    const annualSavings = monthlySavings * 12
    
    // Payback period in months
    const paybackMonths = monthlySavings > 0 ? docflowCost / monthlySavings : Infinity
    
    return {
      currentCost,
      docflowCost,
      monthlySavings,
      annualSavings,
      paybackMonths,
      totalHours
    }
  }, [invoices, receipts, hourlyRate])

  return (
    <section className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Laske, paljonko säästät</h2>
          <p className="mt-3 text-slate-600">
            Syötä yrityksesi tiedot ja näe arvioitu säästö DocFlow'n käytöstä
          </p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Syötä tiedot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ostolaskut kuukaudessa
                </label>
                <input
                  type="number"
                  value={invoices}
                  onChange={(e) => setInvoices(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Keskimäärin 15 min käsittelyaikaa per lasku
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kuitit kuukaudessa
                </label>
                <input
                  type="number"
                  value={receipts}
                  onChange={(e) => setReceipts(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Keskimäärin 6 min käsittelyaikaa per kuitti
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tuntihinta (€/h)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Taloushallinnon henkilöstön keskimääräinen tuntihinta
                </p>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Käsittelyaika kuukaudessa:</span>
                  <span className="font-medium">{calculations.totalHours.toFixed(1)} tuntia</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-emerald-700">Arvioitu säästö</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <ResultRow 
                  label="Nykyiset kuukausikustannukset" 
                  value={`€${calculations.currentCost.toFixed(0)}`}
                  description="Manuaalinen käsittely"
                />
                <ResultRow 
                  label="DocFlow Business -paketti" 
                  value={`€${calculations.docflowCost}`}
                  description="2,000 dokumenttia/kk"
                />
                <div className="border-t border-slate-200 pt-3">
                  <ResultRow 
                    label="Kuukausisäästö" 
                    value={`€${calculations.monthlySavings.toFixed(0)}`}
                    highlight
                    description={calculations.monthlySavings > 0 ? 'Positiivinen ROI' : 'Harkitse suurempaa dokumenttimäärää'}
                  />
                </div>
                <ResultRow 
                  label="Vuosisäästö" 
                  value={`€${calculations.annualSavings.toLocaleString('fi-FI')}`}
                  description="12 kuukauden säästö"
                />
                <ResultRow 
                  label="Takaisinmaksuaika" 
                  value={calculations.paybackMonths === Infinity ? '—' : `${calculations.paybackMonths.toFixed(1)} kk`}
                  description="Kuinka nopeasti investointi maksaa itsensä takaisin"
                />
              </div>
              
              {calculations.monthlySavings > 0 && (
                <div className="pt-6 border-t border-slate-200">
                  <Link 
                    href="/signup?plan=business" 
                    className="w-full block rounded-md bg-emerald-600 px-5 py-3 text-center text-white hover:bg-emerald-700 transition-colors"
                  >
                    Aloita ilmainen kokeilu
                  </Link>
                  <p className="mt-2 text-center text-xs text-slate-500">
                    30 päivää ilmaiseksi, ei luottokorttia
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-600 mb-4">
            Laskelma on arvio perustuen tyypillisiin käsittelyaikoihin. Todelliset säästöt voivat vaihdella.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/demo" 
              className="rounded-md border border-slate-300 px-5 py-3 hover:bg-slate-50 transition-colors"
            >
              Varaa henkilökohtainen demo
            </Link>
            <Link 
              href="/contact?topic=roi" 
              className="rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 transition-colors"
            >
              Keskustele asiantuntijan kanssa
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function ResultRow({ 
  label, 
  value, 
  description, 
  highlight = false 
}: { 
  label: string
  value: string
  description?: string
  highlight?: boolean 
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-md ${
      highlight ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50'
    }`}>
      <div className="flex-1">
        <span className={`text-sm ${highlight ? 'font-medium' : ''}`}>{label}</span>
        {description && (
          <p className={`text-xs mt-1 ${highlight ? 'text-emerald-600' : 'text-slate-500'}`}>
            {description}
          </p>
        )}
      </div>
      <span className={`text-lg font-semibold ${highlight ? 'text-emerald-700' : ''}`}>
        {value}
      </span>
    </div>
  )
}
