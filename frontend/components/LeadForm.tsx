"use client";

import { useState } from "react";
import { track } from "@/lib/track";

export default function LeadForm({ context }: { context: string }) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<null | boolean>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, context }),
    });

    setOk(res.ok);
    setLoading(false);
    track("lead_submitted", { ok: res.ok, context });

    if (res.ok) window.location.href = "/thanks?type=roi";
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <input name="email" type="email" required placeholder="Sähköposti *" className="input" />
      <input name="name" placeholder="Nimi" className="input" />
      <input name="company" placeholder="Yritys" className="input" />
      <input name="phone" placeholder="Puhelin" className="input" />
      <textarea name="notes" placeholder="Lyhyt kuvaus tarpeesta" className="input min-h-24" />
      <button disabled={loading} className="btn btn-primary" aria-busy={loading}>
        {loading ? "Lähetetään…" : "Lähetä ilmoittautuminen"}
      </button>
      {ok === true && (
        <p className="text-sm text-green-600">
          Kiitos. Otamme yhteyttä 1 arkipäivässä.
        </p>
      )}
      {ok === false && (
        <p className="text-sm text-red-600">
          Virhe lähetyksessä. Kokeile uudelleen.
        </p>
      )}
      <p className="text-xs text-slate-500">Vastaamme 1 arkipäivässä. Ei sitoumusta.</p>
    </form>
  );
}

