'use client';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';

export default function CustomerHeroSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  return (
    <section className="bg-black text-white py-20 text-center">
      <p className="text-xl text-gray-300 italic">{t.customer.aspiration}</p>
    </section>
  );
}
