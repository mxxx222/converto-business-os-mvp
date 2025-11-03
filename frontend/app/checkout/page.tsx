'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics/posthog';
import { ChevronRight, Lock, Check } from 'lucide-react';

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company: '',
    plan: 'business_os',
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    { number: 1, title: 'Sähköposti', icon: '📧' },
    { number: 2, title: 'Yritys', icon: '🏢' },
    { number: 3, title: 'Paketti', icon: '📦' },
    { number: 4, title: 'Valmis', icon: '✓' },
  ];

  const handleNext = async () => {
    trackEvent('checkout_step_complete', {
      step: step,
      plan: formData.plan,
    });

    if (step === 3) {
      // Submit
      setLoading(true);
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          trackEvent('checkout_completed', {
            plan: formData.plan,
            email: formData.email,
          });
          setStep(4);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {steps.map((s) => (
              <div
                key={s.number}
                className={`flex flex-col items-center ${s.number <= step ? 'opacity-100' : 'opacity-50'}`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 ${
                    s.number < step
                      ? 'bg-green-500 text-white'
                      : s.number === step
                      ? 'bg-green-500 text-white ring-4 ring-green-200'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {s.number < step ? <Check size={20} /> : s.number}
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.title}</p>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${(step / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">Sähköposti</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sinä@example.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">Salasana</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Vähintään 8 merkkiä"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">Yrityksen nimi</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Esim. Ravintola Kala & Kivi"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Valitse paketti</p>
              {[
                { id: 'business_os', name: 'Business OS', price: '99€/kk' },
                { id: 'services', name: 'Services', price: 'Räätälöity' },
              ].map((plan) => (
                <label
                  key={plan.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                    formData.plan === plan.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-green-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={formData.plan === plan.id}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-4 h-4"
                  />
                  <div className="ml-4 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{plan.price}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Tervetuloa Convertoon!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Sähköposti on lähetetty. Klikkaa linkkiä vahvistaaksesi tilisi.</p>
              <a
                href="/app/dashboard"
                className="inline-block px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
              >
                Siirry dashboardiin
              </a>
            </div>
          )}

          {/* Buttons */}
          {step < 4 && (
            <div className="flex gap-4 mt-8">
              <button
                onClick={handlePrevious}
                disabled={step === 1}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold disabled:opacity-50 text-gray-900 dark:text-white"
              >
                Takaisin
              </button>
              <button
                onClick={handleNext}
                disabled={
                  loading ||
                  (step === 1 && (!formData.email || !formData.password)) ||
                  (step === 2 && !formData.company)
                }
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Ladataan...' : step === 3 ? 'Luo tili' : 'Seuraava'}
                {!loading && <ChevronRight size={20} />}
              </button>
            </div>
          )}

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-600 dark:text-gray-400">
            <Lock size={16} />
            <span>Turvallinen & salattu</span>
          </div>
        </div>
      </div>
    </div>
  );
}

