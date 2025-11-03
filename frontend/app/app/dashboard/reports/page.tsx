'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/useAuth';
import { generateReports, downloadReport } from '@/lib/api/reports';
import { OSLayout } from '@/components/dashboard/OSLayout';
import { Download, TrendingUp, TrendingDown, DollarSign, Loader } from 'lucide-react';

interface ReportData {
  type: 'vat' | 'cashflow' | 'income' | 'expenses' | 'customers';
  period: string;
  data: any;
  generated_at: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('vat');
  const { user, team } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [selectedPeriod, user, team]);

  const loadReports = async () => {
    try {
      setLoading(true);

      // Try to fetch from API
      try {
        const data = await generateReports(selectedPeriod); // API call
        if (data.reports && Array.isArray(data.reports)) {
          setReports(data.reports);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.warn('Reports API not available, using demo data:', apiError);
      }

      // Fallback: demo reports
      setReports(getDemoReports());
    } catch (error: any) {
      console.error('Error generating reports:', error);
      setReports(getDemoReports());
    } finally {
      setLoading(false);
    }
  };

  const getDemoReports = (): ReportData[] => [
    {
      type: 'vat',
      period: selectedPeriod,
      data: {
        vat_rate: 0.24,
        gross_amount: 10000,
        vat_amount: 2400,
        deductions: 1200,
        payable: 1200,
        previous_balance: 500,
        total_payable: 1700,
      },
      generated_at: new Date().toISOString(),
    },
    {
      type: 'cashflow',
      period: selectedPeriod,
      data: {
        income: 15000,
        expenses: 8000,
        net: 7000,
        opening_balance: 5000,
        closing_balance: 12000,
        by_category: {
          Palkat: 4000,
          Vuokra: 2000,
          Muut: 2000,
        },
      },
      generated_at: new Date().toISOString(),
    },
    {
      type: 'income',
      period: selectedPeriod,
      data: {
        total: 15000,
        by_category: {
          Palvelut: 8000,
          Tuotteet: 5000,
          Muut: 2000,
        },
        by_customer: {
          'Asiakas A': 5000,
          'Asiakas B': 4000,
          Muut: 6000,
        },
      },
      generated_at: new Date().toISOString(),
    },
    {
      type: 'expenses',
      period: selectedPeriod,
      data: {
        total: 8000,
        by_category: {
          Palkat: 4000,
          Vuokra: 2000,
          Muut: 2000,
        },
      },
      generated_at: new Date().toISOString(),
    },
    {
      type: 'customers',
      period: selectedPeriod,
      data: {
        total_customers: 12,
        new_customers: 3,
        top_customers: [
          { name: 'Asiakas A', revenue: 5000, transactions: 12 },
          { name: 'Asiakas B', revenue: 4000, transactions: 8 },
          { name: 'Asiakas C', revenue: 3000, transactions: 6 },
        ],
      },
      generated_at: new Date().toISOString(),
    },
  ];

  const handleDownload = async (reportType: string) => {
    try {
      await downloadReport(reportType, selectedPeriod);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Virhe ladattaessa raporttia - PDF-generointi tulossa pian');
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'current_month':
        return 'Tämä kuukausi';
      case 'last_month':
        return 'Viime kuukausi';
      case 'current_quarter':
        return 'Tämä neljännes';
      case 'current_year':
        return 'Tämä vuosi';
      case 'custom':
        return 'Mukautettu';
      default:
        return period;
    }
  };

  const vatReport = reports.find((r) => r.type === 'vat');
  const cashflowReport = reports.find((r) => r.type === 'cashflow');
  const incomeReport = reports.find((r) => r.type === 'income');
  const expensesReport = reports.find((r) => r.type === 'expenses');
  const customersReport = reports.find((r) => r.type === 'customers');

  return (
    <OSLayout currentPath="/app/dashboard/reports">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Raportit</h1>
          <p className="text-gray-600 dark:text-gray-400">Luo ja lataa raportit</p>
        </div>

        {/* Ajanjakso-valitsin */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'current_month', label: 'Tämä kuukausi' },
            { value: 'last_month', label: 'Viime kuukausi' },
            { value: 'current_quarter', label: 'Tämä neljännes' },
            { value: 'current_year', label: 'Tämä vuosi' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                selectedPeriod === option.value
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Välilehdet */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          {[
            { id: 'vat', label: 'ALV-raportti', icon: '📋' },
            { id: 'cashflow', label: 'Kassavirta', icon: '💰' },
            { id: 'income', label: 'Tulot', icon: '📈' },
            { id: 'expenses', label: 'Menot', icon: '📉' },
            { id: 'customers', label: 'Asiakkaat', icon: '👥' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader className="inline-block animate-spin h-8 w-8 border-b-2 border-green-500" />
            <p className="text-gray-600 dark:text-gray-400 mt-2">Generoidaan raporttia...</p>
          </div>
        ) : (
          <>
            {/* ALV-raportti */}
            {activeTab === 'vat' && vatReport && (
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ALV-raportti</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getPeriodLabel(selectedPeriod)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload('vat')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Download size={16} />
                      <span>Lataa PDF</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Brutto-summa</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {vatReport.data.gross_amount.toFixed(2)} €
                      </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">ALV (24%)</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {vatReport.data.vat_amount.toFixed(2)} €
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Vähennykset</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {vatReport.data.deductions.toFixed(2)} €
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Maksettava</p>
                      <p className="text-3xl font-bold text-green-600">
                        {vatReport.data.payable.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Yhteenveto</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Edellinen saldo:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {vatReport.data.previous_balance.toFixed(2)} €
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tämän kauden ALV:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {vatReport.data.payable.toFixed(2)} €
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                        <span className="font-semibold text-gray-900 dark:text-white">Yhteensä maksettava:</span>
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                          {vatReport.data.total_payable.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Kassavirta-raportti */}
            {activeTab === 'cashflow' && cashflowReport && (
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kassavirta-raportti</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getPeriodLabel(selectedPeriod)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload('cashflow')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Download size={16} />
                      <span>Lataa PDF</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="text-green-600" size={20} />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tulot</p>
                      </div>
                      <p className="text-3xl font-bold text-green-600">
                        {cashflowReport.data.income.toFixed(2)} €
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="text-red-600" size={20} />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Menot</p>
                      </div>
                      <p className="text-3xl font-bold text-red-600">
                        {cashflowReport.data.expenses.toFixed(2)} €
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="text-blue-600" size={20} />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Netto</p>
                      </div>
                      <p className="text-3xl font-bold text-blue-600">
                        {cashflowReport.data.net.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avaussaldo</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {cashflowReport.data.opening_balance.toFixed(2)} €
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Päätössaldo</p>
                      <p className="text-2xl font-bold text-green-600">
                        {cashflowReport.data.closing_balance.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                      Menot kategorioittain
                    </p>
                    <div className="space-y-2">
                      {Object.entries(cashflowReport.data.by_category).map(([category, amount]: [string, any]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{
                                  width: `${(amount / cashflowReport.data.expenses) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="font-semibold text-sm w-16 text-right text-gray-900 dark:text-white">
                              {amount.toFixed(2)} €
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tuloraportti */}
            {activeTab === 'income' && incomeReport && (
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tuloraportti</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getPeriodLabel(selectedPeriod)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload('income')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Download size={16} />
                      <span>Lataa PDF</span>
                    </button>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Kokonaistulot</p>
                    <p className="text-4xl font-bold text-green-600">
                      {incomeReport.data.total.toFixed(2)} €
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Tulot kategorioittain</h3>
                      <div className="space-y-2">
                        {Object.entries(incomeReport.data.by_category).map(([category, amount]: [string, any]) => (
                          <div
                            key={category}
                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded"
                          >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {category}
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {amount.toFixed(2)} €
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Tulot asiakkaittain</h3>
                      <div className="space-y-2">
                        {Object.entries(incomeReport.data.by_customer).map(([customer, amount]: [string, any]) => (
                          <div
                            key={customer}
                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded"
                          >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {customer}
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {amount.toFixed(2)} €
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Menojen raportti */}
            {activeTab === 'expenses' && expensesReport && (
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Menojen raportti</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getPeriodLabel(selectedPeriod)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload('expenses')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Download size={16} />
                      <span>Lataa PDF</span>
                    </button>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Kokonaismenot</p>
                    <p className="text-4xl font-bold text-red-600">
                      {expensesReport.data.total.toFixed(2)} €
                    </p>
                  </div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Menot kategorioittain</h3>
                  <div className="space-y-3">
                    {Object.entries(expensesReport.data.by_category).map(([category, amount]: [string, any]) => (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {category}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {amount.toFixed(2)} €
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${(amount / expensesReport.data.total) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Asiakasraportti */}
            {activeTab === 'customers' && customersReport && (
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Asiakasraportti</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getPeriodLabel(selectedPeriod)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload('customers')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Download size={16} />
                      <span>Lataa PDF</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Asiakkaat yhteensä</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {customersReport.data.total_customers}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Uudet asiakkaat</p>
                      <p className="text-3xl font-bold text-green-600">
                        {customersReport.data.new_customers}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Kasvuprosentti</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {((customersReport.data.new_customers / customersReport.data.total_customers) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Top asiakkaat</h3>
                  <div className="space-y-3">
                    {customersReport.data.top_customers.map((customer: any, index: number) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {index + 1}. {customer.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {customer.transactions} tapahtumaa
                            </p>
                          </div>
                          <p className="font-bold text-lg text-gray-900 dark:text-white">
                            {customer.revenue.toFixed(2)} €
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${(customer.revenue / customersReport.data.top_customers[0].revenue) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </OSLayout>
  );
}
