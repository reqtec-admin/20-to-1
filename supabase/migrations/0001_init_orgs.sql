-- 20 to 1 — multi-tenant auth & agent entitlement schema
--
-- Tenancy is modeled in Postgres (Supabase has no native "organizations"
-- primitive). One organization == one customer. The first buyer becomes the
-- org owner/admin. Purchased agents are recorded as rows in `org_agents`,
-- which is the source of truth for entitlements and billing.

create extension if not exists "pgcrypto";

-- Keeps updated_at fresh on row updates.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- organizations: one row per customer tenant.
-- ---------------------------------------------------------------------------
create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_organizations_updated_at on public.organizations;
create trigger trg_organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- memberships: which user belongs to which org, and with what functional role.
-- org_role is intentionally coarse (admin | billing | member). Fine-grained,
-- credential-bound permissions live in the broker, not here.
-- ---------------------------------------------------------------------------
create table if not exists public.memberships (
  user_id     uuid not null references auth.users (id) on delete cascade,
  org_id      uuid not null references public.organizations (id) on delete cascade,
  org_role    text not null default 'member'
              check (org_role in ('admin', 'billing', 'member')),
  created_at  timestamptz not null default now(),
  primary key (user_id, org_id)
);

create index if not exists memberships_org_id_idx on public.memberships (org_id);

-- ---------------------------------------------------------------------------
-- org_agents: the agents an org has purchased. agent_slug mirrors the product
-- slug in src/lib/products.ts (e.g. 'brand-manager', 'marketing-manager').
-- This table is the entitlement source of truth surfaced to the UI.
-- ---------------------------------------------------------------------------
create table if not exists public.org_agents (
  org_id      uuid not null references public.organizations (id) on delete cascade,
  agent_slug  text not null,
  plan        text not null default 'standard'
              check (plan in ('standard', 'advanced', 'premium')),
  status      text not null default 'active'
              check (status in ('active', 'paused', 'cancelled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (org_id, agent_slug)
);

create index if not exists org_agents_org_id_idx on public.org_agents (org_id);

drop trigger if exists trg_org_agents_updated_at on public.org_agents;
create trigger trg_org_agents_updated_at
  before update on public.org_agents
  for each row execute function public.set_updated_at();

-- Convenience helper: the set of org ids the current auth user belongs to.
-- Used by RLS policies. STABLE + security definer so policies can call it
-- without recursive RLS evaluation on memberships.
create or replace function public.current_user_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.memberships where user_id = auth.uid();
$$;
