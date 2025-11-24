'use client';

import { useState } from 'react';

interface FormData {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  monthly_invoices: string;
  document_types: string[];
  current_system: string;
  biggest_challenge: string;
  start_timeline: string;
  weekly_feedback_ok: boolean;
}

export default function BetaSignupEnhanced() {
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    monthly_invoices: '',
    document_types: [],
    current_system: '',
    biggest_challenge: '',
    start_timeline: '',
    weekly_feedback_ok: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate document types
    if (formData.document_types.length === 0) {
      setError('Valitse vähintään yksi dokumenttityyppi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Submit to DocFlow backend API
      const response = await fetch('https://docflow-admin-api.fly.dev/api/beta-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          email: formData.email,
          phone: formData.phone,
          document_types: formData.document_types,
          monthly_invoices: formData.monthly_invoices,
          current_system: formData.current_system,
          biggest_challenge: formData.biggest_challenge,
          start_timeline: formData.start_timeline,
          weekly_feedback_ok: formData.weekly_feedback_ok,
          source: 'website'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Beta signup failed');
      }

      const data = await response.json();

      // Analytics tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'beta_signup', {
          event_category: 'conversion',
          event_label: formData.company_name,
          value: 2990,
          document_types: formData.document_types.join(',')
        });
      }
      if (typeof window !== 'undefined' && (window as any).trackBetaSignup) {
        (window as any).trackBetaSignup();
      }

      setSubmitted(true);

    } catch (err: any) {
      console.error('Beta signup error:', err);
      if (err.message?.includes('already registered') || err.message?.includes('duplicate')) {
        setError('Tämä sähköposti on jo rekisteröity beta-ohjelmaan.');
      } else {
        setError('Jotain meni pieleen. Yritä uudelleen tai ota yhteyttä: hello@docflow.fi');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div id="success-message" className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl p-12 text-center shadow-2xl">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Kiitos Ilmoittautumisesta! 🎉
          </h3>

          <p className="text-xl text-gray-700 mb-6">
            Olet nyt beta-ohjelman jonossa. Saat vahvistuksen <strong>tunnin sisällä</strong>.
          </p>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 text-left">
            <h4 className="font-bold text-lg mb-3 text-blue-900 flex items-center gap-2">
              <span className="text-2xl">📧</span>
              Tarkista sähköpostisi:
            </h4>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span><strong>Heti:</strong> Vahvistusviesti + seuraavat askeleet</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span><strong>1h kuluttua:</strong> Demo-ajan varauslinkki (Calendly)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span><strong>24h sisällä:</strong> Henkilökohtainen yhteydenotto</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-lg font-bold text-gray-900">
              Haluatko aloittaa vielä nopeammin?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://calendly.com/YOUR_LINK"
                target="_blank"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg"
              >
                📅 Varaa Demo Heti
              </a>
              <a
                href="tel:+358401234567"
                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg"
              >
                📞 Soita +358 40 123 4567
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Saat myös <strong>viikottaiset päivitykset</strong> tuotteen kehityksestä ja
              <strong> exclusive tips</strong> dokumenttien automaatiosta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Form header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-8 md:p-12 text-center">
          <span className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-bold mb-4">
            🚀 Rajoitettu Beta-ohjelma - 10 paikkaa yhteensä
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Hae 3kk Ilmaiseen Pilottiin
          </h2>
          <p className="text-xl md:text-2xl opacity-90 mb-4">
            Testaa <strong>kaikkia dokumenttityyppejä</strong> ilman riskiä
          </p>
          <div className="text-2xl md:text-3xl font-bold">
            Arvo: <span className="text-yellow-300">€897</span> + 50% alennus vuosi = <span className="text-yellow-300">€1,791 säästö</span>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="px-8 pt-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">

          {/* Company Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Yrityksen nimi *
            </label>
            <input
              type="text"
              required
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-lg"
              placeholder="Esim. Turun Rakennusyritys Oy"
            />
          </div>

          {/* Contact Info Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Yhteyshenkilö *
              </label>
              <input
                type="text"
                required
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-lg"
                placeholder="Etunimi Sukunimi"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Sähköposti *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-lg"
                placeholder="email@yritys.fi"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Puhelinnumero (suositeltu - nopeampi yhteydenotto)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-lg"
              placeholder="+358 40 123 4567"
            />
          </div>

          {/* Document Types - CRITICAL NEW FIELD */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Mitä dokumentteja käsittelette? (valitse kaikki sopivat) *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { value: 'purchase_invoices', label: 'Ostolaskut', icon: '📄', desc: '→ Netvisor' },
                { value: 'receipts', label: 'ALV-kuitit', icon: '🧾', desc: 'Mobile app' },
                { value: 'delivery_notes', label: 'Rahtikirjat', icon: '📦', desc: 'Laskutus' },
                { value: 'order_confirmations', label: 'Tilausvahvistukset', icon: '✅', desc: 'Tracking' },
                { value: 'contracts', label: 'Sopimukset', icon: '💼', desc: 'Storage' },
                { value: 'other', label: 'Muut', icon: '📋', desc: 'Custom' }
              ].map((docType) => {
                const isSelected = formData.document_types.includes(docType.value);
                return (
                  <label
                    key={docType.value}
                    className={`cursor-pointer border-2 rounded-xl p-4 sm:p-5 text-center transition-all min-h-[120px] flex flex-col justify-center ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-200'
                        : 'border-gray-300 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={docType.value}
                      checked={isSelected}
                      onChange={(e) => {
                        const current = formData.document_types;
                        const updated = e.target.checked
                          ? [...current, docType.value]
                          : current.filter(t => t !== docType.value);
                        setFormData({ ...formData, document_types: updated });
                      }}
                      className="sr-only"
                    />
                    <div className="text-4xl mb-2">{docType.icon}</div>
                    <div className="font-bold text-sm mb-1">{docType.label}</div>
                    <div className="text-xs text-gray-500">{docType.desc}</div>
                    {isSelected && (
                      <div className="mt-2">
                        <div className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                          ✓ Valittu
                        </div>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              💡 Valitse kaikki jotka käsittelette - näytämme ne demo:ssa!
            </p>
          </div>

          {/* Monthly Volume - Visual cards */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Kuinka monta dokumenttia käsittelette kuukaudessa yhteensä? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { value: '<50', label: 'Alle 50', tier: 'Starter', price: '€149', color: 'gray' },
                { value: '50-200', label: '50-200', tier: 'Starter', price: '€149', color: 'blue' },
                { value: '200-500', label: '200-500', tier: 'Pro', price: '€299', color: 'purple' },
                { value: '500+', label: 'Yli 500', tier: 'Enterprise', price: '€999', color: 'orange' }
              ].map((option) => {
                const isSelected = formData.monthly_invoices === option.value;
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer border-2 rounded-xl p-4 sm:p-5 text-center transition-all min-h-[100px] flex flex-col justify-center touch-manipulation ${
                      isSelected
                        ? `border-${option.color}-500 bg-${option.color}-50 shadow-lg scale-105`
                        : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                    }`}
                  >
                    <input
                      type="radio"
                      name="monthly_invoices"
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => setFormData({ ...formData, monthly_invoices: e.target.value })}
                      className="sr-only"
                      required
                    />
                    <div className="font-bold text-lg mb-1">{option.label}</div>
                    <div className="text-xs text-gray-500 mb-2">{option.tier}</div>
                    <div className="text-sm font-bold text-blue-600">{option.price}/kk</div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Current System */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mitä järjestelmää käytätte nyt kirjanpitoon?
            </label>
            <select
              value={formData.current_system}
              onChange={(e) => setFormData({ ...formData, current_system: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-lg"
            >
              <option value="">Valitse järjestelmä</option>
              <option value="Netvisor">Netvisor</option>
              <option value="Procountor">Procountor</option>
              <option value="Holvi">Holvi</option>
              <option value="Zervant">Zervant</option>
              <option value="Fenno">Fenno</option>
              <option value="SAP">SAP</option>
              <option value="Dynamics">Microsoft Dynamics</option>
              <option value="Manuaalinen">Manuaalinen käsittely</option>
              <option value="Muu">Muu järjestelmä</option>
            </select>
          </div>

          {/* Biggest Challenge */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mikä on suurin haasteenne dokumenttien käsittelyssä?
            </label>
            <textarea
              value={formData.biggest_challenge}
              onChange={(e) => setFormData({ ...formData, biggest_challenge: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-lg"
              placeholder="Esim. Ostolaskut tulevat 10 eri kanavaa, kuitit katoavat, kirjanpitäjä käyttää 30h/viikko dokumentteihin, integraatio-ongelmat..."
            />
            <p className="text-sm text-gray-500 mt-2 flex items-start gap-2">
              <span>💡</span>
              <span>
                Mitä tarkemmin kerrot, sitä paremmin voimme auttaa! Mainitse esim:
                montako tuntia menee viikossa, mitkä dokumentit hankalimpia, mitä ongelmia integraatioissa.
              </span>
            </p>
          </div>

          {/* Start Timeline - Visual */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Milloin haluaisitte aloittaa? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'Immediately', label: 'Heti', sublabel: 'Aloitus tällä viikolla', icon: '⚡', color: 'red' },
                { value: '1-2 weeks', label: '1-2 viikkoa', sublabel: 'Sopiva valmistautumisaika', icon: '📅', color: 'orange' },
                { value: 'Within month', label: 'Kuukaudessa', sublabel: 'Ei kiirettä', icon: '🗓️', color: 'blue' }
              ].map((option) => {
                const isSelected = formData.start_timeline === option.value;
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer border-2 rounded-xl p-4 sm:p-5 text-center transition-all min-h-[120px] flex flex-col justify-center touch-manipulation ${
                      isSelected
                        ? `border-${option.color}-500 bg-${option.color}-50 shadow-xl scale-105`
                        : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                    }`}
                  >
                    <input
                      type="radio"
                      name="start_timeline"
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => setFormData({ ...formData, start_timeline: e.target.value })}
                      className="sr-only"
                      required
                    />
                    <div className="text-4xl mb-2">{option.icon}</div>
                    <div className="font-bold text-base mb-1">{option.label}</div>
                    <div className="text-xs text-gray-600">{option.sublabel}</div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Weekly Feedback - Enhanced */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6">
            <label className="flex items-start gap-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.weekly_feedback_ok}
                onChange={(e) => setFormData({ ...formData, weekly_feedback_ok: e.target.checked })}
                className="mt-1 w-6 h-6 text-blue-600 border-2 border-gray-300 rounded focus:ring-4 focus:ring-blue-200 cursor-pointer"
                required
              />
              <div className="flex-1">
                <div className="font-bold text-gray-900 mb-2 text-lg group-hover:text-blue-600 transition-colors">
                  ✅ Kyllä, voin osallistua viikoittaisiin feedback-keskusteluihin
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>15 minuuttia viikossa</strong> - tämä on edellytys beta-ohjelmaan pääsylle.
                  Aikasi on meille <strong>arvokasta</strong> tuotteen kehityksessä ja varmistamme
                  että Converto palvelee juuri teidän tarpeitanne!
                </p>
                <div className="mt-3 bg-white rounded-lg p-3 border border-blue-200">
                  <div className="text-xs font-bold text-blue-900 mb-1">💎 Vastineeksi saat:</div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div>• Priority feature requests</div>
                    <div>• Early access uusiin ominaisuuksiin</div>
                    <div>• Suora linja kehitystiimiin</div>
                  </div>
                </div>
              </div>
            </label>
          </div>

          {/* Submit Button - MEGA CTA */}
          <button
            type="submit"
            disabled={loading || !formData.weekly_feedback_ok || formData.document_types.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-xl md:text-2xl py-6 px-8 rounded-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Lähetetään hakemusta...
              </span>
            ) : (
              <>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  🚀 Hae Beta-ohjelmaan (€1,791 arvo)
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </>
            )}
          </button>

          {/* Bottom info */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Saat vahvistuksen <strong className="text-blue-600">tunnin sisällä</strong> sähköpostitse
              </p>
              <div className="flex items-center justify-center gap-6 text-xs text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <span>🔒</span>
                  GDPR-suojattu
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>📧</span>
                  Ei roskapostia
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>✓</span>
                  Peruuta milloin vain
                </span>
              </div>
            </div>

            {/* Urgency indicator */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-sm">
                    {i}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-700">
                <strong className="text-blue-600">5 yritystä</strong> jo ilmoittautunut tänään
              </div>
            </div>

            <div className="text-center pt-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg animate-pulse">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span>Vain 8 paikkaa jäljellä!</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
