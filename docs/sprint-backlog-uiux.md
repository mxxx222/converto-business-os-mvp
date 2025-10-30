# Sprint Backlog: Korkean ROI UI/UX ‑parannukset

Tavoite: Parantaa dashboardin käytettävyyttä, incidents‑triagea ja turva‑UX:ää nopeasti mitattavilla vaikutuksilla (10 pv sprintti).

## Aikajana
1) KPI‑kortit: hierarkia, skeleton, URL‑suodatus  
2) Incidents‑triage: pikasuodattimet, CSV  
3) Turva‑UX: HMAC example, avainmaskaus, IP‑allowlist  
4) Quick start + Postman + OpenAPI linkit  
5) E2E: auth, rate limit, replay (Playwright smoke)  
6–7) Responsiivisuus + saavutettavuus  
8–9) Onboarding‑tour  
10) Viimeistely ja bugit

---

## Tiketit ja DoD

### KPI‑kortit ja taulukot
- [ ] KPI‑hierarkia: ensisijainen KPI isona, toissijaiset pienempinä  
  DoD: komponenttitasolla propit `primary`, `secondary[]`; visuaalit hyväksytty
- [ ] Skeleton‑tilat kortteihin ja taulukoihin  
  DoD: ≥300 ms skeleton näkyy; Lighthouse CLS ei huonone
- [ ] Empty states + CTA  
  DoD: jokaisella listalla tyhjätila‑kopio ja CTA linkitys
- [ ] Suodatuschipit taulukon yläpuolelle  
  DoD: klikillä URL‑param päivittyy; back/forward toimii
- [ ] Tallennettavat näkymät (query‑param presetit)  
  DoD: `?view=preset` ja localStorage viimeisin näkymä
- [ ] CSV‑vienti: näkyvät sarakkeet + aikavyöhyke  
  DoD: export kunnioittaa näkyvää; TZ valittavissa

### Incidents‑näkymä
- [ ] Triage‑workflow: prioriteetti, status, omistaja, pikatoiminnot  
  DoD: p95 status‑päivitys ≤200 ms UI‑tasolla
- [ ] Ryhmittely syyn mukaan, pikasuodattimet (aika, palvelu, severity)  
  DoD: ryhmittely vaihtuu ilman reloadia
- [ ] Bulk‑toiminnot + CSV valituille  
  DoD: valinta säilyy sivutuksessa; export vain valitut
- [ ] Sivu‑paneeli: metatiedot, audit‑logi, toiminnot  
  DoD: paneeli avautuu, ESC sulkee, focus trap ok

### Haku ja suorituskyky
- [ ] Debounce 250 ms, URL‑synkka  
  DoD: kirjoituksen aikana ei floodaa; `?q=` päivittyy
- [ ] Virtuaalilista suureen dataan  
  DoD: 10k riviä scrollaa sulavasti

### Turva‑UX
- [ ] Avainmaskaus + 1‑klikin kopio  
  DoD: näytä `••••‑****‑last4`; copy‑toast toimii
- [ ] HMAC‑“Generate example” (Node, Python, cURL)  
  DoD: yksi klikki tuottaa toimivan esimerkin
- [ ] IP‑allowlist‑modal validoinneilla  
  DoD: IPv4/IPv6 validointi, duplikaattien/tyhjien esto

### Responsiivisuus ja saavutettavuus
- [ ] Mobiilinavigaatio + taulukoiden stacked‑card  
  DoD: <md korttinäkymä; nav toimii yhdellä kädellä
- [ ] A11y: kontrastit, focus‑tilat, ARIA  
  DoD: axe‑kriittiset 0; Lighthouse a11y ≥90
- [ ] Näppäinoikotiet: `/` haku, `f` suodatin  
  DoD: dokumentoitu ja testattu

### Onboarding
- [ ] 60 s first‑run (3–4 steppiä)  
  DoD: skippaus + “älä näytä uudelleen” toimii
- [ ] Demo‑data‑tila + “Tyhjennä demo”  
  DoD: reset palauttaa alkutilan

### Dokumentaatio
- [ ] Quick start 90 s + .env esimerkit + 1. API‑kutsu  
  DoD: README‑osio valmis
- [ ] HMAC‑esimerkit + virheilmoitusten selitykset  
  DoD: `scripts/hmac-generate-example.js` ja doc
- [ ] Rate limit ‑politiikka + virhekoodimatriisi  
  DoD: doc + linkit API:in
- [ ] Postman/Insomnia‑collection + OpenAPI linkki  
  DoD: `docs/postman_collection.json` + `/openapi.json`
- [ ] Incidents API käyttötapaukset  
  DoD: luonti/listaus/suodatus/status‑päivitys kuvattu

---

## Mittarit
- KPI: TTI p50 <2.0 s; Preset CTR +15 %  
- Incidents triage‑toiminto p95 ≤200 ms; klikit/incident −30 %  
- CSV palaute −50 %; export ≤1 s/1k riviä  
- A11y ≥90; mobiili bounce −10 %; scroll‑syvyys +10 %
