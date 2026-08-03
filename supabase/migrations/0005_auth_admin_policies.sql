-- Let the access-token hook read what it needs under RLS.
--
-- The custom access token hook runs as the `supabase_auth_admin` role. RLS
-- applies to that role too, and a GRANT is NOT a policy: without a permissive
-- SELECT policy the hook reads zero rows, so `org_id` and `agents` come back
-- empty on every token. These policies fix that. (This matches Supabase's
-- official custom-claims / RBAC guidance.)
--
-- `supabase_auth_admin` is internal to GoTrue and is not reachable from the
-- anon/authenticated Data API, so `using (true)` here does not widen tenant
-- exposure to end users.

drop policy if exists auth_admin_read_memberships on public.memberships;
create policy auth_admin_read_memberships
  on public.memberships
  as permissive
  for select
  to supabase_auth_admin
  using (true);

drop policy if exists auth_admin_read_org_agents on public.org_agents;
create policy auth_admin_read_org_agents
  on public.org_agents
  as permissive
  for select
  to supabase_auth_admin
  using (true);
