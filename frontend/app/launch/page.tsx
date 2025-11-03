import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { CheckCircle, Zap, TrendingUp, Users, BarChart3, Rocket } from 'lucide-react';

export const metadata = {
  title: '🎉 Converto Business OS on Nyt Live! - Automatisoi Yrityksesi',
  description:
    'Converto Business OS on nyt tuotannossa! Aloita ilmainen 30 päivän pilotti ja automatisoi kirjanpito, ALV-laskelmat ja asiakaspalvelu. ROI: +800%.',
};

export default function LaunchPage() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section - Launch Announcement */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
            🎉 VIRALLINEN LANSEERI
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Converto Business OS on Nyt Live!
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Automatisoi yrityksesi tänään. Aloita ilmainen 30 päivän pilotti ja säästä 8h/viikko manuaalisista prosesseista.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/business-os/pilot"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
            >
              Aloita Ilmainen Pilotti →
            </Link>
            <Link
              href="/app/login"
              className="px-8 py-4 bg-blue-500/20 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg hover:bg-blue-500/30 transition-all"
            >
              Kirjaudu Sisään
            </Link>
          </div>
        </div>
      </section>

      {/* ROI Metrics */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Miksi Valita Converto Business OS?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-green-500">
              <div className="text-5xl mb-4">⏱️</div>
              <h3 className="text-2xl font-bold mb-2">Säästö: 8h/viikko</h3>
              <p className="text-gray-600 mb-4">Automatisoi manuaaliset prosessit</p>
              <div className="text-3xl font-bold text-green-600">ROI: +420%</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-blue-500">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-2">Nopeus: <100ms</h3>
              <p className="text-gray-600 mb-4">Reaaliaikainen käsittely</p>
              <div className="text-3xl font-bold text-blue-600">ROI: +100%</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-purple-500">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-2xl font-bold mb-2">KokonaisROI: +800%</h3>
              <p className="text-gray-600 mb-4">Takaisinmaksuaika 3-6 kk</p>
              <div className="text-3xl font-bold text-purple-600">Live Now!</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Kaikki Mitä Tarvitset Yhdessä Alustassa
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🧾',
                title: 'OCR + ALV-automaatio',
                description: 'Automaattinen kuittien tunnistus ja ALV-erittely. Vero.fi -integroitu.',
                benefit: 'Säästö: 8h/viikko',
              },
              {
                icon: '🤖',
                title: 'ChatService™ AI',
                description: 'GPT-5 -pohjainen asiakaspalvelu ja myyntibotit.',
                benefit: 'Säästö: 2000€/kk',
              },
              {
                icon: '📊',
                title: 'Reaaliaikainen Raportointi',
                description: 'Automaattiset ALV-, kassavirta- ja tuloraportit.',
                benefit: 'Säästö: 4h/viikko',
              },
              {
                icon: '⚡',
                title: 'Realtime Updates',
                description: 'Päivitykset reaaliajassa ilman sivun päivitystä.',
                benefit: 'Nopeus: <50ms',
              },
              {
                icon: '🔒',
                title: 'Enterprise Security',
                description: 'RBAC, tietosuoja ja auditointi integroituina.',
                benefit: '99.95% uptime',
              },
              {
                icon: '📱',
                title: 'Responsive Design',
                description: 'Toimii kaikilla laitteilla: desktop, tablet, mobile.',
                benefit: '100% accessible',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-3">{feature.description}</p>
                <div className="text-sm font-semibold text-blue-600">{feature.benefit}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Production-Ready Performance
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { metric: 'LCP', value: '<2.5s', target: '1.8s', icon: Zap },
              { metric: 'FID', value: '<100ms', target: '45ms', icon: TrendingUp },
              { metric: 'CLS', value: '<0.1', target: '0.05', icon: BarChart3 },
              { metric: 'Uptime', value: '99.9%', target: '99.95%', icon: CheckCircle },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-6 text-center shadow-md">
                  <Icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <div className="text-3xl font-bold mb-1">{item.metric}</div>
                  <div className="text-2xl font-semibold text-green-600 mb-2">{item.target}</div>
                  <div className="text-sm text-gray-600">Target: {item.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Rocket className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">
            Aloita Tänään – Ilmainen 30 Päivän Pilotti
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Ei korttitietoja. Peruuta milloin tahansa. Ensimmäiset 50 yritystä saavat 30 päivää ilmaiseksi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/business-os/pilot"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
            >
              Ilmoittaudu Pilottiin →
            </Link>
            <Link
              href="/services"
              className="px-8 py-4 bg-blue-500 text-white border-2 border-white/30 rounded-lg hover:bg-blue-500/80 transition-all"
            >
              Katso Palvelupaketit
            </Link>
          </div>
          <div className="mt-12 pt-8 border-t border-blue-500/30">
            <p className="text-blue-100">
              💡 <strong>ROI-laskelma:</strong> Keskimääräinen säästö 8h/viikko × 50€/h × 52 viikkoa ={' '}
              <strong className="text-white">20,800€/vuosi</strong> | Kustannus: 299€/kk = 3,588€/vuosi{' '}
              <strong className="text-white">→ ROI: +480%</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <Users className="w-12 h-12 mx-auto mb-6 text-gray-400" />
          <h2 className="text-3xl font-bold mb-4">
            Ensimmäiset 50 Yritystä Saavat:
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-600" />
              <div className="font-bold text-lg mb-2">30 Päivää Ilmaiseksi</div>
              <p className="text-gray-600">Ei korttitietoja tarvita</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <div className="font-bold text-lg mb-2">Prioritoidut Tuki</div>
              <p className="text-gray-600">Nopea vastausaika</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
              <CheckCircle className="w-8 h-8 mx-auto mb-3 text-purple-600" />
              <div className="font-bold text-lg mb-2">ROI-Analyysi</div>
              <p className="text-gray-600">Automaattinen säästölaskelma</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

