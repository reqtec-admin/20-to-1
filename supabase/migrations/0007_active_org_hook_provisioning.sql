-- Active-org switching, scale-aware token hook, and richer provisioning.

-- ---------------------------------------------------------------------------
-- Switch the caller's active org (the one reflected in their JWT). Two
-- statements avoid a transient violation of the one-default-per-user index.
-- ---------------------------------------------------------------------------
create or replace function public.set_active_org(p_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;
  if not exists (
    select 1 from public.memberships where user_id = v_user and org_id = p_org_id
  ) then
    raise exception 'not a member of this organization';
  end if;

  update public.memberships set is_default = false
  where user_id = v_user and is_default;

  update public.memberships set is_default = true
  where user_id = v_user and org_id = p_org_id;
end;
$$;

revoke execute on function public.set_active_org(uuid) from anon, public;
grant execute on function public.set_active_org(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Access-token hook: reflect the user's ACTIVE org and only the agents that
-- user can actually use (per-seat / per-team), not every org agent.
-- ---------------------------------------------------------------------------
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

  -- Prefer the user's active/default org, else their earliest membership.
  select org_id, org_role
    into v_org_id, v_org_role
  from public.memberships
  where user_id = v_user_id
  order by is_default desc, created_at asc
  limit 1;

  if v_org_id is not null then
    v_agents := coalesce(
      to_jsonb(public.effective_agent_slugs(v_user_id, v_org_id)),
      '[]'::jsonb
    );
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

-- ---------------------------------------------------------------------------
-- Provisioning: first purchase makes the buyer the org OWNER with an active
-- org; agents are upserted with seats and the buyer gets a seat on each.
-- Signature is unchanged so the existing /api/checkout route keeps working;
-- each agent object may now optionally include "seats".
-- ---------------------------------------------------------------------------
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
  v_seats   integer;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  -- Reuse only an org the buyer actually controls. A user who was auto-joined
  -- to a corporate org via SSO (as a member) gets their own personal org for a
  -- self-serve purchase instead of provisioning onto the corporation.
  select org_id into v_org_id
  from public.memberships
  where user_id = v_user_id and org_role in ('owner', 'admin')
  order by is_default desc, created_at asc
  limit 1;

  if v_org_id is null then
    insert into public.organizations (name, created_by)
    values (coalesce(nullif(trim(p_org_name), ''), 'My Organization'), v_user_id)
    returning id into v_org_id;

    -- First org becomes the user's active org only if they don't already have one.
    insert into public.memberships (user_id, org_id, org_role, is_default)
    values (
      v_user_id,
      v_org_id,
      'owner',
      not exists (
        select 1 from public.memberships
        where user_id = v_user_id and is_default
      )
    );
  end if;

  for v_agent in select * from jsonb_array_elements(coalesce(p_agents, '[]'::jsonb))
  loop
    v_slug  := v_agent ->> 'slug';
    v_plan  := coalesce(v_agent ->> 'plan', 'standard');
    v_seats := nullif(v_agent ->> 'seats', '')::integer;
    if v_slug is null or trim(v_slug) = '' then
      continue;
    end if;
    if v_plan not in ('standard', 'advanced', 'premium') then
      v_plan := 'standard';
    end if;

    insert into public.org_agents (org_id, agent_slug, plan, status, seats)
    values (v_org_id, v_slug, v_plan, 'active', v_seats)
    on conflict (org_id, agent_slug)
    do update set
      plan = excluded.plan,
      status = 'active',
      seats = coalesce(excluded.seats, org_agents.seats),
      updated_at = now();

    -- The buyer consumes a seat on what they purchased.
    insert into public.agent_assignments (org_id, agent_slug, user_id)
    values (v_org_id, v_slug, v_user_id)
    on conflict do nothing;
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
