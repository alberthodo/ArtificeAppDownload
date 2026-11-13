// The Stripe Customer Portal: change card, see invoices, switch monthly and
// yearly, cancel (at the end of the period).
//
// Deploy: supabase functions deploy billing-portal
import { admin, entitlement, siteUrl, stripe, who, reply, fail } from "../_shared/plans.ts";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const db = admin();
  const user = await who(req, db);
  if (!user) return fail("Sign in to Artifice again.", 401);
  const e = await entitlement(db, user.id);
  if (!e?.stripe_customer) return fail("There's no billing for this account yet.", 404);
  const s = await stripe("POST", "billing_portal/sessions", { customer: e.stripe_customer, return_url: `${siteUrl()}/pricing` });
  return reply({ url: s.url });
});
