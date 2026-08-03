-- Checkout provisioning
--
-- Called once payment is confirmed. Idempotently ensures the buyer has an
-- organization (creating one + an admin membership on first purchase) and
-- grants the purchased agents. Runs as SECURITY DEFINER so a normal
-- authenticated client can complete provisioning without broad table grants,
-- while still being scoped to the calling user (auth.uid()).

create or replace function public.provision_checkout(
  p_org_name text,
  p_agents   jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_id  uuid;
  v_agent   jsonb;
  v_slug    text;
  v_plan    text;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  -- Reuse the user's existing primary org, otherwise create one.
  select org_id into v_org_id
  from public.memberships
  where user_id = v_user_id
  order by created_at asc
  limit 1;

  if v_org_id is null then
    insert into public.organizations (name, created_by)
    values (coalesce(nullif(trim(p_org_name), ''), 'My Organization'), v_user_id)
    returning id into v_org_id;

    insert into public.memberships (user_id, org_id, org_role)
    values (v_user_id, v_org_id, 'admin');
  end if;

  -- Grant each purchased agent. p_agents is an array of objects:
  --   [{ "slug": "brand-manager", "plan": "standard" }, ...]
  for v_agent in select * from jsonb_array_elements(coalesce(p_agents, '[]'::jsonb))
  loop
    v_slug := v_agent ->> 'slug';
    v_plan := coalesce(v_agent ->> 'plan', 'standard');
    if v_slug is null or trim(v_slug) = '' then
      continue;
    end if;
    if v_plan not in ('standard', 'advanced', 'premium') then
      v_plan := 'standard';
    end if;

    insert into public.org_agents (org_id, agent_slug, plan, status)
    values (v_org_id, v_slug, v_plan, 'active')
    on conflict (org_id, agent_slug)
    do update set plan = excluded.plan, status = 'active', updated_at = now();
  end loop;

  return jsonb_build_object(
    'org_id', v_org_id,
    'agents', (
      select coalesce(jsonb_agg(agent_slug order by agent_slug), '[]'::jsonb)
      from public.org_agents
      where org_id = v_org_id and status = 'active'
    )
  );
end;
$$;

revoke execute on function public.provision_checkout(text, jsonb) from anon, public;
grant execute on function public.provision_checkout(text, jsonb) to authenticated;
