export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">Sivu ei löytynyt</p>
      <h1 className="text-3xl font-bold">404 — Etsimääsi sivua ei ole</h1>
      <p className="text-zinc-600">Tarkista osoite tai palaa etusivulle.</p>
      <a href="/premium" className="rounded-md bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Takaisin etusivulle</a>
    </main>
  );
}
