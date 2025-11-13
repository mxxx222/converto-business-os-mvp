'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="max-w-md w-full mx-4">
        {/* DocFlow Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-slate-900">
            DocFlow
          </Link>
          <p className="text-slate-600 mt-2">Kirjaudu tilillesi</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sähköpostiosoite
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="nimi@yritys.fi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Salasana
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kirjaudutaan...' : 'Kirjaudu sisään'}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center space-y-2">
            <Link 
              href="/forgot-password" 
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Unohditko salasanan?
            </Link>
            <div className="text-slate-500 text-sm">
              Eikö sinulla ole tiliä?{' '}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700">
                Rekisteröidy tässä
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Marketing */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-slate-600 hover:text-slate-900 text-sm"
          >
            ← Takaisin etusivulle
          </Link>
        </div>
      </div>
    </div>
  );
}
