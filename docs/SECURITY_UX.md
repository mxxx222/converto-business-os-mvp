# Security UX Spec

## Key Masking & Copy
- Näytä muodossa `••••-****-last4`
- “Kopioi”‑nappi: 1‑klikin kopio, toast “Kopioitu” 2 s
- “Näytä/piilota” vain admin‑roolille

## HMAC “Generate example”
- Modal, jossa välilehdet: Node, Python, cURL
- Syötteet: Secret (masked), Method, Path, Body (JSON)
- 1‑klikin generointi + kopiointipainike
- Skripti: `scripts/hmac-generate-example.js` (valmis)

## IP Allowlist Modal
- Syöttölista IPv4/IPv6; validoi formaattti
- Estä duplikaatit ja tyhjät rivit
- Näytä viimeinen muokkaaja + aika
- CTA “Tallenna” disabled kun virheitä

## Tests
- Maskaus toimii ja ei vuoda logeihin
- HMAC‑esimerkit tuottavat saman allekirjoituksen eri kielillä
- IP‑lista ei hyväksy virheellisiä osoitteita
