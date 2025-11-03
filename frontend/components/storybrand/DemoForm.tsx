'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

interface DemoFormProps {
  source?: string;
  variant?: string;
}

export function DemoForm({ source = 'storybrand', variant = 'storybrand' }: DemoFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Demo-pyynnön lähetys epäonnistui');
      }

      // Track success
      trackEvent('demo_request_success', {
        email: formData.email,
        company: formData.company,
        source,
        variant,
      });

      setSuccess(true);
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Demo-pyynnön lähetys epäonnistui';
      setError(errorMessage);

      // Track error
      trackEvent('demo_request_error', {
        error: errorMessage,
        source,
        variant,
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-500/10 border border-green-500 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-[var(--neon-green)] mb-2">Kiitos demo-pyynnöstäsi!</h3>
        <p className="text-gray-300">
          Olemme vastaanottaneet pyyntösi. Otamme yhteyttä 24 tunnin kuluessa!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Nimi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[var(--neon-green)] focus:outline-none"
            placeholder="Esim. Matti Meikäläinen"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Sähköposti <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[var(--neon-green)] focus:outline-none"
            placeholder="matti@yritys.fi"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
            Yritys <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="company"
            required
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[var(--neon-green)] focus:outline-none"
            placeholder="Yrityksen nimi"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
            Puhelin
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[var(--neon-green)] focus:outline-none"
            placeholder="+358 50 123 4567"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
          Viesti
        </label>
        <textarea
          id="message"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[var(--neon-green)] focus:outline-none resize-none"
          placeholder="Kerro meille enemmän tarpeistasi..."
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="neon-button w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Lähetetään...' : 'Pyydä demo'}
      </button>
    </form>
  );
}
