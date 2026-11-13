// A Stripe Checkout page for Pro. The app opens the URL in the browser; the
// stripe-webhook function turns the payment into the plan.
//
// Deploy: supabase functions deploy checkout
import { admin, config, ensureEntitlement, paying, siteUrl, stripe, who, reply, fail } from "../_shared/plans.ts";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const db = admin();
  const user = await who(req, db);
  if (!user) return fail("Sign in to Artifice again.", 401);
  const { period } = await req.json().catch(() => ({}));
  const [cfg, e] = await Promise.all([config(db), ensureEntitlement(db, user.id)]);
  if (paying(e)) return fail("You already have Pro. Use Manage billing to change it.", 409);

  const price = period === "yearly" ? cfg.price_yearly : e.founding && cfg.price_founding_monthly ? cfg.price_founding_monthly : cfg.price_monthly;
  if (!price) return fail("Paying for Pro isn't open yet.", 503);

  let customer = e.stripe_customer;
  if (!customer) {
    const c = await stripe("POST", "customers", { email: user.email ?? undefined, "metadata[user_id]": user.id });
    customer = c.id as string;
    await db.from("entitlements").update({ stripe_customer: customer }).eq("user_id", user.id);
  }
  const site = siteUrl();
  const session = await stripe("POST", "checkout/sessions", {
    mode: "subscription",
    customer,
    client_reference_id: user.id,
    "line_items[0][price]": price,
    "line_items[0][quantity]": 1,
    "subscription_data[metadata][user_id]": user.id,
    "automatic_tax[enabled]": true,
    "customer_update[address]": "auto",
    "discounts[0][coupon]": e.discount_coupon ?? undefined,
    allow_promotion_codes: e.discount_coupon ? undefined : true,
    success_url: `${site}/pricing/thanks`,
    cancel_url: `${site}/pricing`,
  });
  return reply({ url: session.url });
});
