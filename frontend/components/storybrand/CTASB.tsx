'use client';

import TrackCTA from '@/components/analytics/TrackCTA';
import { useSBTranslation } from '@/lib/i18n/useSBTranslation';

export default function CTASB({ lang = 'fi' }: { lang?: 'fi' | 'en' }) {
  const t = useSBTranslation(lang);

  return (
    <section className="bg-black text-center py-20">
      <TrackCTA label="CTA Primary" variant="StoryBrand">
        <button className="neon-button m-2">{t.cta.primary}</button>
      </TrackCTA>
      <TrackCTA label="CTA Secondary" variant="StoryBrand">
        <button className="m-2 border border-gray-500 px-6 py-3 text-white rounded-lg hover:opacity-80">
          {t.cta.secondary}
        </button>
      </TrackCTA>
    </section>
  );
}
