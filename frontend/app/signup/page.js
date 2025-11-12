export const metadata = {
  title: "Aloita ilmainen kokeilu – DocFlow by Converto",
  description: "Rekisteröidy DocFlow'n 30 päivän ilmaiseen kokeiluun. Ei luottokorttia, ei sitoutumista. Käyttöönotto 15 minuutissa.",
};

import Link from 'next/link';

export default function SignupPage() {
  return (
    <main>
      <section className="bg-slate-50/50">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">Aloita ilmainen 30 päivän kokeilu</h1>
            <p className="mt-4 text-lg text-slate-600">
              Ei luottokorttia. Ei sitoutumista. Käyttöönotto 15 minuutissa.
            </p>
          </div>

          <div className="mt-12 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Nimi *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Sähköposti *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-slate-700">
                  Yritys *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  required
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="businessId" className="block text-sm font-medium text-slate-700">
                  Y-tunnus
                </label>
                <input
                  type="text"
                  id="businessId"
                  name="businessId"
                  placeholder="1234567-8"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="plan" className="block text-sm font-medium text-slate-700">
                  Paketti
                </label>
                <select
                  id="plan"
                  name="plan"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="starter">Starter (149 €/kk)</option>
                  <option value="business" selected>Business (299 €/kk)</option>
                  <option value="professional">Professional (499 €/kk)</option>
                </select>
              </div>

              <div>
                <label htmlFor="goal" className="block text-sm font-medium text-slate-700">
                  Tavoite (valinnainen)
                </label>
                <textarea
                  id="goal"
                  name="goal"
                  rows="3"
                  placeholder="Mitä haluatte automatisoida? Kuinka monta dokumenttia käsittelette kuukaudessa?"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Aloita ilmainen kokeilu
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Rekisteröitymällä hyväksyt{' '}
                <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                  tietosuojakäytännön
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Kysymyksiä? <Link href="/contact" className="text-blue-600 hover:underline">Ota yhteyttä</Link> tai{' '}
              <Link href="/demo" className="text-blue-600 hover:underline">varaa demo</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
