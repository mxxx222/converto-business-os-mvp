'use client';

import Link from 'next/link';

export function OfferStack() {
  const offerItems = [
    {
      icon: '🚀',
      title: 'Käyttöönotto 3–7 arkipäivää',
      description: 'Ilman pitkiä projekteja',
    },
    {
      icon: '🤖',
      title: 'Automaatiopaketti',
      description: 'Kuitit, laskutus, hälytykset',
    },
    {
      icon: '📊',
      title: 'Hallintapaneeli ja viikkoraportti',
      description: 'Reaaliaikaiset mittarit',
    },
    {
      icon: '💬',
      title: 'Tuki Slack/sähköposti',
      description: 'Vastaus 24h sisällä',
    },
    {
      icon: '🎁',
      title: 'Bonus: Säästöarvio + toteutussuunnitelma',
      description: 'Valmis 24h sisällä',
    },
  ];

  const totalValue = 1794; // €
  const currentPrice = 149; // €/kk Starter
  const savings = totalValue - (currentPrice * 6); // 6 months

  return (
    <section className="py-16 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Mitä saat käyttöönotossa?
          </h2>
          <p className="text-xl text-gray-600">
            Kaikki tarvitsemasi yhdessä paketissa
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {offerItems.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div>
              <div className="text-sm text-gray-600 mb-1">Arvo yhteensä</div>
              <div className="text-3xl font-bold text-gray-900">{totalValue} €</div>
              <div className="text-xs text-gray-500 mt-1">6 kuukauden aikana</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Nykyinen hinta</div>
              <div className="text-3xl font-bold text-blue-600">{currentPrice} €/kk</div>
              <div className="text-xs text-gray-500 mt-1">Starter-paketti</div>
            </div>
            <div className="text-center md:text-left">
              <Link
                href="/signup"
                data-event="cta_offer_stack_click"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                Aloita nyt
              </Link>
              <p className="text-xs text-gray-500 mt-2">
                Säästö {savings} € ensimmäisen 6 kk aikana
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

