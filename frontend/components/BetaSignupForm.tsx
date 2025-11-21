'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface BetaSignupFormData {
  email: string;
  name: string;
  company: string;
  phone?: string;
  monthly_invoices: '1-50' | '50-200' | '200-500' | '500-2000' | '2000+';
  document_types: string[];
  start_timeline: 'Immediately' | 'Within 1 month' | 'Within 3 months' | 'Just exploring';
  weekly_feedback_ok: boolean;
}

export function BetaSignupForm() {
  const [formData, setFormData] = useState<BetaSignupFormData>({
    email: '',
    name: '',
    company: '',
    phone: '',
    monthly_invoices: '1-50',
    document_types: [],
    start_timeline: 'Within 1 month',
    weekly_feedback_ok: false,
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const documentTypeOptions = [
    'Laskut (invoices)',
    'Kuitit (receipts)',
    'Sopimukset (contracts)',
    'Muut dokumentit',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Beta signup failed');
      }

      setStatus('success');
      // Reset form after success
      setTimeout(() => {
        setFormData({
          email: '',
          name: '',
          company: '',
          phone: '',
          monthly_invoices: '1-50',
          document_types: [],
          start_timeline: 'Within 1 month',
          weekly_feedback_ok: false,
        });
        setStatus('idle');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const toggleDocumentType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      document_types: prev.document_types.includes(type)
        ? prev.document_types.filter((t) => t !== type)
        : [...prev.document_types, type],
    }));
  };

  if (status === 'success') {
    return (
      <div className="bg-white rounded-xl border-2 border-green-500 p-8 shadow-lg">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Kiitos ilmoittautumisesta! 🎉
          </h3>
          <p className="text-gray-600 mb-4">
            Olemme lähettäneet sinulle sähköpostin Mari-tarinalla ja seuraavilla askeleilla.
          </p>
          <p className="text-sm text-gray-500">
            Ota yhteyttä 1-2 viikon sisällä, kun beta-ohjelma alkaa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Hae beta-ohjelmaan
        </h3>
        <p className="text-gray-600">
          Vain 8 paikkaa jäljellä. 6 kuukautta ilmaiseksi (arvo €1 794).
        </p>
      </div>

      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Virhe</p>
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nimi *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Sähköposti *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Yritys *
            </label>
            <input
              type="text"
              id="company"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Puhelin (valinnainen)
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kuinka monta laskua käsittelette kuukaudessa? *
          </label>
          <select
            value={formData.monthly_invoices}
            onChange={(e) =>
              setFormData({
                ...formData,
                monthly_invoices: e.target.value as BetaSignupFormData['monthly_invoices'],
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1-50">1-50</option>
            <option value="50-200">50-200</option>
            <option value="200-500">200-500</option>
            <option value="500-2000">500-2000</option>
            <option value="2000+">2000+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mitä dokumentteja käsittelette? * (valitse vähintään yksi)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {documentTypeOptions.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={formData.document_types.includes(type)}
                  onChange={() => toggleDocumentType(type)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
          {formData.document_types.length === 0 && (
            <p className="text-xs text-red-600 mt-1">Valitse vähintään yksi dokumenttityyppi</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Milloin haluaisitte aloittaa? *
          </label>
          <select
            value={formData.start_timeline}
            onChange={(e) =>
              setFormData({
                ...formData,
                start_timeline: e.target.value as BetaSignupFormData['start_timeline'],
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Immediately">Heti</option>
            <option value="Within 1 month">1 kuukauden sisällä</option>
            <option value="Within 3 months">3 kuukauden sisällä</option>
            <option value="Just exploring">Tutustumassa vain</option>
          </select>
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="weekly_feedback_ok"
            checked={formData.weekly_feedback_ok}
            onChange={(e) =>
              setFormData({ ...formData, weekly_feedback_ok: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-1"
          />
          <label htmlFor="weekly_feedback_ok" className="text-sm text-gray-700">
            Haluan antaa viikoittaisen palautteen beta-ohjelman aikana (auttaa tuotteen kehityksessä)
          </label>
        </div>

        <button
          type="submit"
          disabled={status === 'loading' || formData.document_types.length === 0}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Lähetetään...
            </>
          ) : (
            'Hae beta-ohjelmaan'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Rekisteröitymällä hyväksyt tietosuojakäytännön. Emme jaa tietojasi kolmansille osapuolille.
        </p>
      </div>
    </form>
  );
}
