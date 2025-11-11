-- ============================================
-- Converto Business OS
-- PILOT_SIGNUPS — Pilot-ohjelman ilmoittautumiset
-- ============================================

-- 1️⃣ Luo taulu
create table if not exists public.pilot_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) <= 255),
  company text,
  ip inet,
  locale text default 'fi',
  source text default 'landing',
  created_at timestamptz not null default now(),
  confirmed boolean default false,
  confirmed_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

comment on table public.pilot_signups is 'Pilot-ohjelmaan liittyneiden yritysten yhteystiedot ja metatiedot.';

comment on column public.pilot_signups.email is 'Ilmoittautujan sähköpostiosoite';
comment on column public.pilot_signups.company is 'Yrityksen nimi (valinnainen)';
comment on column public.pilot_signups.ip is 'IP-osoite (rate limit - ja analytiikkakäyttöön)';
comment on column public.pilot_signups.locale is 'Kielivalinta (fi, en, sv, ru, et)';
comment on column public.pilot_signups.confirmed is 'Onko sähköpostiosoite vahvistettu (double opt-in)';
comment on column public.pilot_signups.metadata is 'Mahdolliset lisätiedot (esim. UTM-parametrit)';

-- 2️⃣ Indeksit
create index if not exists pilot_signups_created_at_idx on public.pilot_signups (created_at desc);
create index if not exists pilot_signups_email_idx on public.pilot_signups (lower(email));

-- 3️⃣ (valinnainen) Uniikki sähköpostiosoite
-- Voit estää saman sähköpostin useamman ilmoittautumisen näin:
-- alter table public.pilot_signups add constraint pilot_signups_email_unique unique (lower(email));

-- 4️⃣ Poista RLS
alter table public.pilot_signups disable row level security;

-- 5️⃣ Grantit API:lle ja Service Rolelle
grant select, insert, update, delete on public.pilot_signups to anon;
grant select, insert, update, delete on public.pilot_signups to service_role;

-- 6️⃣ Luo yksinkertainen trigger aikaleiman päivitykseen (jos haluat käyttää päivityksiä myöhemmin)
create or replace function public.touch_pilot_signups_updated()
returns trigger as $$
begin
  new.created_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_pilot_signups_updated on public.pilot_signups;
create trigger touch_pilot_signups_updated
before update on public.pilot_signups
for each row execute function public.touch_pilot_signups_updated();

-- ✅ VALMIS
-- Nyt API voi tehdä POST /api/pilot-signup ilman RLS-estoja.
-- Supabase Service Role käyttää tätä taulua lomakkeiden tallennukseen ja raportointiin.

-- ============================================
-- Converto Business OS
-- PILOT_SIGNUPS_STATS — Päivittäinen ja kielikohtainen yhteenveto
-- ============================================

create or replace view public.pilot_signups_stats as
select
  date_trunc('day', created_at)::date as signup_date,
  coalesce(locale, 'unknown') as locale,
  count(*) as total_signups,
  count(distinct lower(email)) as unique_emails,
  sum(case when confirmed then 1 else 0 end) as confirmed_count,
  min(created_at) as first_signup,
  max(created_at) as last_signup
from public.pilot_signups
group by date_trunc('day', created_at), coalesce(locale, 'unknown')
order by signup_date desc;

comment on view public.pilot_signups_stats is
'Yhteenvetonäkymä pilot_signups-taulusta: ilmoittautumiset päivittäin ja kielittäin.';

-- ✅ Hyöty:
-- - Näet nopeasti montako ilmoittautumista per päivä ja kieli
-- - Voit rakentaa Grafanan / Supabase Chartin suoraan tämän view'n pohjalta

-- 🚀 Esimerkkikyselyt:
-- 1. Viimeiset 7 päivää:
-- select * from public.pilot_signups_stats where signup_date > now() - interval '7 days';

-- 2. Kielijakauma:
-- select locale, sum(total_signups) from public.pilot_signups_stats group by locale;

-- 3. Kokonaismäärä:
-- select sum(total_signups) as total, sum(confirmed_count) as confirmed from public.pilot_signups_stats;
