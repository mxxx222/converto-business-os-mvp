'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { OSLayout } from '@/components/dashboard/OSLayout';
import { showToast } from '@/components/dashboard/Toast';
import { Euro, CreditCard, Calendar, Download, ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface BillingInfo {
  plan: string;
  status: 'active' | 'trial' | 'cancelled' | 'past_due';
  trial_ends_at: string | null;
  current_period_start: string;
  current_period_end: string;
  monthly_price: number;
  yearly_discount: number;
}

interface PaymentMethod {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  download_url?: string;
}

const SUPABASE_CONFIGURED = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      setLoading(false);
      return;
    }

    initializeBilling();
  }, []);

  const initializeBilling = async () => {
    try {
      // Get current user
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      // Load billing information (mock data for now)
      loadBillingInfo();
      loadPaymentMethods();
      loadInvoices();

    } catch (error) {
      console.error('Error initializing billing:', error);
      showToast('Virhe laskutustietojen lataamisessa', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadBillingInfo = async () => {
    // Mock billing info - in production this would come from Stripe
    setBillingInfo({
      plan: 'Professional',
      status: 'trial',
      trial_ends_at: '2025-12-24T23:59:59Z',
      current_period_start: '2024-11-24T00:00:00Z',
      current_period_end: '2024-12-24T23:59:59Z',
      monthly_price: 299,
      yearly_discount: 20
    });
  };

  const loadPaymentMethods = async () => {
    // Mock payment methods - in production from Stripe
    setPaymentMethods([
      {
        id: 'pm_1',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2026,
        is_default: true
      }
    ]);
  };

  const loadInvoices = async () => {
    // Mock invoices - in production from Stripe
    setInvoices([
      {
        id: 'inv_1',
        date: '2024-11-01',
        amount: 299,
        status: 'paid',
        description: 'DocFlow Professional - November 2024'
      },
      {
        id: 'inv_2',
        date: '2024-10-01',
        amount: 299,
        status: 'paid',
        description: 'DocFlow Professional - October 2024'
      },
      {
        id: 'inv_3',
        date: '2024-09-01',
        amount: 299,
        status: 'paid',
        description: 'DocFlow Professional - September 2024'
      }
    ]);
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      // In production: call Stripe API to cancel subscription
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      setBillingInfo(prev => prev ? { ...prev, status: 'cancelled' } : null);
      setShowCancelModal(false);
      showToast('Tilaus peruutettu onnistuneesti', 'success');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      showToast('Virhe tilauksen peruuttamisessa', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fi-FI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fi-FI', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'trial':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'past_due':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiivinen';
      case 'trial':
        return 'Kokeilujakso';
      case 'cancelled':
        return 'Peruutettu';
      case 'past_due':
        return 'Maksu myöhässä';
      default:
        return 'Tuntematon';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <OSLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-600 dark:text-gray-400">Ladataan laskutustietoja...</div>
        </div>
      </OSLayout>
    );
  }

  if (!SUPABASE_CONFIGURED || !user) {
    return (
      <OSLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">💳</div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Kirjautuminen vaaditaan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Kirjaudu sisään nähdäksesi laskutustiedot.
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Takaisin etusivulle
            </Link>
          </div>
        </div>
      </OSLayout>
    );
  }

  return (
    <OSLayout currentPath="/billing">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Laskutus & Tilaus
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Hallitse tilaustasi, maksutapoja ja laskuja
          </p>
        </div>

        {/* Current Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Euro className="w-6 h-6" />
              Nykyinen tilaus
            </h2>
            {billingInfo && (
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(billingInfo.status)}`}>
                {getStatusIcon(billingInfo.status)}
                {getStatusText(billingInfo.status)}
              </span>
            )}
          </div>

          {billingInfo && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {billingInfo.plan}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Kuukausihinta:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(billingInfo.monthly_price)}/kk
                    </span>
                  </div>

                  {billingInfo.status === 'trial' && billingInfo.trial_ends_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Kokeilu päättyy:</span>
                      <span className="font-medium text-blue-600">
                        {formatDate(billingInfo.trial_ends_at)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Seuraava lasku:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(billingInfo.current_period_end)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Vuosialennus saatavilla:</span>
                    <span className="font-medium text-green-600">
                      -{billingInfo.yearly_discount}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {billingInfo.status === 'trial' && (
                  <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Aktivoi maksullinen tilaus
                  </button>
                )}

                {billingInfo.status === 'active' && (
                  <>
                    <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Päivitä vuositilaukseen (-20%)
                    </button>
                    <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium">
                      Muuta paketti
                    </button>
                  </>
                )}

                {(billingInfo.status === 'active' || billingInfo.status === 'trial') && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                  >
                    Peruuta tilaus
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Maksutavat
            </h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              + Lisää maksutapa
            </button>
          </div>

          <div className="space-y-4">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Ei maksutapoja lisätty
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Lisää ensimmäinen maksutapa
                </button>
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                        {method.brand}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        •••• •••• •••• {method.last4}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Voimassa {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
                      </p>
                    </div>
                    {method.is_default && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Oletus
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Muokkaa
                    </button>
                    <button className="px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors">
                      Poista
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invoice History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Laskuhistoria
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Päivämäärä</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Kuvaus</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Summa</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Toiminnot</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {invoice.description}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status === 'paid' ? <CheckCircle className="w-3 h-3" /> :
                         invoice.status === 'pending' ? <Clock className="w-3 h-3" /> :
                         <AlertCircle className="w-3 h-3" />}
                        {invoice.status === 'paid' ? 'Maksettu' :
                         invoice.status === 'pending' ? 'Odottaa' : 'Epäonnistui'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors">
                        <Download className="w-4 h-4" />
                        Lataa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {invoices.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Ei laskuhistoriaa saatavilla
              </p>
            </div>
          )}
        </div>

        {/* Billing Info & Support */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
            Tarvitsetko apua laskutuksessa?
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-800 dark:text-blue-300 mb-2">
                <strong>Laskutusosoite:</strong>
              </p>
              <p className="text-blue-700 dark:text-blue-400">
                DocFlow Oy<br />
                Turku Science Park<br />
                20520 Turku, Finland<br />
                Y-tunnus: 1234567-8
              </p>
            </div>
            <div>
              <p className="text-blue-800 dark:text-blue-300 mb-2">
                <strong>Ota yhteyttä:</strong>
              </p>
              <div className="space-y-2">
                <a href="mailto:billing@docflow.fi" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  billing@docflow.fi
                </a>
                <a href="tel:+358401234567" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  +358 40 123 4567
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Peruuta tilaus
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Haluatko varmasti peruuttaa tilauksesi? Pääsysi DocFlow-palveluun päättyy
              {billingInfo?.current_period_end && ` ${formatDate(billingInfo.current_period_end)}`}.
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                Mitä tapahtuu peruuttaessasi:
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                <li>• Et menetä pääsyä heti - palvelu toimii nykyisen jakson loppuun</li>
                <li>• Kaikki datasi säilyy 30 päivää varmuuden vuoksi</li>
                <li>• Voit aktivoida tilauksen uudelleen milloin tahansa</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={cancelling}
              >
                Peruuta
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Peruutetaan...
                  </>
                ) : (
                  'Kyllä, peruuta tilaus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </OSLayout>
  );
}
