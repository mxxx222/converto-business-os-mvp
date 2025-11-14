"use client";

import { useEffect, useState } from "react";

import { track } from "@/lib/track";

export default function DemoPageClient() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<null | boolean>(null);

  useEffect(() => {
    track("demo_view");
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    const res = await fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setOk(res.ok);
    setLoading(false);
    track(res.ok ? "demo_booked" : "demo_failed", payload as Record<string, unknown>);

    if (res.ok) window.location.href = "/thanks?type=demo";
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6">
        <p className="mb-2 text-xs text-slate-500">
          Tietoturva & EU-hosting · Toimitus 3–7 arkipäivää
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Varaa 20 min demo</h1>
        <p className="mt-2 text-slate-700">
          Näytämme automaation käytännössä ja laskemme ROI:n datallasi.
        </p>
      </header>

      <section className="grid gap-6">
        <form
          onSubmit={submit}
          className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <input name="email" type="email" required placeholder="Sähköposti *" className="input" />
            <input name="name" placeholder="Nimi" className="input" />
            <input name="company" placeholder="Yritys" className="input md:col-span-2" />
            <input name="phone" placeholder="Puhelin" className="input md:col-span-2" />
          </div>
          <textarea
            name="notes"
            placeholder="Toivottu aika/aikavyöhyke ja lyhyt tarvekuvaus"
            className="input min-h-28"
          />
          <button disabled={loading} className="btn btn-primary" aria-busy={loading}>
            {loading ? "Lähetetään…" : "Lähetä ja vahvista kalenterissa"}
          </button>
          {ok === true && (
            <p className="text-sm text-green-600">
              Kiitos. Lähetimme vahvistuksen sähköpostiisi ja luomme kalenterikutsun 1 arkipäivässä.
            </p>
          )}
          {ok === false && (
            <p className="text-sm text-red-600">Virhe. Yritä uudelleen.</p>
          )}
          <p className="text-xs text-slate-500">
            Ei sitoumusta. Tiedot tallentuvat Notioniin myyntiä varten.
          </p>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Mitä demossa tapahtuu</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Nykytila 5 min: kuitit, laskutus, raportit</li>
            <li>Live-esitys 10 min: kytkennät ja työnkulut</li>
            <li>ROI-yhteenveto 5 min: takaisinmaksu ja seuraavat askeleet</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

