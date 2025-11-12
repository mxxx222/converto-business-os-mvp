import type { Metadata } from 'next';
import { HomeEn } from '../(marketing)/components/home';

export const metadata: Metadata = {
  title: 'DocFlow – Automate finance documentation with AI',
  description:
    'DocFlow automates receipts and purchase invoices with AI. Deep integrations to Netvisor, Procountor and direct VAT filing to Vero.fi.',
  alternates: {
    languages: {
      'fi-FI': '/fi',
      'en-US': '/en',
    },
  },
};

export default function EnPage() {
  return <HomeEn />;
}

