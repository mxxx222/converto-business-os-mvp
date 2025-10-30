# Supabase Setup (Domino Path)

Three-step setup: Auth → Storage ingest → Realtime.

## 1) Auth: JWKS FastAPI + SSR Next.js

### Backend
- Middleware: `shared_core/middleware/supabase_auth.py` (already present)
- Config: Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_AUTH_ENABLED=true`
- JWKS endpoint: `${SUPABASE_URL}/auth/v1/keys`
- Protected routes: all except `/`, `/health`, `/docs`, `/openapi.json`

### Frontend
- ✅ Install: `npm i @supabase/ssr @supabase/supabase-js` (completed)
- ✅ Create `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server) (completed)
- ✅ Protect dashboard routes: middleware checks session (completed)
- ✅ Dashboard page: `/app/dashboard/page.tsx` with realtime receipts (completed)
- ✅ Realtime hook: `hooks/useRealtimeReceipts.ts` for subscriptions (completed)

### Env
- Backend (Render): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_AUTH_ENABLED=true`
- Frontend (Vercel): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2) Storage Ingest (receipts bucket)

- Bucket: `receipts` (private)
- Webhook: Supabase → `POST /api/v1/receipts/storage-ingest`
- Endpoint: already implemented in `shared_core/modules/receipts/router.py`
- Flow: object_created → signed URL → OCR → save to db

## 3) Realtime Dashboards

- ✅ Enable Realtime: Supabase dashboard → Table Editor → enable for `ocr_results`, `receipts` (manual step)
- ✅ Frontend: `supabase.channel('receipts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'receipts' }, callback).subscribe()` (completed)
- ✅ Unsubscribe on unmount (completed in `useRealtimeReceipts` hook)
- ✅ Dashboard page: `/app/dashboard/page.tsx` displays realtime receipts updates

## ROI
- Work: 0.5d Auth, 0.5d Storage, 0.25d Realtime = ~1.25d total
- Benefit: less infra, cheaper ingest, better UX (live updates)

