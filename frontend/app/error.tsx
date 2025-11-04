"use client";

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="rounded-full bg-red-50 px-3 py-1 text-sm text-red-700">Virhe ladattaessa</p>
      <h1 className="text-3xl font-bold">Tapahtui virhe</h1>
      <p className="text-zinc-600">Yritä hetken kuluttua uudelleen.</p>
      {error?.digest && (
        <p className="text-xs text-zinc-400">Diagnoosi: {error.digest}</p>
      )}
      <a href="/premium" className="rounded-md bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Palaa etusivulle</a>
    </main>
  );
}
