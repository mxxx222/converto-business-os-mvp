import Link from 'next/link';

export default function HeroAB() {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-28 lg:flex-row lg:items-center">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wide text-white/80">
            Kotimainen automaatio
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Automatisoi dokumenttisi DocFlow’n avulla
          </h1>
          <p className="mt-6 text-lg text-white/80">
            Tuo kuitit ja ostolaskut järjestelmiin sekunneissa – ilman manuaalista työtä. DocFlow yhdistää
            AI:n, automaation ja integraatiot yhdeksi sujuvaksi prosessiksi.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/fi/contact"
              className="inline-flex items-center justify-center rounded-md bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-400"
            >
              Varaa demo
            </Link>
            <Link
              href="/fi/pricing"
              className="inline-flex items-center justify-center rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60"
            >
              Tutustu hintoihin
            </Link>
          </div>
        </div>
        <div className="relative mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 text-left text-sm text-white/80 lg:mx-0">
          <p className="font-semibold text-white">Automaatio käytännössä</p>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>AI tunnistaa ostolaskut, erottaa ALV:n ja luo kirjanpitoviennit automaattisesti.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>Hyväksyntäketjut muodostuvat sääntöjen perusteella – muistutukset lähetetään automaattisesti.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>Integraatiot Netvisoriin, Procountoriin ja ERP-järjestelmiin ilman manuaalista työtä.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

