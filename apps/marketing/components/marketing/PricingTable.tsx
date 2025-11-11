import data from '../../content/mapping.json';

interface Tier {
  name: string;
  price: string;
  features: string[];
  cta: {
    href: string;
    label: string;
  };
}

export default function PricingTable(): JSX.Element {
  const tiers: Tier[] = data.pricing;
  return (
    <section>
      <h2>Hinnoittelu</h2>
      <div>
        {tiers.map((t) => (
          <div key={t.name}>
            <h3>{t.name}</h3>
            <strong>{t.price}</strong>
            <ul>{t.features.map((f) => <li key={f}>{f}</li>)}</ul>
            <a href={t.cta.href}>{t.cta.label}</a>
          </div>
        ))}
      </div>
    </section>
  );
}
