'use client';

import { useSBTranslation } from '@/lib/i18n/useSBTranslation';

export default function CustomerHeroSB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  return (
    <section className="bg-black text-white py-12 md:py-20 text-center" id="customer-hero" aria-labelledby="customer-hero-title">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <h2 id="customer-hero-title" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8">
          Sinä haluat yrityksesi toimivan sujuvasti
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 italic leading-relaxed">
          {t.customer.aspiration}
        </p>
      </div>
    </section>
  );
}
