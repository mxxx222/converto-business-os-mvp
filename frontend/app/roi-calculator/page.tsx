import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ROICalculator from '@/components/ROICalculator';

export const metadata: Metadata = {
  title: 'ROI-laskuri - Laske säästösi Converton automaatiolla',
  description: 'Laske kuinka paljon aikaa ja rahaa säästät Converton kuittiautomaatiolla. Interaktiivinen ROI-laskuri.',
  alternates: {
    canonical: 'https://converto.fi/roi-calculator',
  },
};

export default function ROICalculatorPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main>
        <ROICalculator />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Valmis aloittamaan?
            </h2>
            <p className="text-gray-600 mb-6">
              Aloita 30 päivän ilmainen kokeilu ja aloita säästämään heti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pilot"
                className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aloita ilmaiseksi
              </Link>
              <Link
                href="/demo"
                className="inline-block border-2 border-blue-600 text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Varaa demo
              </Link>
            </div>
          </div>
          <div className="mt-8">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Takaisin etusivulle
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
