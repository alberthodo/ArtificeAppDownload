-- The Stripe publishable key our payment page (tryartifice.com/checkout) uses
-- for Stripe's card fields. Public by design; kept here so the site needs no
-- extra setting, and test and live switch in one place.
alter table public.plans_config add column if not exists stripe_publishable_key text;
