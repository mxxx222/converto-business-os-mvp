'use client';

import { useState } from 'react';
import { OSLayout } from '@/components/dashboard/OSLayout';
import { Copy, Share2, TrendingUp, CheckCircle } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/posthog';

export default function ReferralPage() {
  const [referralCode] = useState('PETRI-ABC123');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    referrals: 3,
    conversions: 1,
    earned: 99,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://converto.fi?ref=${referralCode}`);
    setCopied(true);
    trackEvent('referral_link_copied', { code: referralCode });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const url = `https://converto.fi?ref=${referralCode}`;
    const message = `Säästä 10 tuntia viikossa Convertolla! 🚀 ${url}`;

    trackEvent('referral_shared', { platform, code: referralCode });

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`);
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=Converto - Säästä 10 tuntia viikossa&body=${encodeURIComponent(message)}`;
    }
  };

  return (
    <OSLayout currentPath="/app/dashboard/referral">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Referral Program</h1>
          <p className="text-gray-600 dark:text-gray-400">Ansaitse 10€ jokaista uutta asiakasta kohti</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Kutsut lähetetty</p>
            <p className="text-3xl font-bold text-blue-600">{stats.referrals}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Konversiot</p>
            <p className="text-3xl font-bold text-green-600">{stats.conversions}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Ansaittu</p>
            <p className="text-3xl font-bold text-purple-600">{stats.earned}€</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Jaa referral-linkki</h2>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={`https://converto.fi?ref=${referralCode}`}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 bg-gray-50 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Copy size={18} />
              {copied ? 'Kopioitu!' : 'Kopioi'}
            </button>
          </div>

          {/* Share Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleShare('twitter')}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Twitter
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="flex-1 px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              LinkedIn
            </button>
            <button
              onClick={() => handleShare('email')}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Email
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Miten se toimii</h2>
          <div className="space-y-4">
            {[
              {
                number: 1,
                title: 'Jaa linkki',
                description: 'Lähetä referral-linkki ystävällesi',
              },
              {
                number: 2,
                title: 'He rekisteröityvät',
                description: 'Ystäväsi käyttää linkkiäsi rekisteröityessään',
              },
              {
                number: 3,
                title: 'Ansaitse 10€',
                description: 'Kun he maksavat ensimmäisen kuukauden, saat 10€',
              },
            ].map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  {step.number}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{step.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OSLayout>
  );
}

