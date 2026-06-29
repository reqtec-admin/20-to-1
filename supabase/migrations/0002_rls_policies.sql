-- Row Level Security: tenant isolation enforced in the database.
--
-- A user can only ever read/write rows for organizations they belong to.
-- Admin-only mutations are gated by org_role. Writes that provision new orgs
-- or grant agents go through the SECURITY DEFINER RPC in 0004 (service path),
-- so the policies here stay deliberately tight for the normal authenticated
-- (anon-key) client.

alter table public.organizations enable row level security;
alter table public.memberships   enable row level security;
alter table public.org_agents     enable row level security;

-- organizations ------------------------------------------------------------
drop policy if exists organizations_select on public.organizations;
create policy organizations_select
  on public.organizations
  for select
  to authenticated
  using (id in (select public.current_user_org_ids()));

drop policy if exists organizations_update on public.organizations;
create policy organizations_update
  on public.organizations
  for update
  to authenticated
  using (
    id in (
      select org_id from public.memberships
      where user_id = auth.uid() and org_role = 'admin'
    )
  );

-- memberships ----------------------------------------------------------------
drop policy if exists memberships_select on public.memberships;
create policy memberships_select
  on public.memberships
  for select
  to authenticated
  using (org_id in (select public.current_user_org_ids()));

drop policy if exists memberships_admin_write on public.memberships;
create policy memberships_admin_write
  on public.memberships
  for all
  to authenticated
  using (
    org_id in (
      select org_id from public.memberships
      where user_id = auth.uid() and org_role = 'admin'
    )
  )
  with check (
    org_id in (
      select org_id from public.memberships
      where user_id = auth.uid() and org_role = 'admin'
    )
  );

-- org_agents -----------------------------------------------------------------
-- Read for any member; mutations restricted to admins. (Checkout provisioning
-- uses the SECURITY DEFINER RPC, which bypasses these for the grant step.)
drop policy if exists org_agents_select on public.org_agents;
create policy org_agents_select
  on public.org_agents
  for select
  to authenticated
  using (org_id in (select public.current_user_org_ids()));

drop policy if exists org_agents_admin_write on public.org_agents;
create policy org_agents_admin_write
  on public.org_agents
  for all
  to authenticated
  using (
    org_id in (
      select org_id from public.memberships
      where user_id = auth.uid() and org_role = 'admin'
    )
  )
  with check (
    org_id in (
      select org_id from public.memberships
      where user_id = auth.uid() and org_role = 'admin'
    )
  );
