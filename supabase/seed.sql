-- Seed data for permission / entitlement testing.
--
-- Shared password for every seeded account:  Test1234!
-- Re-runnable: deletes known seed rows first, then recreates them.
--
-- Apply:
--   Local:   supabase db reset
--   Remote:  npx supabase@latest db query --linked -f supabase/seed.sql
--            (or paste into the Supabase SQL editor)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Fixed ids (stable across re-seeds)
-- ---------------------------------------------------------------------------
-- Orgs
--   11111111-1111-4111-8111-111111111111  Acme Corp (teams + seats)
--   22222222-2222-4222-8222-222222222222  Solo Studio (solo buyer)
--
-- Users
--   a0000000-0000-4000-8000-000000000001  owner@acme.test
--   a0000000-0000-4000-8000-000000000002  admin@acme.test
--   a0000000-0000-4000-8000-000000000003  brand@acme.test
--   a0000000-0000-4000-8000-000000000004  marketing@acme.test
--   a0000000-0000-4000-8000-000000000005  seat@acme.test
--   a0000000-0000-4000-8000-000000000006  billing@acme.test
--   a0000000-0000-4000-8000-000000000007  member@acme.test
--   a0000000-0000-4000-8000-000000000008  solo@studio.test
--   a0000000-0000-4000-8000-000000000009  multi@test.dev
--
-- Teams
--   b0000000-0000-4000-8000-000000000001  Brand
--   b0000000-0000-4000-8000-000000000002  Marketing

-- ---------------------------------------------------------------------------
-- Tear down previous seed (orgs cascade teams/agents/memberships/assignments)
-- ---------------------------------------------------------------------------
delete from public.organizations
where id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222'
);

delete from auth.users
where id in (
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000003',
  'a0000000-0000-4000-8000-000000000004',
  'a0000000-0000-4000-8000-000000000005',
  'a0000000-0000-4000-8000-000000000006',
  'a0000000-0000-4000-8000-000000000007',
  'a0000000-0000-4000-8000-000000000008',
  'a0000000-0000-4000-8000-000000000009'
);

-- ---------------------------------------------------------------------------
-- Helper: create a confirmed email/password user GoTrue can sign in
-- ---------------------------------------------------------------------------
create or replace function public._seed_user(
  p_id uuid,
  p_email text,
  p_password text,
  p_full_name text
)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) values (
    '00000000-0000-0000-0000-000000000000',
    p_id,
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    p_id,
    jsonb_build_object(
      'sub', p_id::text,
      'email', p_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    p_id::text,
    now(),
    now(),
    now()
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Users (password = Test1234!)
-- ---------------------------------------------------------------------------
select public._seed_user('a0000000-0000-4000-8000-000000000001', 'owner@acme.test',     'Test1234!', 'Acme Owner');
select public._seed_user('a0000000-0000-4000-8000-000000000002', 'admin@acme.test',     'Test1234!', 'Acme Admin');
select public._seed_user('a0000000-0000-4000-8000-000000000003', 'brand@acme.test',     'Test1234!', 'Brand Member');
select public._seed_user('a0000000-0000-4000-8000-000000000004', 'marketing@acme.test', 'Test1234!', 'Marketing Member');
select public._seed_user('a0000000-0000-4000-8000-000000000005', 'seat@acme.test',      'Test1234!', 'Seat Only');
select public._seed_user('a0000000-0000-4000-8000-000000000006', 'billing@acme.test',   'Test1234!', 'Billing Contact');
select public._seed_user('a0000000-0000-4000-8000-000000000007', 'member@acme.test',    'Test1234!', 'Plain Member');
select public._seed_user('a0000000-0000-4000-8000-000000000008', 'solo@studio.test',    'Test1234!', 'Solo Buyer');
select public._seed_user('a0000000-0000-4000-8000-000000000009', 'multi@test.dev',      'Test1234!', 'Multi-Org User');

-- ---------------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------------
insert into public.organizations (id, name, slug, created_by) values
  (
    '11111111-1111-4111-8111-111111111111',
    'Acme Corp',
    'acme-corp',
    'a0000000-0000-4000-8000-000000000001'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Solo Studio',
    'solo-studio',
    'a0000000-0000-4000-8000-000000000008'
  );

-- ---------------------------------------------------------------------------
-- Memberships
-- ---------------------------------------------------------------------------
insert into public.memberships (user_id, org_id, org_role, is_default) values
  -- Acme
  ('a0000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'owner',   true),
  ('a0000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'admin',   true),
  ('a0000000-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'member',  true),
  ('a0000000-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'member',  true),
  ('a0000000-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'member',  true),
  ('a0000000-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', 'billing', true),
  ('a0000000-0000-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111', 'member',  true),
  -- Solo
  ('a0000000-0000-4000-8000-000000000008', '22222222-2222-4222-8222-222222222222', 'owner',   true),
  -- Multi-org: Acme is active; Solo is secondary (switch via set_active_org)
  ('a0000000-0000-4000-8000-000000000009', '11111111-1111-4111-8111-111111111111', 'member',  true),
  ('a0000000-0000-4000-8000-000000000009', '22222222-2222-4222-8222-222222222222', 'member',  false);

-- ---------------------------------------------------------------------------
-- Org agent licenses (Acme: corporate catalog with seat caps)
-- ---------------------------------------------------------------------------
insert into public.org_agents (org_id, agent_slug, plan, status, seats) values
  ('11111111-1111-4111-8111-111111111111', 'brand-manager',          'standard', 'active', 5),
  ('11111111-1111-4111-8111-111111111111', 'content-strategist',     'standard', 'active', 5),
  ('11111111-1111-4111-8111-111111111111', 'marketing-manager',      'standard', 'active', 5),
  ('11111111-1111-4111-8111-111111111111', 'social-media-manager',   'standard', 'active', 5),
  ('11111111-1111-4111-8111-111111111111', 'product-manager',        'advanced', 'active', 3),
  ('11111111-1111-4111-8111-111111111111', 'project-manager',        'standard', 'active', 3),
  ('11111111-1111-4111-8111-111111111111', 'executive-assistant',    'premium',  'active', null),
  -- paused agent: never appears in anyone's JWT
  ('11111111-1111-4111-8111-111111111111', 'seo-specialist',         'standard', 'paused', 2),
  -- Solo Studio licenses
  ('22222222-2222-4222-8222-222222222222', 'real-estate-assistant',  'standard', 'active', null),
  ('22222222-2222-4222-8222-222222222222', 'roofing-company-assistant', 'standard', 'active', null);

-- ---------------------------------------------------------------------------
-- Teams + team agent grants
-- ---------------------------------------------------------------------------
insert into public.teams (id, org_id, name, slug) values
  ('b0000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Brand',     'brand'),
  ('b0000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'Marketing', 'marketing');

insert into public.team_agents (team_id, agent_slug) values
  ('b0000000-0000-4000-8000-000000000001', 'brand-manager'),
  ('b0000000-0000-4000-8000-000000000001', 'content-strategist'),
  ('b0000000-0000-4000-8000-000000000002', 'marketing-manager'),
  ('b0000000-0000-4000-8000-000000000002', 'social-media-manager');

insert into public.team_members (team_id, user_id) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003'), -- brand@
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000004'), -- marketing@
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000009'); -- multi@ also on Brand

-- ---------------------------------------------------------------------------
-- Direct seat assignments
-- ---------------------------------------------------------------------------
insert into public.agent_assignments (org_id, agent_slug, user_id) values
  -- seat@ gets only project-manager (no team membership)
  ('11111111-1111-4111-8111-111111111111', 'project-manager', 'a0000000-0000-4000-8000-000000000005'),
  -- multi@ also gets a direct seat on product-manager at Acme
  ('11111111-1111-4111-8111-111111111111', 'product-manager', 'a0000000-0000-4000-8000-000000000009'),
  -- multi@ gets real-estate on Solo when that org is active
  ('22222222-2222-4222-8222-222222222222', 'real-estate-assistant', 'a0000000-0000-4000-8000-000000000009');

-- ---------------------------------------------------------------------------
-- Cleanup helper (keep seed idempotent without leaving a public function)
-- ---------------------------------------------------------------------------
drop function if exists public._seed_user(uuid, text, text, text);

-- ---------------------------------------------------------------------------
-- Expected JWT agents claim after sign-in (active org):
--
--   owner@acme.test      → ALL active Acme agents
--   admin@acme.test      → ALL active Acme agents
--   brand@acme.test      → brand-manager, content-strategist
--   marketing@acme.test  → marketing-manager, social-media-manager
--   seat@acme.test       → project-manager
--   billing@acme.test    → []
--   member@acme.test     → []
--   solo@studio.test     → ALL active Solo agents
--   multi@test.dev       → brand-manager, content-strategist, product-manager
--                          (switch to Solo via set_active_org → real-estate-assistant)
-- ---------------------------------------------------------------------------
