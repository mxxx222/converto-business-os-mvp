export const revalidate = 86400

export default function DPAPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 prose prose-slate max-w-none">
      <h1>Data Processing Agreement (DPA) – Yhteenveto</h1>
      <p className="text-slate-600">
        Tämä sivu tiivistää Converto Oy:n ja asiakkaan välisen tietojenkäsittelysopimuksen (DPA)
        keskeiset kohdat. Täysi DPA on ladattavissa PDF‑muodossa.
      </p>

      <div className="not-prose bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Osapuolet</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium text-blue-800 mb-1">Rekisterinpitäjä (Controller)</h3>
            <p className="text-blue-700 text-sm">Asiakas – määrittää käsittelyn tarkoituksen ja keinot</p>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-1">Käsittelijä (Processor)</h3>
            <p className="text-blue-700 text-sm">Converto Oy – käsittelee tietoja asiakkaan puolesta</p>
          </div>
        </div>
      </div>

      <h2>Käsittelyn kohde ja kesto</h2>
      <ul>
        <li><strong>Kohde:</strong> Palvelun tuottaminen dokumenttien automaatioon</li>
        <li><strong>Kesto:</strong> Sopimussuhteen ajan + lakisääteiset säilytysajat</li>
        <li><strong>Sijainti:</strong> EU-alue (ensisijaisesti Saksa ja Alankomaat)</li>
      </ul>

      <h2>Henkilötietoryhmät ja rekisteröidyt</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Käyttäjätiedot</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Nimi, sähköposti, puhelinnumero</li>
            <li>• Käyttäjäroolit ja oikeudet</li>
            <li>• Kirjautumislokit</li>
          </ul>
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Dokumenttitiedot</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Toimittajien nimet ja Y-tunnukset</li>
            <li>• Laskujen summat ja viitteet</li>
            <li>• Päivämäärät ja eräpäivät</li>
          </ul>
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Tekniset tiedot</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• IP-osoitteet ja käyttölokit</li>
            <li>• Laite- ja selaininformaatio</li>
            <li>• Virheraportit ja suorituskykytiedot</li>
          </ul>
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Rekisteröidyt</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Asiakkaan työntekijät</li>
            <li>• Toimittajien yhteyshenkilöt</li>
            <li>• Loppukäyttäjät</li>
          </ul>
        </div>
      </div>

      <h2>Converto Oy:n velvoitteet käsittelijänä</h2>
      <div className="not-prose">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="font-semibold mb-1">Dokumentoidut ohjeet</h3>
              <p className="text-sm text-slate-600">
                Käsittelemme henkilötietoja vain asiakkaan kirjallisten ohjeiden mukaan. 
                Kaikki käsittely on dokumentoitu ja jäljitettävissä.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
            <span className="text-2xl">🤐</span>
            <div>
              <h3 className="font-semibold mb-1">Salassapito</h3>
              <p className="text-sm text-slate-600">
                Kaikki henkilökunta on sitoutunut salassapitoon. Pääsy tietoihin on rajoitettu 
                vain välttämättömään henkilöstöön.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-semibold mb-1">Tietoturva</h3>
              <p className="text-sm text-slate-600">
                Tekninen ja organisatorinen tietoturva GDPR:n artiklan 32 mukaisesti. 
                Salaus, pääsynhallinta ja audit-lokit.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
            <span className="text-2xl">🚨</span>
            <div>
              <h3 className="font-semibold mb-1">Tietoturvaloukkaukset</h3>
              <p className="text-sm text-slate-600">
                Ilmoitamme tietoturvaloukkauksista asiakkaalle ilman aiheetonta viivytystä, 
                viimeistään 24 tunnin kuluessa.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
            <span className="text-2xl">🤝</span>
            <div>
              <h3 className="font-semibold mb-1">Rekisteröidyn oikeudet</h3>
              <p className="text-sm text-slate-600">
                Avustamme asiakasta rekisteröidyn pyyntöjen toteuttamisessa (pääsy, oikaisu, 
                poisto, siirrettävyys).
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2>Alikäsittelijät</h2>
      <p>
        Converto Oy käyttää seuraavia alikäsittelijöitä. Kaikki alikäsittelijät ovat sitoutuneet 
        vastaaviin tietosuojavelvoitteisiin:
      </p>

      <div className="not-prose">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-300 p-3 text-left">Palvelu</th>
                <th className="border border-slate-300 p-3 text-left">Tarkoitus</th>
                <th className="border border-slate-300 p-3 text-left">Sijainti</th>
                <th className="border border-slate-300 p-3 text-left">Tietosuoja</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-3 font-medium">Supabase</td>
                <td className="border border-slate-300 p-3">Tietokanta ja autentikointi</td>
                <td className="border border-slate-300 p-3">EU-West (Frankfurt)</td>
                <td className="border border-slate-300 p-3">SOC 2, ISO 27001</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-3 font-medium">Vercel</td>
                <td className="border border-slate-300 p-3">Hosting ja CDN</td>
                <td className="border border-slate-300 p-3">EU (Amsterdam)</td>
                <td className="border border-slate-300 p-3">SOC 2, GDPR</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-3 font-medium">Resend</td>
                <td className="border border-slate-300 p-3">Sähköpostipalvelu</td>
                <td className="border border-slate-300 p-3">EU</td>
                <td className="border border-slate-300 p-3">GDPR, DPA</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-3 font-medium">PostHog</td>
                <td className="border border-slate-300 p-3">Analytiikka</td>
                <td className="border border-slate-300 p-3">EU-hosted</td>
                <td className="border border-slate-300 p-3">GDPR, EU-hosting</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h2>Kansainväliset siirrot</h2>
      <div className="not-prose bg-emerald-50 border border-emerald-200 rounded-lg p-4 my-6">
        <p className="text-emerald-800 text-sm">
          <strong>EU-isännöinti:</strong> Kaikki henkilötiedot säilytetään ja käsitellään EU-alueella. 
          Poikkeukset dokumentoidaan erikseen ja toteutetaan asianmukaisilla suojatoimilla (SCC).
        </p>
      </div>

      <h2>Tietoturvatoimet</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Tekninen turvallisuus</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Salaus siirrossa (TLS 1.2+) ja levossa (AES-256)</li>
            <li>• Row Level Security (RLS)</li>
            <li>• Automaattiset varmuuskopiot</li>
            <li>• Penetraatiotestit vuosittain</li>
          </ul>
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Organisatorinen turvallisuus</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Pääsynhallinta ja roolit</li>
            <li>• Henkilöstön koulutus</li>
            <li>• Incident response -prosessi</li>
            <li>• Säännölliset turvallisuusauditoinnit</li>
          </ul>
        </div>
      </div>

      <h2>Auditointi ja valvonta</h2>
      <p>
        Asiakkaalla on oikeus saada kohtuulliset selvitykset käsittelyn vaatimustenmukaisuudesta. 
        Tarjoamme vuosittain:
      </p>
      <ul>
        <li>SOC 2 Type II -raportin (kun saatavilla)</li>
        <li>Penetraatiotestaustulokset</li>
        <li>Tietoturva-auditoinnin yhteenvedon</li>
        <li>Compliance-tarkistuslistan</li>
      </ul>

      <h2>Tietojen poisto ja palautus</h2>
      <p>
        Sopimuksen päätyttyä Converto Oy:
      </p>
      <ul>
        <li>Palauttaa tai poistaa kaikki henkilötiedot asiakkaan valinnan mukaan</li>
        <li>Säilyttää vain lakisääteisesti vaaditut tiedot (kirjanpitolaki)</li>
        <li>Toimittaa todistuksen tietojen poistosta</li>
        <li>Varmistaa, että alikäsittelijät noudattavat samoja velvoitteita</li>
      </ul>

      <div className="not-prose mt-12 text-center">
        <div className="space-y-4">
          <p className="text-slate-600">
            Tarvitsetko täyden DPA:n sopimuskäyttöön?
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/legal/dpa.pdf"
              className="inline-block rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 transition-colors"
              download
            >
              Lataa täysi DPA (PDF)
            </a>
            <a
              href="/contact?topic=dpa"
              className="inline-block rounded-md border border-slate-300 px-5 py-3 hover:bg-slate-50 transition-colors"
            >
              Ota yhteyttä
            </a>
          </div>
        </div>
      </div>

      <div className="not-prose mt-8 text-center">
        <p className="text-slate-600 text-sm">
          Viimeksi päivitetty: {new Date().toLocaleDateString('fi-FI')}
        </p>
      </div>
    </main>
  )
}
