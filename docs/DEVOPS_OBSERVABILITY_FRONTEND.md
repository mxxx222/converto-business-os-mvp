# Frontend Observability (Dashboard)

- Sentry (@sentry/nextjs): tracesSampleRate=0.2, Replay enabled.
- Vercel Analytics: <Analytics/> added in RootLayout.
- OTEL Web tracer: lightweight ConsoleSpanExporter boot for local debugging.
- Lighthouse CI workflow: runs on PR; performance threshold 0.85.
- Bundle Analyzer: enable with ANALYZE=true; CI uploads .next/analyze artifact.

## Env vars
- SENTRY_DSN
- NODE_ENV
- ANALYZE (optional for local)

## Usage
- Local analyze: `ANALYZE=true pnpm build` in apps/dashboard; open .next/analyze.
- PRs: see Lighthouse and analyzer artifacts in workflow run.


