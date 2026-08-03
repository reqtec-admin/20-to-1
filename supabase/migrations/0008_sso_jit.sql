-- Enterprise SSO mapping + Just-In-Time (JIT) provisioning.
--
-- Supabase Auth supports SAML 2.0 SSO. An IdP (Okta, Entra ID, Google
-- Workspace, etc.) is registered as an `auth.sso_providers` row and typically
-- tied to one or more email domains. To make orgs "tie in nicely with SSO" we:
--
--   1. Map verified email domains -> org (`org_domains`).
--   2. Link a Supabase SSO provider -> org, with a default role (`org_sso_connections`).
--   3. JIT-provision membership on first login via a trigger on auth.users:
--      a new user whose email domain matches a verified org domain is added to
--      that org automatically (no manual invite needed).
--
-- Group/attribute -> role or team mapping is configured in Supabase's SAML
-- attribute mapping; this schema provides the org binding and a default role
-- so that flow has somewhere to land. Consumer (non-SSO) signups are unaffected.

create table if not exists public.org_domains (
  domain      text primary key,
  org_id      uuid not null references public.organizations (id) on delete cascade,
  verified    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists org_domains_org_idx on public.org_domains (org_id);

create table if not exists public.org_sso_connections (
  org_id          uuid not null references public.organizations (id) on delete cascade,
  -- References auth.sso_providers(id). No hard FK to keep the auth schema
  -- decoupled and avoid cross-schema privilege coupling.
  sso_provider_id uuid not null,
  default_role    text not null default 'member'
                  check (default_role in ('owner', 'admin', 'billing', 'member')),
  created_at      timestamptz not null default now(),
  primary key (org_id, sso_provider_id)
);

alter table public.org_domains          enable row level security;
alter table public.org_sso_connections  enable row level security;

drop policy if exists org_domains_select on public.org_domains;
create policy org_domains_select on public.org_domains
  for select to authenticated
  using (public.is_org_member(org_id));

drop policy if exists org_domains_admin_write on public.org_domains;
create policy org_domains_admin_write on public.org_domains
  for all to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

drop policy if exists org_sso_select on public.org_sso_connections;
create policy org_sso_select on public.org_sso_connections
  for select to authenticated
  using (public.is_org_member(org_id));

drop policy if exists org_sso_admin_write on public.org_sso_connections;
create policy org_sso_admin_write on public.org_sso_connections
  for all to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

-- ---------------------------------------------------------------------------
-- JIT provisioning trigger. Best-effort: any failure here must never block a
-- signup, so the body is wrapped in an exception guard.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_domain      text;
  v_org_id      uuid;
  v_role        text;
  v_has_default boolean;
begin
  if new.email is null then
    return new;
  end if;

  v_domain := lower(split_part(new.email, '@', 2));
  if v_domain = '' then
    return new;
  end if;

  -- Find the org that owns this verified domain (with its SSO default role).
  select d.org_id, coalesce(c.default_role, 'member')
    into v_org_id, v_role
  from public.org_domains d
  left join public.org_sso_connections c on c.org_id = d.org_id
  where d.domain = v_domain and d.verified
  limit 1;

  if v_org_id is null then
    return new; -- consumer signup, nothing to do
  end if;

  select exists (
    select 1 from public.memberships where user_id = new.id and is_default
  ) into v_has_default;

  insert into public.memberships (user_id, org_id, org_role, is_default)
  values (new.id, v_org_id, v_role, not v_has_default)
  on conflict (user_id, org_id) do nothing;

  return new;
exception
  when others then
    -- Never block authentication on a provisioning hiccup.
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
