-- Founding offer for everyone with an account on announcement day
-- (planning/Artifice plans and pricing 2026-11.md, "Existing users"):
-- free until 30 days' notice + 3 months, then Pro at the founding price.
-- Run once, in the Supabase SQL editor, on the day of the announcement.
-- Accounts already paying for Pro are left as they are.
insert into public.entitlements (user_id, plan, source, status, starts_at, ends_at, founding)
select u.id, 'code', 'founding', 'active', now(), now() + interval '30 days' + interval '3 months', true
from auth.users u
on conflict (user_id) do update
  set plan = 'code', source = 'founding', status = 'active', ends_at = excluded.ends_at, founding = true, updated_at = now()
  where public.entitlements.source is distinct from 'stripe';

-- Then set when trials start counting down (same moment the founding period's notice starts, or later):
-- update public.plans_config set charging_starts_at = now() + interval '30 days';
