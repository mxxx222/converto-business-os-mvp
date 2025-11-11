# Copilot Go‑Live — tarkistuslista

## 1) Kyvykkyydet ja omistajuus
- [ ]  Capability‑rekisteri: capability → owner module → API/events
- [ ]  Yksi authoritative owner per capability
- [ ]  Päällekkäiset reitit poistettu tai de‑priorisoitu

## 2) Sopimukset ja idempotenssi
- [ ]  OpenAPI julkaistu ja versionoitu (SemVer)
- [ ]  Write‑operaatioissa Idempotency‑Key
- [ ]  Optimistic locking / ETag kriittisissä resursseissa

## 3) Politiikat ja sääntökone
- [ ]  Policyt per virta (esim. order→invoice)
- [ ]  "Single writer" enforceattu
- [ ]  Budjetti‑ ja aikarajat: rate limit, timebox

## 4) Shadow → Canary → Rollout
- [ ]  Shadow mode päällä, drift‑raportti
- [ ]  Canary 1–5 % tenantteja feature flagilla
- [ ]  Automaattinen rollback kriteereillä (error‑budget, drift%)

## 5) Legacy‑yhteensopivuus
- [ ]  Adapteri/facade vanhoihin integraatioihin
- [ ]  Dedupe + correlation‑id kaksoiskirjauksille
- [ ]  Batch‑ajoikkunat/lock sovittu

## 6) Observability ja audit
- [ ]  Structured logs + trace id + idempotency key
- [ ]  Metrics: p50/p95, error‑rate per capability
- [ ]  Audit‑trail + diff‑näkymä Admin UI:ssa

## 7) Hälytykset ja kill switch
- [ ]  Hälytykset: error‑piikit, drift, SLA‑rikkomukset
- [ ]  Global kill switch + per‑capability off‑switch
- [ ]  Runbookit virhetilanteisiin

## 8) Data ja migraatiot
- [ ]  Idempotentit migraatiot + dry‑run
- [ ]  Backfill‑jobit erillään online‑polusta
- [ ]  PII‑luokittelu ja retention (GDPR)

## 9) Turvallisuus ja salaisuudet
- [ ]  OIDC/OAuth least‑privilege
- [ ]  Secret‑manager (Doppler/1Password/Vault)
- [ ]  Webhook‑allekirjoitusten verifiointi ja replay‑suojat

## 10) Suorituskyky ja kustannus
- [ ]  Rate limitit + backoff ulkoisiin API:hin
- [ ]  Queue‑pituus, retry ja DLQ seurannassa
- [ ]  Kustannusvahti: kutsut/asiakas, budjettihälytys

## 11) UX ja hallinta
- [ ]  Admin UI: Capabilities, Jobs, What changed?
- [ ]  Roolit: oikeudet käynnistää/rollbackata
- [ ]  Selitteet: mitä Copilot tekee ja milloin

## 12) Testit ja hyväksyntä
- [ ]  E2E‑polut: order→invoice, refund, retry, cancel
- [ ]  Chaos‑testit: timeout, 429/5xx, partial failure
- [ ]  Hyväksyntä: varmentajan sign‑off + lokit
