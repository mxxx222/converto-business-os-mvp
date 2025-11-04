import Hero from '@/components/landing/Hero';
import TrustedBy from '@/components/landing/TrustedBy';
import PainPoints from '@/components/landing/PainPoints';
import SolutionHighlights from '@/components/landing/SolutionHighlights';
import ROISection from '@/components/landing/ROISection';
import CaseStudies from '@/components/landing/CaseStudies';
import PricingSection from '@/components/landing/PricingSection';
import GuaranteeSection from '@/components/landing/GuaranteeSection';
import CTASection from '@/components/landing/CTASection';
import FAQSection from '@/components/landing/FAQSection';
import FooterCTA from '@/components/landing/FooterCTA';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Converto Kuittiautomaatio – Säästä 90 % kirjanpidon ajasta',
  description:
    'Converto automatisoi kuittien käsittelyn Netvisorissa. Säästä 90 % manuaalisesta työstä, vältä ALV-virheet ja nopeuta tilinpäätöstä.',
  alternates: {
    canonical: 'https://converto.fi/',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="space-y-24">
        <Hero />
        <TrustedBy />
        <PainPoints />
        <SolutionHighlights />
        <ROISection />
        <CaseStudies />
        <PricingSection />
        <GuaranteeSection />
        <FAQSection />
        <CTASection />
        <FooterCTA />
      </main>
      <Footer />
    </div>
  );
}
