# CSV Export Spec (Visible Columns + Timezone)

## Scope
Exporttaa vain näkyvät sarakkeet taulukon nykyisestä näkymästä ja kunnioita suodatuksia, järjestystä ja sivutusta (valinta‑case erikseen).

## Rules
- Sarakejärjestys = UI‑järjestys
- Vain näkyvät sarakkeet (column toggle huomioidaan)
- Aikavyöhyke valittavissa (default = browser tz)
- Numerot ja päivämäärät lokalisoidaan (en‑US/fi‑FI jne.)
- CSV delimiter = `,`, UTF‑8 BOM, rivinvaihto `\n`

## API
- Frontend generoi CSV:n client‑puolella nykyisestä datasta TAI kutsuu `/api/export` endpointtia, joka ottaa query‑parametrina näkyvät sarakkeet

## UX
- Export‑nappi taulukon oikeassa yläkulmassa
- Tooltip: “Vie vain näkyvät sarakkeet”
- TZ‑select (dropdown): Browser / UTC / Europe/Helsinki / Custom

## Tests
- Sarakkeiden määrä vastaa näkyviä
- Järjestys vastaa UI:ta
- Päivämäärät konvertoitu valittuun TZ:aan
