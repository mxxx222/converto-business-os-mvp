'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, CreditCard, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'start',
    name: 'Start',
    price: 99,
    description: 'Idealinen pienyrityksille',
    features: [
      '10 kuitin käsittely/kk',
      'Perus OCR',
      'Email-tuki',
      'Perus-raportit',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    description: 'Kasvaville yrityksille',
    features: [
      '100 kuitin käsittely/kk',
      'Edistynyt OCR',
      'Prioriteetti-tuki',
      'Edistynyt raportointi',
      'API-integraatiot',
    ],
  },
  {
    id: 'quantum',
    name: 'Quantum',
    price: 999,
    description: 'Enterprise-ratkaisu',
    features: [
      'Rajoittamaton käsittely',
      'Premium OCR + AI',
      'Dedicated support',
      'Mukautettu raportointi',
      'Kaikki integraatiot',
      'SLA-takuu',
    ],
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const registrationOpen = process.env.NEXT_PUBLIC_REGISTRATION_OPEN === 'true';

  if (!registrationOpen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Rekisteröinti ei ole vielä avoinna
          </h1>
          <p className="text-gray-600 mb-6">
            Rekisteröinti avataan pian. Palaa myöhemmin tai tilaa uutiskirje saadaksesi ilmoituksen.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Takaisin etusivulle
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !email || !name) {
      toast.error('Täytä kaikki pakolliset kentät');
      return;
    }

    setLoading(true);
    try {
      const plan = PLANS.find((p) => p.id === selectedPlan);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      const response = await fetch('/api/mockPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          amount: plan.price,
          email,
          name,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Rekisteröinti onnistui!');
        router.push(`/thank-you?paymentId=${data.paymentId}&plan=${selectedPlan}`);
      } else {
        throw new Error(data.message || 'Rekisteröinti epäonnistui');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Rekisteröinti epäonnistui. Yritä uudelleen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Rekisteröidy Converto Business OS:aan
          </h1>
          <p className="text-xl text-gray-600">
            Valitse paketti ja aloita automaation parissa
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Valitse paketti *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    'border-2 rounded-lg p-6 cursor-pointer transition-all',
                    selectedPlan === plan.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    {selectedPlan === plan.id && (
                      <Check className="w-6 h-6 text-primary-600" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}€</span>
                    <span className="text-gray-600">/kk</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* User Information */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Yhteystiedot</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nimi *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Sähköposti *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Peruuta
            </button>
            <button
              type="submit"
              disabled={loading || !selectedPlan}
              className={cn(
                'px-6 py-3 rounded-lg text-white font-semibold transition-colors flex items-center gap-2',
                loading || !selectedPlan
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              )}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Käsitellään...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Rekisteröidy
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
