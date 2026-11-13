// Behind Artifice's own payment page (tryartifice.com/checkout). The page
// shows Stripe's card fields (the Payment Element), so card numbers go straight
// from the buyer to Stripe and never reach this function or our site.
//
// The page has no Supabase sign-in: it carries the signed 30-minute link the
// app asked for (`checkout` function), which says who is paying.
//
//   info       {t}                         → who, prices, publishable key, what this link may do
//   quote      {t, period, address}        → subtotal, discount, tax, total for that address
//   subscribe  {t, period, address, name}  → a client secret to confirm the first payment
//   card       {t}                         → a client secret to save a new card
//   card_done  {t, setup_intent}           → makes the new card the one Pro is charged to
//
// The stripe-webhook function turns the payment into the plan, as before.
//
// Deploy (called without a Supabase token):
//   supabase functions deploy pay --no-verify-jwt
import { admin, addressFields, automaticTax, config, ensureCustomer, ensureEntitlement, paying, priceFor, readPayLink, stripe, reply, fail } from "../_shared/plans.ts";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type, apikey, authorization",
};
const out = (r: Response) => {
  for (const [k, v] of Object.entries(CORS)) r.headers.set(k, v);
  return r;
};

const amounts = new Map<string, { amount: number; currency: string }>();
async function priceAmount(id: string) {
  if (!amounts.has(id)) {
    const p = await stripe("GET", `prices/${id}`);
    amounts.set(id, { amount: p.unit_amount, currency: p.currency });
  }
  return amounts.get(id)!;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return out(new Response(null, { status: 204 }));
  if (req.method !== "POST") return out(new Response("Method not allowed", { status: 405 }));
  const body = await req.json().catch(() => ({}));
  const link = await readPayLink(body.t);
  if (!link) return out(fail("This payment link has expired. Go back to Artifice and choose Pro again.", 401, { code: "link_expired" }));
  const db = admin();
  try {
    return out(await handle(db, link, body));
  } catch (e) {
    console.error("pay", body.action, e);
    return out(fail("Something went wrong on our side. Try again in a moment, or email support@tryartifice.com.", 502));
  }
});

async function handle(db: ReturnType<typeof admin>, link: { uid: string; p: string }, body: any): Promise<Response> {
  const [cfg, e, u] = await Promise.all([config(db), ensureEntitlement(db, link.uid), db.auth.admin.getUserById(link.uid)]);
  const email = u.data?.user?.email ?? null;
  const period = body.period === "yearly" ? "yearly" : "monthly";

  if (body.action === "info") {
    const monthly = priceFor(cfg, e, "monthly"), yearly = priceFor(cfg, e, "yearly");
    if (!monthly.price || !yearly.price || !cfg.stripe_publishable_key) return fail("Paying for Pro isn't open yet.", 503);
    const [m, y] = await Promise.all([priceAmount(monthly.price), priceAmount(yearly.price)]);
    let discount_pct: number | null = null;
    if (e.discount_coupon) discount_pct = (await stripe("GET", `coupons/${e.discount_coupon}`)).percent_off ?? null;
    return reply({
      mode: link.p, email, publishable_key: cfg.stripe_publishable_key, tax: automaticTax(), paying: paying(e), founding: e.founding, discount_pct,
      prices: { monthly: { ...m, label: monthly.label }, yearly: { ...y, label: yearly.label } },
    });
  }

  if (link.p === "checkout" && (body.action === "quote" || body.action === "subscribe")) {
    if (paying(e)) return fail("You already have Pro. Manage it in Artifice, under Account › Plan.", 409, { code: "already_pro" });
    const { price } = priceFor(cfg, e, period);
    if (!price) return fail("Paying for Pro isn't open yet.", 503);

    if (body.action === "quote") {
      const q = await stripe("POST", "invoices/create_preview", {
        ...(e.stripe_customer ? { customer: e.stripe_customer } : {}),
        ...addressFields("customer_details[address]", body.address),
        "customer_details[tax_exempt]": e.stripe_customer ? undefined : "none",
        "subscription_details[items][0][price]": price,
        "automatic_tax[enabled]": automaticTax() ? true : undefined,
        "discounts[0][coupon]": e.discount_coupon ?? undefined,
      });
      const subtotal = q.subtotal ?? 0, excl = q.total_excluding_tax ?? q.total;
      return reply({ currency: q.currency, subtotal, discount: Math.max(0, subtotal - excl), tax: Math.max(0, q.total - excl), total: q.total });
    }

    // subscribe: the customer gets the billing address (for tax and receipts),
    // and a subscription waits for its first payment, which the page confirms
    const customer = await ensureCustomer(db, e, email);
    await stripe("POST", `customers/${customer}`, {
      ...addressFields("address", body.address),
      name: typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 120) : undefined,
    });
    // an earlier attempt that was never paid: replace it
    if (e.stripe_subscription) {
      const old = await stripe("GET", `subscriptions/${e.stripe_subscription}`).catch(() => null);
      if (old && old.status === "incomplete") await stripe("DELETE", `subscriptions/${old.id}`).catch(() => null);
    }
    const sub = await stripe("POST", "subscriptions", {
      customer,
      "items[0][price]": price,
      payment_behavior: "default_incomplete",
      "payment_settings[save_default_payment_method]": "on_subscription",
      "automatic_tax[enabled]": automaticTax() ? true : undefined,
      "discounts[0][coupon]": e.discount_coupon ?? undefined,
      "metadata[user_id]": e.user_id,
      "expand[0]": "latest_invoice.confirmation_secret",
      "expand[1]": "pending_setup_intent",
    });
    await db.from("entitlements").update({ stripe_customer: customer, stripe_subscription: sub.id }).eq("user_id", e.user_id);
    const secret = sub.latest_invoice?.confirmation_secret?.client_secret;
    if (secret) return reply({ type: "payment", client_secret: secret });
    if (sub.pending_setup_intent?.client_secret) return reply({ type: "setup", client_secret: sub.pending_setup_intent.client_secret });
    return reply({ type: "none" }); // nothing to pay today (a 100% code)
  }

  if (body.action === "card") {
    if (!e.stripe_customer) return fail("There's no billing for this account yet.", 404);
    // which payment methods are offered is set in Stripe (Dashboard › Settings › Payment methods)
    const si = await stripe("POST", "setup_intents", { customer: e.stripe_customer, usage: "off_session", "automatic_payment_methods[enabled]": true, "metadata[user_id]": e.user_id });
    return reply({ type: "setup", client_secret: si.client_secret });
  }

  if (body.action === "card_done") {
    if (!e.stripe_customer || typeof body.setup_intent !== "string") return fail("Missing the new card.", 400);
    const si = await stripe("GET", `setup_intents/${body.setup_intent}`);
    if (si.customer !== e.stripe_customer || si.status !== "succeeded" || !si.payment_method) return fail("The new card wasn't saved. Try again.", 400);
    await stripe("POST", `customers/${e.stripe_customer}`, { "invoice_settings[default_payment_method]": si.payment_method });
    if (e.stripe_subscription) {
      const sub = await stripe("POST", `subscriptions/${e.stripe_subscription}`, { default_payment_method: si.payment_method, "expand[0]": "latest_invoice" });
      // a failed payment waiting: try it again with the new card now
      const inv = sub.latest_invoice;
      if (sub.status === "past_due" && inv && inv.status === "open") {
        await stripe("POST", `invoices/${inv.id}/pay`, { payment_method: si.payment_method }).catch((err) => console.error("retry", err));
      }
    }
    return reply({ ok: true });
  }

  return fail("This link can't do that.", 400);
}
