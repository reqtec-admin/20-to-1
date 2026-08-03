-- Custom Access Token Hook
--
-- Projects the user's organization, functional role, and purchased agents
-- into every issued JWT, producing the token shape consumed by the app
-- middleware and the credentials broker:
--
--   {
--     "sub": "<user uuid>",
--     "email": "...",
--     "org_id": "<org uuid>",
--     "org_role": "admin",
--     "agents": ["brand-manager", "marketing-manager"]
--   }
--
-- After applying this migration, enable the hook in your Supabase project:
--   Dashboard -> Authentication -> Hooks -> Customize Access Token (JWT) Claims
--   -> select public.custom_access_token_hook
-- or in supabase/config.toml:
--   [auth.hook.custom_access_token]
--   enabled = true
--   uri = "pg-functions://postgres/public/custom_access_token_hook"

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims     jsonb;
  v_user_id  uuid;
  v_org_id   uuid;
  v_org_role text;
  v_agents   jsonb;
begin
  v_user_id := (event ->> 'user_id')::uuid;
  claims := event -> 'claims';

  -- Pick the user's primary org membership (lowest created_at).
  select m.org_id, m.org_role
    into v_org_id, v_org_role
  from public.memberships m
  where m.user_id = v_user_id
  order by m.created_at asc
  limit 1;

  if v_org_id is not null then
    select coalesce(jsonb_agg(oa.agent_slug order by oa.agent_slug), '[]'::jsonb)
      into v_agents
    from public.org_agents oa
    where oa.org_id = v_org_id
      and oa.status = 'active';

    claims := jsonb_set(claims, '{org_id}', to_jsonb(v_org_id));
    claims := jsonb_set(claims, '{org_role}', to_jsonb(v_org_role));
    claims := jsonb_set(claims, '{agents}', v_agents);
  else
    claims := jsonb_set(claims, '{agents}', '[]'::jsonb);
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- The auth admin role runs the hook; grant it the needed access.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
grant select on public.memberships to supabase_auth_admin;
grant select on public.org_agents  to supabase_auth_admin;

-- Keep the hook callable only by the auth admin.
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
