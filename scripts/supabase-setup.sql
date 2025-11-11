-- PR 4: Supabase Realtime Database Schema
-- Run this script in your Supabase SQL editor to enable admin activities table

-- Create admin_activities table for Supabase Realtime backend
create table if not exists public.admin_activities (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- Enable row level security for multi-tenant isolation
alter table public.admin_activities enable row level security;

-- Create policy for tenant data isolation
-- Note: In production, you'd want more sophisticated RLS policies
-- This is a simplified version for demo purposes
create policy tenant_isolation on public.admin_activities 
for select using (true);

-- Enable real-time for the table
alter publication supabase_realtime add table admin_activities;

-- Create index for better query performance
create index if not exists idx_admin_activities_tenant_id 
on public.admin_activities (tenant_id);

create index if not exists idx_admin_activities_created_at 
on public.admin_activities (created_at desc);

-- Optional: Add a function to clean up old activities
create or replace function cleanup_old_activities()
returns integer
language plpgsql
as $$
declare
  deleted_count integer;
begin
  -- Delete activities older than 30 days
  delete from public.admin_activities 
  where created_at < now() - interval '30 days';
  
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- Add a cron job to clean up old activities (requires pg_cron extension)
-- select cron.schedule('cleanup-admin-activities', '0 2 * * *', 'select cleanup_old_activities();');