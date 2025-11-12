import type { Metadata } from 'next';
import { HomeFi } from '../(marketing)/components/home';

export const metadata: Metadata = {
  title: 'DocFlow – Automatisoi taloushallinnon dokumentit AI:lla',
  description:
    'DocFlow automatisoi kuittien ja ostolaskujen käsittelyn. Integraatiot Netvisoriin, Procountoriin ja Vero.fi-palveluun ilman järjestelmävaihtoa.',
};

export default function FiPage() {
  return <HomeFi />;
}

