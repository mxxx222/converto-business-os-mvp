# Pulumi: Render secrets ja ympäristömuuttujat

Tämä esimerkki näyttää, miten Pulumin kautta voi asettaa Render-palvelun ympäristömuuttujia. Huomaa, että toteutus riippuu käyttämästäsi Render-providerista (virallinen/epävirallinen) tai omasta API-kutsukääreestä.

## Esimerkkikoodi (TypeScript, viitteellinen)

```
import * as pulumi from "@pulumi/pulumi";
// import { EnvironmentVariable } from "pulumi-render"; // Esimerkkiprovideri

const apiBaseUrl = new pulumi.Config().require("apiBaseUrl");

new render.EnvironmentVariable("dashboard-api-base", {
  serviceName: "converto-dashboard", // Render service name
  key: "NEXT_PUBLIC_API_BASE",
  value: pulumi.interpolate`${apiBaseUrl}`,
});

new render.EnvironmentVariable("dashboard-stripe-pk", {
  serviceName: "converto-dashboard",
  key: "STRIPE_PUBLIC_KEY",
  value: pulumi.secret("pk_live_xxx"),
});

new render.EnvironmentVariable("dashboard-sentry-dsn", {
  serviceName: "converto-dashboard",
  key: "SENTRY_DSN",
  value: pulumi.secret("https://xxx@o0.ingest.sentry.io/0"),
});
```

- Aja Pulumi stackissa, jotta Renderin envit päivittyvät (provider/integraatio tarvitaan).
- Voit toistaa saman kaavan muille appeille (billing, receipts, legal) vaihtamalla `serviceName`-arvon.
