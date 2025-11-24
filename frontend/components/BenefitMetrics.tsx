'use client';

export function BenefitMetrics() {
  const metrics = [
    {
      label: 'Säästetty aika',
      value: '+12 h/vk',
      description: 'vähemmän käsityötä',
      icon: '⏱️',
    },
    {
      label: 'Säästetty raha',
      value: '–35 %',
      description: 'käsittelykustannukset/kk',
      icon: '💰',
    },
    {
      label: 'Laskut ulos',
      value: '2×',
      description: 'nopeammin',
      icon: '⚡',
    },
    {
      label: 'Virheitä',
      value: '–72 %',
      description: 'laskuvirheet',
      icon: '✅',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Konkreettiset hyödyt mitattavissa
          </h2>
          <p className="text-xl text-gray-600">
            Näe säästöt reaaliajassa hallintapaneelissa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="text-4xl mb-4">{metric.icon}</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
              <div className="text-lg font-semibold text-gray-700 mb-1">{metric.label}</div>
              <div className="text-sm text-gray-600">{metric.description}</div>
            </div>
          ))}
        </div>

        {/* Esimerkkilaskelma */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            💡 Esimerkkilaskelma:
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Jos tiimissä kuluu 10 h/vk manuaaliin, automaatio säästää ~520 h/vuosi. 
            Tuntihinta 35 € → säästö noin <strong className="text-blue-700">18 200 € / vuosi</strong>.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            <li>• –72% laskuvirheet</li>
            <li>• Viivehälytykset ja poikkeamat</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

