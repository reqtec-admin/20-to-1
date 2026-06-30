-- Scale from "solo buyer" to corporations & teams.
--
-- The original model grants an agent to the whole org and every member's token
-- carries every org agent. That does not scale to a company where only the
-- Brand team should reach the Brand Manager agent and only Marketing should
-- reach n8n-style automation agents.
--
-- This migration adds:
--   * an 'owner' functional role (the billing owner / first user)
--   * a per-user "active org" flag so a user can belong to many orgs
--   * `seats` on org_agents (the license the org bought)
--   * teams + team membership (groups inside an org)
--   * team-level and user-level agent assignments (who actually gets a seat)
--   * helper functions used by RLS and by the access-token hook
--
-- Effective access for a user in an org = (owner/admin ⇒ all active org agents)
-- ∪ direct user assignments ∪ assignments via any team they belong to,
-- always intersected with the org's *active* entitlements.

-- ---------------------------------------------------------------------------
-- Expand functional roles and add the active-org flag.
-- ---------------------------------------------------------------------------
alter table public.memberships drop constraint if exists memberships_org_role_check;
alter table public.memberships
  add constraint memberships_org_role_check
  check (org_role in ('owner', 'admin', 'billing', 'member'));

alter table public.memberships
  add column if not exists is_default boolean not null default false;

-- A user has at most one active/default org.
create unique index if not exists memberships_one_default_per_user
  on public.memberships (user_id)
  where (is_default);

-- ---------------------------------------------------------------------------
-- Seats: how many licenses of an agent the org purchased (null = unlimited).
-- ---------------------------------------------------------------------------
alter table public.org_agents
  add column if not exists seats integer;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'org_agents_seats_nonneg'
  ) then
    alter table public.org_agents
      add constraint org_agents_seats_nonneg
      check (seats is null or seats >= 0);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Teams (groups within an org), their members, and team-level agent grants.
-- ---------------------------------------------------------------------------
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  name        text not null,
  slug        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, slug)
);
create index if not exists teams_org_id_idx on public.teams (org_id);

drop trigger if exists trg_teams_updated_at on public.teams;
create trigger trg_teams_updated_at
  before update on public.teams
  for each row execute function public.set_updated_at();

create table if not exists public.team_members (
  team_id     uuid not null references public.teams (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (team_id, user_id)
);
create index if not exists team_members_user_id_idx on public.team_members (user_id);

create table if not exists public.team_agents (
  team_id     uuid not null references public.teams (id) on delete cascade,
  agent_slug  text not null,
  created_at  timestamptz not null default now(),
  primary key (team_id, agent_slug)
);

-- ---------------------------------------------------------------------------
-- Per-user agent assignments (a consumed seat). The composite FK guarantees a
-- user can only be assigned an agent the org actually owns.
-- ---------------------------------------------------------------------------
create table if not exists public.agent_assignments (
  org_id      uuid not null references public.organizations (id) on delete cascade,
  agent_slug  text not null,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (org_id, agent_slug, user_id),
  foreign key (org_id, agent_slug)
    references public.org_agents (org_id, agent_slug) on delete cascade
);
create index if not exists agent_assignments_user_idx
  on public.agent_assignments (user_id, org_id);

-- ---------------------------------------------------------------------------
-- Helper functions. SECURITY DEFINER so they bypass RLS and can be reused both
-- inside RLS policies (no recursion) and inside the access-token hook.
-- ---------------------------------------------------------------------------
create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid() and org_id = p_org_id
  );
$$;

create or replace function public.is_org_admin(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid()
      and org_id = p_org_id
      and org_role in ('owner', 'admin')
  );
$$;

-- The set of agent slugs a user can actually use within an org.
create or replace function public.effective_agent_slugs(p_user_id uuid, p_org_id uuid)
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  with active as (
    select agent_slug
    from public.org_agents
    where org_id = p_org_id and status = 'active'
  ),
  privileged as (
    select exists (
      select 1 from public.memberships
      where user_id = p_user_id
        and org_id = p_org_id
        and org_role in ('owner', 'admin')
    ) as ok
  ),
  effective as (
    -- owners/admins implicitly hold every active org agent
    select a.agent_slug from active a, privileged where privileged.ok
    union
    -- direct seat assigned to the user
    select aa.agent_slug
    from public.agent_assignments aa
    join active a on a.agent_slug = aa.agent_slug
    where aa.org_id = p_org_id and aa.user_id = p_user_id
    union
    -- granted via a team the user belongs to
    select ta.agent_slug
    from public.team_agents ta
    join public.team_members tm on tm.team_id = ta.team_id
    join public.teams t on t.id = ta.team_id
    join active a on a.agent_slug = ta.agent_slug
    where t.org_id = p_org_id and tm.user_id = p_user_id
  )
  select coalesce(
    (select array_agg(distinct agent_slug order by agent_slug) from effective),
    '{}'::text[]
  );
$$;

grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;
grant execute on function public.effective_agent_slugs(uuid, uuid)
  to authenticated, supabase_auth_admin;

-- ---------------------------------------------------------------------------
-- Re-point the original admin-write policies (0002) at is_org_admin so the new
-- 'owner' role is also treated as privileged. Without this, an org owner could
-- not manage their own org / memberships / agents via the authenticated client.
-- ---------------------------------------------------------------------------
drop policy if exists organizations_update on public.organizations;
create policy organizations_update on public.organizations
  for update to authenticated
  using (public.is_org_admin(id))
  with check (public.is_org_admin(id));

drop policy if exists memberships_admin_write on public.memberships;
create policy memberships_admin_write on public.memberships
  for all to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

drop policy if exists org_agents_admin_write on public.org_agents;
create policy org_agents_admin_write on public.org_agents
  for all to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

-- ---------------------------------------------------------------------------
-- RLS for the new tables. Members read within their org; admins/owners manage.
-- The access-token hook reads agents through effective_agent_slugs() (SECURITY
-- DEFINER), so these tables do not need a supabase_auth_admin policy.
-- ---------------------------------------------------------------------------
alter table public.teams             enable row level security;
alter table public.team_members      enable row level security;
alter table public.team_agents       enable row level security;
alter table public.agent_assignments enable row level security;

-- teams
drop policy if exists teams_select on public.teams;
create policy teams_select on public.teams
  for select to authenticated
  using (public.is_org_member(org_id));

drop policy if exists teams_admin_write on public.teams;
create policy teams_admin_write on public.teams
  for all to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

-- team_members (org context resolved via the parent team)
drop policy if exists team_members_select on public.team_members;
create policy team_members_select on public.team_members
  for select to authenticated
  using (
    exists (
      select 1 from public.teams t
      where t.id = team_id and public.is_org_member(t.org_id)
    )
  );

drop policy if exists team_members_admin_write on public.team_members;
create policy team_members_admin_write on public.team_members
  for all to authenticated
  using (
    exists (
      select 1 from public.teams t
      where t.id = team_id and public.is_org_admin(t.org_id)
    )
  )
  with check (
    exists (
      select 1 from public.teams t
      where t.id = team_id and public.is_org_admin(t.org_id)
    )
  );

-- team_agents
drop policy if exists team_agents_select on public.team_agents;
create policy team_agents_select on public.team_agents
  for select to authenticated
  using (
    exists (
      select 1 from public.teams t
      where t.id = team_id and public.is_org_member(t.org_id)
    )
  );

drop policy if exists team_agents_admin_write on public.team_agents;
create policy team_agents_admin_write on public.team_agents
  for all to authenticated
  using (
    exists (
      select 1 from public.teams t
      where t.id = team_id and public.is_org_admin(t.org_id)
    )
  )
  with check (
    exists (
      select 1 from public.teams t
      where t.id = team_id and public.is_org_admin(t.org_id)
    )
  );

-- agent_assignments
drop policy if exists agent_assignments_select on public.agent_assignments;
create policy agent_assignments_select on public.agent_assignments
  for select to authenticated
  using (public.is_org_member(org_id));

drop policy if exists agent_assignments_admin_write on public.agent_assignments;
create policy agent_assignments_admin_write on public.agent_assignments
  for all to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));
