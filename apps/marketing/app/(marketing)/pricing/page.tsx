import PricingTable from '../../../components/marketing/PricingTable';

export const metadata = { title: 'Hinnoittelu — CONVERTO' };
export const revalidate = 1800;

export default function PricingPage(): JSX.Element {
  return (
    <main>
      <PricingTable />
    </main>
  );
}
