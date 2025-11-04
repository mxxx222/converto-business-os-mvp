import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Varaa demo - Converto Kuittiautomaatio',
  description: 'Varaa 15 minuutin demo ja näe kuinka Converto automatisoi kuittien käsittelyn Netvisorissa.',
  alternates: {
    canonical: 'https://converto.fi/demo',
  },
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Varaa 15 minuutin demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Näytämme sinulle kuinka Converto automatisoi kuittien käsittelyn Netvisorissa.
            Säästä 90% ajasta ja vältä ALV-virheet.
          </p>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Mitä demo sisältää?
            </h2>
            <ul className="space-y-4 text-left max-w-2xl mx-auto">
              {[
                'Näytämme kuinka OCR lukee kuitit automaattisesti',
                'Esittelemme Netvisor-integraation käytännössä',
                'Laskemme sinun ROI:si automaatiolla',
                'Vastaamme kaikkiin kysymyksiisi',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Varaa demo
              </h3>
              <p className="text-gray-600 mb-6">
                Täytä lomake ja otamme yhteyttä 24 tunnin sisällä.
              </p>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nimi
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Anna nimesi"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Sähköposti
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="anna@yritys.fi"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Yritys (valinnainen)
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Yrityksen nimi"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Viesti (valinnainen)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Kerro meille mitä haluat nähdä demossa..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lähetä pyyntö
                </button>
              </form>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Tai ota yhteyttä suoraan:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:info@converto.fi"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  📧 info@converto.fi
                </a>
                <span className="hidden sm:inline text-gray-400">•</span>
                <a
                  href="tel:+358401234567"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  📞 +358 40 123 4567
                </a>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Takaisin etusivulle
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
