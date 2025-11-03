import type { Metadata } from 'next';
import { ThankYouContent } from '@/components/pages/ThankYouContent';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kiitos demo-pyynnöstäsi! - Converto',
  description: 'Olemme vastaanottaneet demo-pyyntösi. Otamme yhteyttä 24 tunnin kuluessa.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  return <ThankYouContent />;
}
