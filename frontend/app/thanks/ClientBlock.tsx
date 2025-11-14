"use client";

import { useSearchParams } from "next/navigation";

export default function ClientBlock({ typeServer }: { typeServer: string }) {
  const params = useSearchParams();
  const type = params?.get("type") || typeServer;

  const summary =
    type === "demo"
      ? "Vahvistamme 20 min demosi pian. Saat kalenterikutsun ja ohjeet sähköpostiin."
      : "ROI-laskelma on vastaanotettu. Voimme käydä sen läpi nopeassa 20 min demossa.";

  const icsHref =
    type === "demo"
      ? "/api/ics?title=Converto%20Demo&dur=20&desc=Nopea%20esittely%20ja%20ROI&loc=Online"
      : "/api/ics?title=Converto%20ROI%20Review&dur=20&desc=Laskelman%20läpikäynti&loc=Online";

  return (
    <div className="grid gap-3">
      <p className="text-slate-700">{summary}</p>
      <div className="flex flex-wrap gap-3">
        <a className="btn btn-primary" href={icsHref}>
          Lisää kalenteriin (.ics)
        </a>
        <a className="btn border border-slate-300" href="/demo">
          Valitse toinen aika
        </a>
      </div>
      <p className="text-xs text-slate-500">Vastaamme 1 arkipäivässä. Ei sitoumusta.</p>
    </div>
  );
}

