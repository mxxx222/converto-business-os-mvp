export const revalidate = 86400

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 prose prose-slate max-w-none">
      <h1>Tietosuojaseloste</h1>
      <p className="text-slate-600">Päivitetty: {new Date().toLocaleDateString('fi-FI')}</p>

      <h2>1. Rekisterinpitäjä</h2>
      <div className="not-prose bg-slate-50 rounded-lg p-4 my-4">
        <p className="mb-2">
          <strong>Converto Oy</strong> ("me", "DocFlow")
        </p>
        <p className="mb-1">Turku, Suomi</p>
        <p className="mb-1">Y‑tunnus: [Lisätään myöhemmin]</p>
        <p>Sähköposti: privacy@converto.fi</p>
      </div>

      <h2>2. Mitä tietoja keräämme</h2>
      <h3>Tilin perustiedot</h3>
      <ul>
        <li>Nimi, sähköposti, yrityksen nimi ja Y-tunnus</li>
        <li>Käyttäjäroolit ja käyttöoikeudet</li>
        <li>Laskutustiedot ja sopimustiedot</li>
      </ul>

      <h3>Tuotedata</h3>
      <ul>
        <li>Ladatut dokumentit (kuitit, ostolaskut, rahtikirjat)</li>
        <li>Dokumenttien metatiedot (päivämäärät, summat, toimittajat)</li>
        <li>OCR-tulokset ja AI-käsittelyn lokit</li>
        <li>Integraatioiden synkronointitiedot</li>
      </ul>

      <h3>Tekniset tiedot</h3>
      <ul>
        <li>IP-osoite, laite- ja selaininformaatio</li>
        <li>Evästeet (analytiikka, suorituskyky, käyttäjäkokemus)</li>
        <li>Käyttölokit ja virheraportit</li>
      </ul>

      <h3>Tuki- ja viestintätiedot</h3>
      <ul>
        <li>Yhteydenotot asiakastukeen</li>
        <li>Markkinointiviestinnän suostumukset</li>
        <li>Webinar- ja tapahtumailmoittautumiset</li>
      </ul>

      <h2>3. Käsittelyn tarkoitus ja peruste</h2>
      <div className="not-prose">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Palvelun tuottaminen</h4>
            <p className="text-sm text-slate-700 mb-2">
              <strong>Peruste:</strong> Sopimuksen täytäntöönpano (GDPR 6.1.b)
            </p>
            <p className="text-sm text-slate-600">
              Dokumenttien käsittely, OCR, integraatiot, käyttäjätilien hallinta
            </p>
          </div>
          <div className="border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Lakisääteiset velvoitteet</h4>
            <p className="text-sm text-slate-700 mb-2">
              <strong>Peruste:</strong> Lakisääteinen velvoite (GDPR 6.1.c)
            </p>
            <p className="text-sm text-slate-600">
              Kirjanpitolain mukainen 10 vuoden säilytys, verotiedot
            </p>
          </div>
          <div className="border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Oikeutettu etu</h4>
            <p className="text-sm text-slate-700 mb-2">
              <strong>Peruste:</strong> Oikeutettu etu (GDPR 6.1.f)
            </p>
            <p className="text-sm text-slate-600">
              Tietoturva, tuotekehitys, analytiikka, petostentorjunta
            </p>
          </div>
          <div className="border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Suostumus</h4>
            <p className="text-sm text-slate-700 mb-2">
              <strong>Peruste:</strong> Suostumus (GDPR 6.1.a)
            </p>
            <p className="text-sm text-slate-600">
              Markkinointiviestintä, evästeet, uutiskirjeet
            </p>
          </div>
        </div>
      </div>

      <h2>4. Säilytysaika</h2>
      <ul>
        <li><strong>Asiakasdataa:</strong> Säilytetään asiakkuuden ajan + 12 kuukautta</li>
        <li><strong>Kirjanpitodokumentit:</strong> 10 vuotta kirjanpitolain mukaisesti</li>
        <li><strong>Lokitiedot:</strong> 12–24 kuukautta tietoturvasyistä</li>
        <li><strong>Markkinointitiedot:</strong> Suostumuksen peruuttamiseen asti</li>
      </ul>

      <h2>5. Vastaanottajat ja siirrot</h2>
      <h3>EU-alueen palvelut</h3>
      <ul>
        <li><strong>Supabase EU-West:</strong> Tietokanta ja autentikointi</li>
        <li><strong>Vercel EU:</strong> Hosting ja CDN</li>
        <li><strong>Resend:</strong> Sähköpostipalvelu (EU-vaihtoehto)</li>
      </ul>

      <h3>Kolmannet osapuolet</h3>
      <ul>
        <li><strong>Analytiikka:</strong> PostHog (EU-hosted), Plausible</li>
        <li><strong>Viranomaisintegraatiot:</strong> Vero.fi, Suomi.fi</li>
        <li><strong>Taloushallinto-ohjelmistot:</strong> Netvisor, Procountor, Holvi, Zervant</li>
        <li><strong>Tuki:</strong> Crisp.chat (EU-palvelimet)</li>
      </ul>

      <div className="not-prose bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
        <p className="text-blue-800 text-sm">
          <strong>Tärkeää:</strong> Emme myy henkilötietoja. Kaikki sopimukset sisältävät DPA:n ja tietoturvavelvoitteet.
        </p>
      </div>

      <h2>6. Tietoturva</h2>
      <ul>
        <li>Salaus siirrossa (TLS 1.2+) ja levossa (AES-256)</li>
        <li>Row Level Security (RLS) ja käyttäjäkohtaiset roolit</li>
        <li>Audit-lokit kaikista toiminnoista</li>
        <li>Automaattiset varmuuskopiot ja disaster recovery</li>
        <li>Penetraatiotestit ja turvallisuusauditoinnit</li>
      </ul>

      <h2>7. Rekisteröidyn oikeudet</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <div className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Pääsy tietoihin</h4>
          <p className="text-sm text-slate-600">
            Voit pyytää kopion kaikista sinusta tallennetuista tiedoista (JSON/CSV/PDF-muodossa).
          </p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Oikaisu ja poisto</h4>
          <p className="text-sm text-slate-600">
            Voit korjata virheelliset tiedot tai pyytää tietojen poistoa (GDPR 17, ellei lakisääteistä estettä).
          </p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Käsittelyn rajoitus</h4>
          <p className="text-sm text-slate-600">
            Voit pyytää käsittelyn keskeyttämistä tai vastustaa käsittelyä tietyissä tilanteissa.
          </p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Tietojen siirto</h4>
          <p className="text-sm text-slate-600">
            Saat tietosi koneluettavassa muodossa siirtoa varten toiseen palveluun.
          </p>
        </div>
      </div>

      <h2>8. Evästeet</h2>
      <p>
        Käytämme välttämättömiä, suorituskyky- ja analytiikkaevästeitä. Voit hallita
        suostumuksia evästebannerissa tai selaimesi asetuksissa.
      </p>

      <h3>Evästetyypit</h3>
      <ul>
        <li><strong>Välttämättömät:</strong> Kirjautuminen, istunnot, turvallisuus</li>
        <li><strong>Suorituskyky:</strong> Sivujen latausajat, virheenseuranta</li>
        <li><strong>Analytiikka:</strong> Käyttötilastot, sivupolut (Plausible, PostHog)</li>
      </ul>

      <h2>9. Yhteydenotot ja valitukset</h2>
      <div className="not-prose bg-slate-50 rounded-lg p-4 my-4">
        <p className="mb-2">
          <strong>Tietosuoja-asiat:</strong> privacy@converto.fi
        </p>
        <p className="mb-2">
          <strong>Yleinen asiakastuki:</strong> support@converto.fi
        </p>
        <p>
          <strong>Valvontaviranomainen:</strong> Tietosuojavaltuutetun toimisto (tietosuoja.fi)
        </p>
      </div>

      <h2>10. Muutokset tietosuojaselosteeseen</h2>
      <p>
        Ilmoitamme merkittävistä muutoksista sähköpostilla ja päivitämme tämän sivun.
        Suosittelemme tarkistamaan selosteen säännöllisesti.
      </p>

      <div className="not-prose mt-12 text-center">
        <p className="text-slate-600 text-sm">
          Viimeksi päivitetty: {new Date().toLocaleDateString('fi-FI')}
        </p>
      </div>
    </main>
  )
}
