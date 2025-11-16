'use client';

import { useState } from 'react';
import { z } from 'zod';

const BetaSignupSchema = z.object({
  email: z.string().email('Virheellinen sähköpostiosoite'),
  name: z.string().min(2, 'Nimi on pakollinen'),
  company: z.string().min(2, 'Yrityksen nimi on pakollinen'),
  phone: z.string().optional(),
  monthly_invoices: z.enum(['1-50', '50-200', '200-500', '500-2000', '2000+']),
  document_types: z.array(z.string()).min(1, 'Valitse vähintään yksi dokumenttityyppi'),
  start_timeline: z.enum(['Immediately', 'Within 1 month', 'Within 3 months', 'Just exploring']),
  weekly_feedback_ok: z.boolean()
});

type BetaSignupData = z.infer<typeof BetaSignupSchema>;

const documentTypes = [
  { id: 'purchase_invoices', label: 'Ostolaskut' },
  { id: 'receipts', label: 'Kuitit' },
  { id: 'freight_documents', label: 'Rahtikirjat' },
  { id: 'order_confirmations', label: 'Tilausvahvistukset' },
  { id: 'contracts', label: 'Sopimukset' }
];

const invoiceVolumes = [
  { value: '1-50', label: '1-50 laskua/kk' },
  { value: '50-200', label: '50-200 laskua/kk' },
  { value: '200-500', label: '200-500 laskua/kk' },
  { value: '500-2000', label: '500-2000 laskua/kk' },
  { value: '2000+', label: '2000+ laskua/kk' }
];

const timelines = [
  { value: 'Immediately', label: 'Heti' },
  { value: 'Within 1 month', label: '1 kuukauden sisällä' },
  { value: 'Within 3 months', label: '3 kuukauden sisällä' },
  { value: 'Just exploring', label: 'Vain tutustun' }
];

export function BetaSignupForm() {
  const [formData, setFormData] = useState<Partial<BetaSignupData>>({
    document_types: [],
    weekly_feedback_ok: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      const validatedData = BetaSignupSchema.parse(formData);

      // Submit to API
      const response = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        throw new Error('Lähetys epäonnistui. Yritä uudelleen.');
      }

      setSuccess(true);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err instanceof Error ? err.message : 'Odottamaton virhe');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentTypeChange = (typeId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      document_types: checked 
        ? [...(prev.document_types || []), typeId]
        : (prev.document_types || []).filter(id => id !== typeId)
    }));
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-green-50 border border-green-200 rounded-xl text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-green-900 mb-4">
          Kiitos hakemuksestasi!
        </h3>
        <p className="text-green-700 mb-6">
          Lähetimme vahvistuksen sähköpostiisi. Otamme yhteyttä 1-2 arkipäivässä 
          beta-ohjelman yksityiskohdista.
        </p>
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">
            <strong>Seuraavat vaiheet:</strong><br/>
            1. Tarkista sähköpostisi (myös roskaposti)<br/>
            2. Varaa 15 min kickoff-puhelu<br/>
            3. Saat käyttöoikeuden 24h sisällä
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      
      {/* Basic Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold mb-4">Yhteystiedot</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sähköposti *
            </label>
            <input
              type="email"
              required
              value={formData.email || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="matti@yritys.fi"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nimi *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Matti Meikäläinen"
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yritys *
            </label>
            <input
              type="text"
              required
              value={formData.company || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Yritys Oy"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puhelin
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+358 40 123 4567"
            />
          </div>
        </div>
      </div>

      {/* Usage Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold mb-4">Käyttötarpeet</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Kuinka monta laskua käsittelette kuukaudessa? *
          </label>
          <div className="space-y-2">
            {invoiceVolumes.map((volume) => (
              <label key={volume.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="monthly_invoices"
                  value={volume.value}
                  checked={formData.monthly_invoices === volume.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_invoices: e.target.value as any }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">{volume.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Mitä dokumentteja haluatte automatisoida? *
          </label>
          <div className="space-y-2">
            {documentTypes.map((type) => (
              <label key={type.id} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.document_types || []).includes(type.id)}
                  onChange={(e) => handleDocumentTypeChange(type.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Milloin haluaisitte aloittaa? *
          </label>
          <div className="space-y-2">
            {timelines.map((timeline) => (
              <label key={timeline.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="start_timeline"
                  value={timeline.value}
                  checked={formData.start_timeline === timeline.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_timeline: e.target.value as any }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">{timeline.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Agreement */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={formData.weekly_feedback_ok || false}
            onChange={(e) => setFormData(prev => ({ ...prev, weekly_feedback_ok: e.target.checked }))}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
          />
          <div className="ml-3">
            <span className="text-gray-900 font-medium">
              Haluan osallistua viikoittaisiin feedback-keskusteluihin
            </span>
            <p className="text-sm text-gray-600 mt-1">
              15-30 min viikossa, vaikutat suoraan tuotteen kehitykseen. 
              Saat myös ensimmäisenä uudet ominaisuudet testattavaksi.
            </p>
          </div>
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Lähetetään...
          </span>
        ) : (
          '🚀 Lähetä beta-hakemus'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Käsittelemme tietojasi GDPR:n mukaisesti. Voit perua osallistumisen milloin tahansa.
      </p>
    </form>
  );
}
