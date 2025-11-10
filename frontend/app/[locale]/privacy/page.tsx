'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export default function PrivacyPage() {
  const t = useTranslations('PrivacyPage');
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
              <Link href={`/${locale}/security`} className="text-gray-700 hover:text-blue-600">
                {nav('security')}
              </Link>
              <Link
                href={`/${locale}/privacy`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {nav('privacy')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Privacy Content */}
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
          
          <h2>Mitä tietoja keräämme</h2>
          <ul>
            <li>Yhteystiedot (nimi, sähköposti)</li>
            <li>Laskutustiedot</li>
            <li>Käyttötiedot palvelusta</li>
            <li>Ladatut dokumentit (käsittelyä varten)</li>
          </ul>

          <h2>Miten käytämme tietoja</h2>
          <ul>
            <li>Palvelun tarjoaminen</li>
            <li>Asiakastuki</li>
            <li>Laskutus</li>
            <li>Palvelun kehittäminen</li>
          </ul>

          <h2>Tietojen jakaminen</h2>
          <p>Emme jaa henkilötietojasi kolmansille osapuolille ilman suostumustasi, paitsi:</p>
          <ul>
            <li>Lakisääteisten velvoitteiden täyttämiseksi</li>
            <li>Palveluntarjoajille (esim. pilvipalvelut)</li>
            <li>Yrityskaupan yhteydessä</li>
          </ul>

          <h2>Oikeutesi</h2>
          <ul>
            <li>Tietojen tarkastaminen</li>
            <li>Tietojen korjaaminen</li>
            <li>Tietojen poistaminen</li>
            <li>Käsittelyn rajoittaminen</li>
            <li>Tietojen siirrettävyys</li>
          </ul>

          <h2>Yhteystiedot</h2>
          <p>Tietosuoja-asioissa voit ottaa yhteyttä: privacy@docflow.fi</p>
        </div>
      </div>
    </div>
  );
}
