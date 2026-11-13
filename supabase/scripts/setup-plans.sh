#!/bin/zsh
# Paid plans: set the Supabase secrets and deploy the plan functions
# (simpleAI/planning/Artifice paid plans setup.md, steps 1, 3 and 4).
# Run it yourself, in your own terminal:  supabase/scripts/setup-plans.sh
# Secret keys are typed or pasted at hidden prompts; nothing secret is printed.
set -e
cd "$(dirname "$0")/../.."
REF=zfsvffszirpiracrwegw

echo "1/5 Linking this folder to the Supabase project ($REF)…"
supabase link --project-ref $REF

have() { supabase secrets list --project-ref $REF 2>/dev/null | grep -q "\"$1\""; }

echo "2/5 The plan signing key…"
if have PLAN_SIGNING_KEY; then
  echo "    already set; keeping it"
else
  keys=$(node supabase/scripts/plan-key.mjs)
  priv=${${(M)${(f)keys}:#PLAN_SIGNING_KEY=*}#PLAN_SIGNING_KEY=}
  pub=${${(M)${(f)keys}:#ARTIFICE_PLAN_PUBLIC_KEY=*}#ARTIFICE_PLAN_PUBLIC_KEY=}
  supabase secrets set --yes --project-ref $REF PLAN_SIGNING_KEY="$priv" SITE_URL=https://tryartifice.com >/dev/null
  mkdir -p ~/.config/artifice && umask 077
  print -r -- "$priv" > ~/.config/artifice/plan-signing-key
  print -r -- "$pub" > ~/.config/artifice/plan-public-key
  unset priv keys
  echo "    set. The private key is also in ~/.config/artifice/plan-signing-key: put it in your password manager, then you may delete that file."
  echo "    Public key (for the app build, not secret): $pub"
fi

echo "3/5 Stripe secret key (test mode)…"
if have STRIPE_SECRET_KEY; then
  echo "    already set; keeping it (supabase secrets set STRIPE_SECRET_KEY=… to change it)"
else
  echo "    In Stripe: Developers › API keys › Secret key › Reveal, copy the sk_test_… key."
  read -rs "k?    Paste it here (hidden) and press Return: "; echo
  if [[ $k == sk_test_* ]]; then supabase secrets set --yes --project-ref $REF STRIPE_SECRET_KEY="$k" >/dev/null && echo "    set" || echo "    FAILED to set it"; else echo "    skipped: that isn't an sk_test_ key"; fi
  unset k
fi

echo "4/5 PostHog project key (public, for payment events)…"
supabase secrets set --yes --project-ref $REF POSTHOG_PROJECT_API_KEY=phc_tWvnihuecLqBreSPLj8PmJg8aetygHmmVFXi9iXnabv6 >/dev/null && echo "    set"

echo "5/5 Deploying the functions…"
supabase functions deploy entitlement checkout billing-portal redeem-code student-start student-verify devices delete-account --yes --project-ref $REF
supabase functions deploy stripe-webhook --no-verify-jwt --yes --project-ref $REF

echo
echo "Done. Still to do: the Stripe webhook (then STRIPE_WEBHOOK_SECRET), and RESEND_API_KEY when student checks open."
