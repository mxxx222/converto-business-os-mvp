import type { Metadata } from "next";

import RoiCalculator from "@/components/RoiCalculator";
import { cfg } from "@/lib/config";

export const metadata: Metadata = {
  title: "ROI-laskuri – Converto™ Business OS",
  description:
    "Laske automaation tuotto, takaisinmaksu ja kassavirran vaikutus. 3–7 arkipäivän käyttöönotto.",
  robots: { index: true },
};

export default function Page() {
  const headline = cfg.abHeadlineB
    ? "Palauta 40 tuntia kuukaudessa – tuo eurot esiin"
    : "Automaatio, joka vähentää käsityötä ja kasvattaa kassavirtaa";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-8">
        <p className="mb-2 text-xs text-slate-500">
          Tietoturva ja Eurooppa-hosting · Toimitus 3–7 arkipäivässä
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{headline}</h1>
        <p className="mt-3 max-w-2xl text-slate-700">
          Yhdistä kuitit, laskutus ja raportointi yhteen näkymään. Syötä luvut ja näe
          takaisinmaksu minuuteissa.
        </p>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Luottamus</p>
          <p className="text-sm text-slate-700">
            “Ensimmäinen kuukausi palautti 40 h manuaalia ja nopeutti kassaa 9 päivää.”
          </p>
        </div>
      </section>

      <RoiCalculator />

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        <ValueCard
          title="Laskuri konkretisoi eurot"
          body="Näet kuukausittaisen hyödyn, ROI-prosentin ja takaisinmaksun reaaliajassa."
        />
        <ValueCard
          title="CTA vaihtuu tuloksen mukaan"
          body="Pilotti käynnistyy heti vahvalla ROI:lla, rajatapauksessa suosittelemme kypsyyskartoitusta."
        />
        <ValueCard
          title="Liidit suoraan myynnille"
          body="Resend lähettää laskelman ja taustatiedot myyntiin sekä vahvistusviestin asiakkaalle."
        />
      </section>
    </main>
  );
}

function ValueCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </div>
  );
}

