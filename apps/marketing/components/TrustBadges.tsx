export default function TrustBadges() {
  const badges = [
    'GDPR by design',
    'EU-hostattu',
    'SOC 2 -valmis',
    'Suomi.fi integraatiot',
  ];

  return (
    <section className="-mt-12 bg-white py-12">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-6">
        {badges.map((badge) => (
          <div
            key={badge}
            className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
              ✓
            </span>
            <span>{badge}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

