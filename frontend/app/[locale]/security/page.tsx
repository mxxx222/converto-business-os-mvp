'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export default function SecurityPage() {
  const t = useTranslations('SecurityPage');
  const nav = useTranslations('Navigation');
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={`/${locale}`} className="text-xl font-bold text-blue-600">
                DocFlow.fi
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link href={`/${locale}`} className="text-gray-700 hover:text-blue-600">
                {nav('home')}
              </Link>
              <Link href={`/${locale}/contact`} className="text-gray-700 hover:text-blue-600">
                {nav('contact')}
              </Link>
              <Link href={`/${locale}/privacy`} className="text-gray-700 hover:text-blue-600">
                {nav('privacy')}
              </Link>
              <Link
                href={`/${locale}/security`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {nav('security')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Security Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            {t('title')}
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="mt-16 prose prose-lg mx-auto">
          <p>{t('content')}</p>
          
          <h2>Tietoturvatoimenpiteet</h2>
          <ul>
            <li>SSL/TLS-salaus kaikessa tiedonsiirrossa</li>
            <li>Tiedot tallennetaan EU:n alueelle</li>
            <li>Säännölliset tietoturva-auditoinnit</li>
            <li>Pääsynhallinta ja lokitiedot</li>
          </ul>

          <h2>Sertifikaatit</h2>
          <ul>
            <li>ISO 27001 -standardin mukainen tietoturva</li>
            <li>GDPR-yhteensopivuus</li>
            <li>SOC 2 Type II -raportointi</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
