'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export default function ContactPage() {
  const t = useTranslations('ContactPage');
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
              <Link href={`/${locale}/security`} className="text-gray-700 hover:text-blue-600">
                {nav('security')}
              </Link>
              <Link href={`/${locale}/privacy`} className="text-gray-700 hover:text-blue-600">
                {nav('privacy')}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {nav('contact')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contact Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            {t('title')}
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Sähköposti</h3>
                <p className="text-blue-600">{t('email')}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Puhelin</h3>
                <p className="text-blue-600">{t('phone')}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="mailto:hello@docflow.fi"
              className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700"
            >
              Lähetä viesti
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
