-- Paid plans: the trial, Pro, student and access-code plans
-- (simpleAI/planning/Artifice paid plans spec.md).
--
-- Only the edge functions (service role) write these tables. A signed-in
-- person can read their own plan, redemptions and computers; nobody can read
-- codes, other people's rows or the config through the public API.

create table if not exists public.plans_config (
  id boolean primary key default true check (id),           -- one row
  trial_days int not null default 14,
  offline_grace_days int not null default 14,
  payment_grace_days int not null default 7,
  devices_per_person int not null default 3,
  student_years int not null default 1,
  -- Stripe price ids (test or live) and how each reads in the app
  price_monthly text, price_yearly text, price_founding_monthly text,
  label_monthly text not null default '$5.99 a month',
  label_yearly text not null default '$59 a year',
  label_founding_monthly text not null default '$3.99 a month',
  -- before this moment, trials have no end (plans announced, not yet charged)
  charging_starts_at timestamptz
);
insert into public.plans_config (id) values (true) on conflict do nothing;

create table if not exists public.entitlements (
  user_id uuid primary key references auth.users on delete cascade,
  plan text not null check (plan in ('trial', 'pro', 'student', 'code', 'team', 'enterprise', 'none')),
  source text,                         -- trial | stripe | student | founding | code:<label>
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'ended')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,                 -- null = no end
  renews boolean,
  price_label text,
  founding boolean not null default false,   -- may buy Pro at the founding price
  discount_coupon text,                -- a Stripe coupon from a discount code, used at checkout
  stripe_customer text,
  stripe_subscription text unique,
  updated_at timestamptz not null default now()
);

create table if not exists public.codes (
  code text primary key,               -- ARTF-XXXX-XXXX, unambiguous letters
  label text not null,                 -- shows in analytics: "cwd-pilot", "launch-week"
  kind text not null check (kind in ('free_time', 'discount')),
  months int,                          -- free_time: null = no end
  discount_pct int check (discount_pct between 1 and 100),
  stripe_coupon text,                  -- discount: the Stripe coupon to apply at checkout
  max_uses int not null default 1,
  uses int not null default 0,
  redeem_by timestamptz,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.redemptions (
  code text references public.codes on delete cascade,
  user_id uuid references auth.users on delete cascade,
  at timestamptz not null default now(),
  primary key (code, user_id)
);

create table if not exists public.student_checks (
  user_id uuid primary key references auth.users on delete cascade,
  domain text,                         -- kept after the check
  school_email text,                   -- deleted once verified
  code_hash text, code_expires timestamptz, attempts int not null default 0,
  sent_at timestamptz,
  verified_at timestamptz, next_check timestamptz
);

create table if not exists public.school_domains (
  domain text primary key,             -- e.g. stanford.edu, ox.ac.uk
  name text,
  added_at timestamptz not null default now()
);

create table if not exists public.devices (
  user_id uuid references auth.users on delete cascade,
  device_id text,
  name text, os text,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  primary key (user_id, device_id)
);

-- Stripe sends an event more than once sometimes: each is applied once.
create table if not exists public.stripe_events (
  id text primary key,
  type text,
  at timestamptz not null default now()
);

alter table public.plans_config enable row level security;
alter table public.entitlements enable row level security;
alter table public.codes enable row level security;
alter table public.redemptions enable row level security;
alter table public.student_checks enable row level security;
alter table public.school_domains enable row level security;
alter table public.devices enable row level security;
alter table public.stripe_events enable row level security;

drop policy if exists "own plan" on public.entitlements;
create policy "own plan" on public.entitlements for select using (auth.uid() = user_id);
drop policy if exists "own redemptions" on public.redemptions;
create policy "own redemptions" on public.redemptions for select using (auth.uid() = user_id);
drop policy if exists "own devices" on public.devices;
create policy "own devices" on public.devices for select using (auth.uid() = user_id);
-- no policies on plans_config, codes, student_checks, school_domains,
-- stripe_events: only the service role reads them

-- Redeem a code in one transaction: the code row is locked, so two people
-- can't take its last use at once. Returns the code row, or raises with a
-- message the app shows.
create or replace function public.take_code(p_code text, p_user uuid)
returns public.codes
language plpgsql security definer set search_path = public as $$
declare c public.codes;
begin
  select * into c from public.codes where code = upper(trim(p_code)) for update;
  if not found then raise exception 'That code doesn''t work. Check it, or ask whoever gave it to you.' using errcode = 'P0001'; end if;
  if c.redeem_by is not null and now() > c.redeem_by then raise exception 'That code has expired.' using errcode = 'P0001'; end if;
  if exists (select 1 from public.redemptions where code = c.code and user_id = p_user) then raise exception 'You''ve already used this code.' using errcode = 'P0001'; end if;
  if c.uses >= c.max_uses then raise exception 'That code has been used up.' using errcode = 'P0001'; end if;
  update public.codes set uses = uses + 1 where code = c.code returning * into c;
  insert into public.redemptions (code, user_id) values (c.code, p_user);
  return c;
end $$;
revoke all on function public.take_code(text, uuid) from public, anon, authenticated;
