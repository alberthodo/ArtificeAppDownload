// Stripe tells Artifice about payments here; each one updates the person's
// plan. Signature-checked, and each event is applied once.
//
// Deploy (Stripe calls it without a Supabase token):
//   supabase functions deploy stripe-webhook --no-verify-jwt
// Then in Stripe › Developers › Webhooks, point an endpoint at
//   https://<project>.supabase.co/functions/v1/stripe-webhook
// for: checkout.session.completed, customer.subscription.created,
// customer.subscription.updated, customer.subscription.deleted,
// invoice.paid, invoice.payment_failed. Put its signing secret in
// STRIPE_WEBHOOK_SECRET.
import { admin, applySubscription, stripe, stripeSignatureOk } from "../_shared/plans.ts";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const payload = await req.text();
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
  if (!secret || !(await stripeSignatureOk(payload, req.headers.get("stripe-signature"), secret))) {
    return new Response("bad signature", { status: 400 });
  }
  const event = JSON.parse(payload);
  const db = admin();
  // applied before? (Stripe retries until it gets a 2xx)
  const { error: dup } = await db.from("stripe_events").insert({ id: event.id, type: event.type });
  if (dup) return new Response("already applied", { status: 200 });

  try {
    const o = event.data.object;
    switch (event.type) {
      case "checkout.session.completed":
        if (o.mode === "subscription" && o.subscription) {
          const sub = await stripe("GET", `subscriptions/${o.subscription}`);
          await applySubscription(db, sub, o.client_reference_id ?? sub.metadata?.user_id);
          payment(o.client_reference_id, "plan_started");
        }
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await applySubscription(db, o);
        break;
      case "invoice.paid":
      case "invoice.payment_failed": {
        const subId = o.subscription ?? o.parent?.subscription_details?.subscription;
        if (subId) {
          const sub = await stripe("GET", `subscriptions/${subId}`);
          await applySubscription(db, sub);
          if (event.type === "invoice.payment_failed") payment(sub.metadata?.user_id, "payment_failed");
        }
        break;
      }
    }
  } catch (e) {
    // let Stripe retry: forget that this event was seen
    await db.from("stripe_events").delete().eq("id", event.id);
    console.error(event.type, e);
    // only Stripe (a signed request) gets this far: the reason shows in its delivery log
    return new Response(`failed: ${e instanceof Error ? e.message : String(e)}`.slice(0, 500), { status: 500 });
  }
  return new Response("ok", { status: 200 });
});

/** Payment events for the Plans dashboard (PostHog), filed under the person. */
function payment(userId: string | undefined, name: string) {
  const key = Deno.env.get("POSTHOG_PROJECT_API_KEY");
  if (!key || !userId) return;
  const host = (Deno.env.get("POSTHOG_INGEST_HOST") ?? "https://eu.i.posthog.com").replace(/\/+$/, "");
  fetch(`${host}/capture/`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ api_key: key, event: name, distinct_id: userId, properties: { plan: "pro", source: "stripe", $lib: "artifice-server" } }),
  }).catch(() => {});
}
