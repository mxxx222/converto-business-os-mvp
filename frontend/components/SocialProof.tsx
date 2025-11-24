'use client';

import { Star, Users, TrendingUp, Shield } from 'lucide-react';

interface Testimonial {
  company: string;
  industry: string;
  employees: string;
  result: string;
  quote: string;
  name: string;
  title: string;
  savings: string;
}

const testimonials: Testimonial[] = [
  {
    company: "Rakennusyritys Kivikko Oy",
    industry: "Rakentaminen",
    employees: "28 hlö",
    result: "45h → 6h/kk",
    quote: "ALV-virheet nollaantuivat. Säästämme 2 900€ kuukaudessa ja kirjanpitäjä voi keskittyä strategiaan.",
    name: "Marja Kivikko",
    title: "Toimitusjohtaja",
    savings: "€2 900/kk"
  },
  {
    company: "Kuljetus Nopea Oy",
    industry: "Logistiikka",
    employees: "70 hlö",
    result: "Rahtikirjat + laskutus",
    quote: "Duplikaatit loppuivat. Automaattinen hinnoittelu säästää meiltä 4 500€ kuukaudessa.",
    name: "Pekka Nopea",
    title: "Talouspäällikkö",
    savings: "€4 500/kk"
  },
  {
    company: "IT-Konsultti Pro Oy",
    industry: "IT-palvelut",
    employees: "12 hlö",
    result: "Kuitit + hyväksynnät",
    quote: "Mobiilisovellus on huikea. Kuittien käsittely vie nyt minuutteja, ei tunteja.",
    name: "Anna Koodari",
    title: "Partneri",
    savings: "€1 150/kk"
  }
];

const stats = [
  { label: "Yritystä käyttää", value: "50+", icon: Users },
  { label: "Säästö keskimäärin", value: "€2 900/kk", icon: TrendingUp },
  { label: "OCR-tarkkuus", value: "97%", icon: Star },
  { label: "Uptime", value: "99.9%", icon: Shield }
];

export function SocialProof() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
      
        {/* Trust Logos */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-gray-600 mb-4">
            Luottanut jo 50+ yritystä Suomessa
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
            {/* Placeholder logos - replace with actual company logos */}
            <div className="text-2xl font-bold text-gray-400">Netvisor</div>
            <div className="text-2xl font-bold text-gray-400">Procountor</div>
            <div className="text-2xl font-bold text-gray-400">Holvi</div>
            <div className="text-2xl font-bold text-gray-400">Zervant</div>
            <div className="text-2xl font-bold text-gray-400">Vero.fi</div>
          </div>
        </div>

        {/* Why Us Section */}
        <div className="bg-white rounded-xl p-8 mb-12 border border-gray-200">
          <h3 className="text-2xl font-bold text-center mb-6">Miksi me?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-bold text-lg mb-2">3-7 arkipäivää tuotantoon</h4>
              <p className="text-gray-600 text-sm">Nopea käyttöönotto ilman pitkiä projekteja</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="font-bold text-lg mb-2">Netvisor/Procountor-osaaminen</h4>
              <p className="text-gray-600 text-sm">Syvä integraatio-osaaminen suomalaisiin järjestelmiin</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h4 className="font-bold text-lg mb-2">ROI-takuu</h4>
              <p className="text-gray-600 text-sm">Jos et säästä, palautamme rahat 30 päivän sisällä</p>
            </div>
          </div>
        </div>
      
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
            <Star className="w-5 h-5" />
            <span className="font-medium">Todistetut tulokset</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Suomalaiset yritykset säästävät jo €120 000/kk
          </h2>
          <p className="text-xl text-gray-600">
            Katso miten DocFlow muutti näiden yritysten arkea
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center bg-white p-6 rounded-xl shadow-sm">
              <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
        </div>
      </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              
              {/* Company Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {testimonial.company.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.company}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.industry} • {testimonial.employees}
                    </div>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-green-700 font-medium mb-1">
                  Tulos:
                </div>
                <div className="font-bold text-green-900">
                  {testimonial.result}
        </div>
                <div className="text-2xl font-bold text-green-600 mt-2">
                  {testimonial.savings}
        </div>
      </div>

              {/* Quote */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="border-t border-gray-200 pt-4">
                <div className="font-semibold text-gray-900">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-600">
                  {testimonial.title}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-blue-600 text-white rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-4">
            Haluatko saman tuloksen?
          </h3>
          <p className="text-blue-100 mb-6 text-lg">
            Liity 50+ suomalaiseen yritykseen jotka säästävät aikaa ja rahaa DocFlow:lla
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors text-lg"
            >
              🚀 Aloita ilmainen kokeilu
            </a>
            <a
              href="/demo"
              className="bg-blue-700 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-800 transition-colors text-lg border-2 border-blue-400"
            >
              📅 Varaa demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}