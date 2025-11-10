'use client';

import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('Home');
  const nav = useTranslations('Navigation');
  const locale = useLocale();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href={`/${locale}`} className="text-2xl font-semibold">
          DocFlow
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link href={`/${locale}`} className="hover:text-sky-300">
            {nav('home')}
          </Link>
          <Link href={`/${locale}/contact`} className="hover:text-sky-300">
            {nav('contact')}
          </Link>
          <Link href={`/${locale}/privacy`} className="hover:text-sky-300">
            {nav('privacy')}
          </Link>
          <Link href={`/${locale}/security`} className="hover:text-sky-300">
            {nav('security')}
          </Link>
        </nav>
      </header>

      <section className="pt-24 pb-32 px-6 max-w-3xl mx-auto text-center space-y-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-wide">
          {t('badge')}
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          {t('title')}
        </h1>
        <p className="text-lg text-white/80">
          {t('description')}
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href={`/${locale}/contact`}
            className="rounded-lg bg-sky-500 px-6 py-3 font-semibold text-white shadow hover:bg-sky-400 transition"
          >
            {t('primaryCta')}
          </Link>
          <Link
            href={`/${locale}/privacy`}
            className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white hover:border-white/60 transition"
          >
            {t('secondaryCta')}
          </Link>
        </div>
      </section>
    </main>
  );
}
