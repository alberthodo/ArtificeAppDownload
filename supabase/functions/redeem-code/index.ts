// Redeem an access code: free time (a "code" plan) or a discount used at
// checkout. 5 tries an hour per person.
//
// Deploy: supabase functions deploy redeem-code
import { admin, DAY, ensureEntitlement, paying, token, who, reply, fail } from "../_shared/plans.ts";

const tries = new Map<string, number[]>(); // per function instance; enough to slow guessing

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const db = admin();
  const user = await who(req, db);
  if (!user) return fail("Sign in to Artifice again.", 401);
  const now = Date.now();
  const recent = (tries.get(user.id) ?? []).filter((t) => now - t < 3600_000);
  if (recent.length >= 5) return fail("Too many tries. Wait an hour, then try again.", 429);
  tries.set(user.id, [...recent, now]);

  const { code } = await req.json().catch(() => ({}));
  if (typeof code !== "string" || code.trim().length < 6) return fail("That doesn't look like a code. Check it and try again.");
  const e = await ensureEntitlement(db, user.id);
  const { data: c, error } = await db.rpc("take_code", { p_code: code, p_user: user.id });
  if (error) return fail(error.message.replace(/^.*?: /, ""), 400);

  if (c.kind === "discount") {
    await db.from("entitlements").update({ discount_coupon: c.stripe_coupon, updated_at: new Date().toISOString() }).eq("user_id", user.id);
  } else if (paying(e)) {
    // already paying: the code waits (support can apply it as a credit)
    return reply({ token: await token(db, user.id), kind: c.kind, label: c.label, months: c.months, note: "You already pay for Pro, so this code wasn't needed. Email support@tryartifice.com to turn it into a credit." });
  } else {
    // free time starts now, or adds to free time already running
    const base = e.plan === "code" && e.ends_at && new Date(e.ends_at).getTime() > now ? new Date(e.ends_at).getTime() : now;
    const ends = c.months == null ? null : new Date(base + c.months * 30 * DAY * 1000).toISOString();
    await db
      .from("entitlements")
      .update({ plan: "code", source: `code:${c.label}`, status: "active", starts_at: new Date(now).toISOString(), ends_at: ends, renews: null, price_label: null, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
  }
  return reply({ token: await token(db, user.id), kind: c.kind, label: c.label, months: c.months, discount_pct: c.discount_pct });
});
