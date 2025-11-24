'use client';

import { useState } from 'react';

export function LeadMagnet() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement lead magnet download
    // For now, just mark as submitted
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Kiitos!
        </h3>
        <p className="text-gray-700">
          PDF lähetetty sähköpostiisi. Tarkista myös roskapostikansi.
        </p>
      </div>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50 border-y border-blue-100">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <div className="bg-white rounded-xl p-8 shadow-lg border border-blue-200">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Lataa ilmainen PDF-guide
            </h3>
            <p className="text-lg text-gray-600">
              5 kohdan lista: Mistä aloitat automaation?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Lukuaika ~2 minuuttia • Konkreettiset vinkit
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Sähköpostiosoitteesi"
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                data-event="cta_lead_magnet_click"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
              >
                Lataa PDF
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Lähetämme sinulle PDF:n ja olemme yhteydessä. Voit peruuttaa milloin tahansa.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

