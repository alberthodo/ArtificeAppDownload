// Billing in Artifice's own Account › Plan (no Stripe pages):
//
//   summary  → price, renewal or end date, the card on file, the last invoices
//   cancel   → Pro stops at the end of the paid period (no refund, no renewal)
//   resume   → undoes a cancel before the period ends
//   switch   {period}  → monthly ⇄ yearly (Stripe credits the unused time)
//
// Changes return a fresh signed plan too, so the app updates at once (the
// stripe-webhook function also records them). A new card goes through our
// payment page: `checkout` with {purpose: "card"}.
//
// Deploy: supabase functions deploy billing
import { admin, applySubscription, config, entitlement, priceFor, stripe, token, who, reply, fail } from "../_shared/plans.ts";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const db = admin();
  const user = await who(req, db);
  if (!user) return fail("Sign in to Artifice again.", 401);
  const body = await req.json().catch(() => ({}));
  const e = await entitlement(db, user.id);
  if (!e?.stripe_subscription) return fail("There's no Pro subscription on this account.", 404);
  try {
    const sid = e.stripe_subscription;
    if (body.action === "cancel" || body.action === "resume") {
      const sub = await stripe("POST", `subscriptions/${sid}`, { cancel_at_period_end: body.action === "cancel" });
      await applySubscription(db, sub, user.id);
    } else if (body.action === "switch") {
      const cfg = await config(db);
      const { price } = priceFor(cfg, e, body.period === "yearly" ? "yearly" : "monthly");
      const sub = await stripe("GET", `subscriptions/${sid}`);
      const item = sub.items?.data?.[0];
      if (!price || !item) return fail("That plan isn't available.", 400);
      if (item.price?.id !== price) {
        const next = await stripe("POST", `subscriptions/${sid}`, {
          "items[0][id]": item.id,
          "items[0][price]": price,
          proration_behavior: "always_invoice",
          cancel_at_period_end: false,
        });
        await applySubscription(db, next, user.id);
      }
    } else if (body.action !== "summary") {
      return fail("Unknown billing action.", 400);
    }
    return reply({ ...(await summary(sid, e.stripe_customer)), token: await token(db, user.id) });
  } catch (err) {
    console.error("billing", body.action, err);
    return fail("Billing couldn't be reached right now. Try again in a moment, or email support@tryartifice.com.", 502);
  }
});

async function summary(sid: string, customer: string | null) {
  const [sub, invoices] = await Promise.all([
    stripe("GET", `subscriptions/${sid}`, { "expand[0]": "default_payment_method" }),
    customer ? stripe("GET", "invoices", { customer, limit: 12 }) : Promise.resolve({ data: [] }),
  ]);
  let pm = sub.default_payment_method;
  if (!pm && customer) {
    const c = await stripe("GET", `customers/${customer}`, { "expand[0]": "invoice_settings.default_payment_method" });
    pm = c.invoice_settings?.default_payment_method;
  }
  const item = sub.items?.data?.[0];
  const card = pm?.card ? { brand: pm.card.brand, last4: pm.card.last4, exp_month: pm.card.exp_month, exp_year: pm.card.exp_year } : pm?.type ? { brand: pm.type, last4: null } : null;
  return {
    status: sub.status,
    period: item?.price?.recurring?.interval === "year" ? "yearly" : "monthly",
    amount: item?.price?.unit_amount ?? null,
    currency: item?.price?.currency ?? "usd",
    period_end: item?.current_period_end ?? sub.current_period_end ?? null,
    cancel_at_period_end: !!sub.cancel_at_period_end,
    card,
    invoices: (invoices.data ?? [])
      .filter((i: any) => i.status !== "draft" && i.amount_due > 0 || i.status === "paid")
      .map((i: any) => ({ id: i.id, date: i.created, total: i.total, currency: i.currency, status: i.status, url: i.hosted_invoice_url, pdf: i.invoice_pdf })),
  };
}
