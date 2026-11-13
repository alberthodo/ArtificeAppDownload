#!/bin/zsh
# Artifice's own checkout (tryartifice.com/checkout) and billing in the app:
# the database column, the Stripe publishable key (public), and the functions.
# Run it yourself:  supabase/scripts/deploy-own-checkout.sh
set -e
cd "$(dirname "$0")/../.."
REF=zfsvffszirpiracrwegw
PK=pk_test_51UbPXxCvrm5GlsutdnwEKOk1Y87eC0SctSCOTLbjVse5ojecJyyXp3HJa9LJfbWaRofUiUih6RUWlneYzkrWyyCw00nN9K4pwF
echo "1/3 Database: the publishable key column, and the sandbox key"
supabase db query --remote --yes -f supabase/migrations/20261113010000_stripe_publishable_key.sql >/dev/null
supabase db query --remote --yes "update plans_config set stripe_publishable_key = '$PK'" >/dev/null
echo "2/3 Functions (shared code changed: all plan functions)"
supabase functions deploy entitlement checkout billing redeem-code student-start student-verify devices --yes --project-ref $REF
supabase functions deploy pay stripe-webhook --no-verify-jwt --yes --project-ref $REF
echo "3/3 Done. The checkout page itself goes live when the website is deployed (Vercel)."
