const plans = [
  {
    name: 'Starter',
    price: '149 €',
    period: '/kk',
    description: 'Toiminimille ja pienille tiimeille',
    features: ['500 dokumenttia / kk', 'Perus-OCR', '1 integraatio', 'Email-tuki'],
    popular: false,
  },
  {
    name: 'Business',
    price: '299 €',
    period: '/kk',
    description: 'PK-yrityksen automaatiopaketti',
    features: [
      '2 000 dokumenttia / kk',
      'Laajennettu OCR + hyväksynnät',
      '2 integraatiota',
      'Prioriteettituki',
    ],
    popular: true,
  },
  {
    name: 'Professional',
    price: '499 €',
    period: '/kk',
    description: 'Kasvaville tiimeille ja konserneille',
    features: [
      '5 000 dokumenttia / kk',
      'API ja webhookit',
      'Fraud-esto',
      'SSO ja auditointi',
    ],
    popular: false,
  },
];

export function PricingPlans() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <article
          key={plan.name}
          className={`flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm ${
            plan.popular ? 'border-blue-500' : 'border-slate-200'
          }`}
        >
          {plan.popular && (
            <span className="mb-4 inline-flex items-center gap-2 self-start rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
              Suosituin
            </span>
          )}
          <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
          <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
          <p className="mt-6 text-3xl font-bold text-slate-900">
            {plan.price}{' '}
            <span className="text-base font-medium text-slate-500">{plan.period}</span>
          </p>
          <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-600">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={`mt-8 w-full rounded-md px-4 py-2 text-sm font-semibold transition ${
              plan.popular
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'border border-slate-300 text-slate-700 hover:border-slate-400'
            }`}
          >
            Aloita kokeilu
          </button>
        </article>
      ))}
    </div>
  );
}

