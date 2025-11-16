import Link from "next/link";
import { Suspense } from "react";

import ClientBlock from "./ClientBlock";

export const metadata = {
  title: "Kiitos – Converto™",
  robots: { index: false },
};

export default function Page() {
  const typeServer = "roi";

  return (
    <main className="mx-auto max-w-2xl px-4 py-14">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-2 text-xs text-slate-500">Converto™ · EU-hosting</p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">Kiitos – pyyntö vastaanotettu</h1>
        <Suspense fallback={<div>Ladataan...</div>}>
          <ClientBlock typeServer={typeServer} />
        </Suspense>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/roi" className="btn border border-slate-300">
            Laske ROI uudelleen
          </Link>
          <a href="/demo" className="btn border border-slate-300">
            Varaa demo
          </a>
        </div>
      </div>
    </main>
  );
}



