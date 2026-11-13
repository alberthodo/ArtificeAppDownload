// Starts paying for Pro: returns a link to Artifice's own payment page
// (tryartifice.com/checkout), signed for this person for 30 minutes. The page
// shows Stripe's card fields and talks to the `pay` function; the
// stripe-webhook function turns the payment into the plan.
//
// Tax: Stripe's automatic tax needs Stripe Tax set up (head office address and
// registrations). It's on when STRIPE_AUTOMATIC_TAX=1 (used by `pay`).
//
// Deploy: supabase functions deploy checkout
import { admin, config, ensureEntitlement, paying, payLink, priceFor, who, reply, fail } from "../_shared/plans.ts";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const db = admin();
  const user = await who(req, db);
  if (!user) return fail("Sign in to Artifice again.", 401);
  const { period, purpose } = await req.json().catch(() => ({}));
  const [cfg, e] = await Promise.all([config(db), ensureEntitlement(db, user.id)]);
  if (purpose === "card") {
    if (!e.stripe_customer) return fail("There's no billing for this account yet.", 404);
    return reply({ url: await payLink(user.id, "card") });
  }
  if (paying(e)) return fail("You already have Pro. Manage it in Account › Plan.", 409);
  if (!priceFor(cfg, e, period === "yearly" ? "yearly" : "monthly").price || !cfg.stripe_publishable_key) return fail("Paying for Pro isn't open yet.", 503);
  return reply({ url: await payLink(user.id, "checkout", period === "yearly" ? "yearly" : "monthly") });
});
