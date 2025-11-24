'use client';

import Link from 'next/link';

export function HeroStoryBrand() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* Problem (Mari's story) */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-gray-900">
            Poista toistotyö. Saat laskut ulos ajallaan.
          </h1>
          
          {/* Mari's Problem */}
          <div className="bg-red-50 border-l-4 border-red-500 p-8 mb-8 text-left rounded-r-lg shadow-sm">
            <div className="flex items-start gap-4">
              <div className="text-4xl">😰</div>
              <div>
                <p className="text-xl text-gray-700 mb-4 font-medium">
                  Talouspäällikkö Mari heräsi <strong className="text-red-700">klo 3 yöllä</strong> kylmässä hiessä.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  ALV-ilmoitus piti palauttaa 6 tunnin päästä.<br />
                  <strong className="text-red-700">87 laskua</strong> oli vielä käsittelemättä.
                </p>
                <p className="text-lg text-gray-700">
                  Hän oli tehnyt 12 tuntia ylitöitä tällä viikolla.<br />
                  <span className="font-semibold">Mikään ei riittänyt.</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Success (transformation) */}
          <div className="bg-green-50 border-l-4 border-green-500 p-8 mb-8 text-left rounded-r-lg shadow-sm">
            <div className="flex items-start gap-4">
              <div className="text-4xl">✨</div>
              <div>
                <p className="text-2xl font-bold text-green-900 mb-3">
                  Tänään Mari käsittelee 200 laskua <strong>6 tunnissa kuukaudessa</strong>.
                </p>
                <p className="text-lg text-gray-700">
                  Ei ylitöitä. Ei stressiä. Ei virheitä.
                </p>
              </div>
            </div>
          </div>
          
          {/* Solution */}
          <p className="text-3xl font-bold mb-12 text-blue-600">
            DocFlow tekee 80 % työstä puolestasi.
          </p>
          
          {/* Plan (simple 3 steps) */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">1️⃣</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Kytke sähköposti ja palvelut</h3>
              <p className="text-gray-600">Yhdistä sähköpostisi ja kirjanpitopalvelut</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">2️⃣</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Valitse automaatiot</h3>
              <p className="text-gray-600">Aktivoi kuitti- ja laskuautomaatio</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">3️⃣</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Seuraa tuloksia hallintapaneelissa</h3>
              <p className="text-gray-600">Näe reaaliaikaiset mittarit ja säästöt</p>
            </div>
          </div>
          
          {/* Call to Action (dual CTA) */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/demo"
              data-event="cta_demo_click"
              data-payload='{"source":"hero","position":"primary"}'
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl py-5 px-10 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Varaa 20 min demo
            </Link>
            <Link
              href="#how-it-works"
              data-event="cta_how_it_works_click"
              className="bg-white hover:bg-gray-50 text-blue-600 text-xl py-5 px-10 rounded-xl font-bold border-2 border-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Katso miten se toimii
            </Link>
          </div>
          
          <p className="text-sm text-gray-600 mb-12">
            Käyttöönotto 3–7 arkipäivässä. Ilman pitkiä projekteja.
          </p>
          
          {/* Social Proof */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <p className="text-sm font-semibold text-blue-900 mb-3">
              🔥 Todistetut tulokset suomalaisissa yrityksissä:
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-blue-700">Rakennusyritys, 28 hlö</div>
                <div className="text-gray-700">45h → 6h/kk, €2 900 säästö</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-700">Kuljetus, 70 hlö</div>
                <div className="text-gray-700">€4 500/kk säästö</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-700">IT-konsultointi, 12 hlö</div>
                <div className="text-gray-700">€1 150/kk säästö</div>
              </div>
            </div>
          </div>
          
          {/* Failure (stakes) */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg text-left">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  Mitä tapahtuu jos jatkat manuaalisesti?
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 45 h/kk hukkaan = <strong>€2 900/kk</strong> kustannus</li>
                  <li>• Ylityöt ja stressi kasvavat</li>
                  <li>• ALV-virheet ja sakot uhkaavat</li>
                  <li>• Kirjanpitäjät väsyvät ja vaihtavat työpaikkaa</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trust badges */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-80">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇪🇺</span>
              <span className="text-sm font-medium text-gray-700">EU Hosting</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className="text-sm font-medium text-gray-700">GDPR</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇫🇮</span>
              <span className="text-sm font-medium text-gray-700">Suomi.fi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-sm font-medium text-gray-700">99.9% SLA</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <span className="text-sm font-medium text-gray-700">Bank-grade Security</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
