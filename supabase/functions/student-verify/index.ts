// Student check, step 2: the code from the school email turns on the student
// plan for a year. The school address is deleted once checked; only its
// domain is kept (for the yearly re-check).
//
// Deploy: supabase functions deploy student-verify
import { admin, config, DAY, ensureEntitlement, paying, token, who, reply, fail } from "../_shared/plans.ts";

async function hash(s: string): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  return [...d].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const db = admin();
  const user = await who(req, db);
  if (!user) return fail("Sign in to Artifice again.", 401);
  const { code } = await req.json().catch(() => ({}));
  const { data: chk } = await db.from("student_checks").select("*").eq("user_id", user.id).maybeSingle();
  if (!chk?.code_hash) return fail("Start with your school email first.");
  if (new Date(chk.code_expires).getTime() < Date.now()) return fail("That code has expired. Send a new one.");
  if (chk.attempts >= 5) return fail("Too many tries. Send a new code.", 429);
  if ((await hash(`${user.id}:${String(code ?? "").trim()}`)) !== chk.code_hash) {
    await db.from("student_checks").update({ attempts: chk.attempts + 1 }).eq("user_id", user.id);
    return fail("That code didn't work. Check the email, or send a new one.");
  }
  const cfg = await config(db);
  const until = new Date(Date.now() + cfg.student_years * 365 * DAY * 1000).toISOString();
  await db.from("student_checks").update({ school_email: null, code_hash: null, verified_at: new Date().toISOString(), next_check: until }).eq("user_id", user.id);
  const e = await ensureEntitlement(db, user.id);
  if (!paying(e)) {
    await db.from("entitlements").update({ plan: "student", source: "student", status: "active", starts_at: new Date().toISOString(), ends_at: until, renews: null, price_label: null, updated_at: new Date().toISOString() }).eq("user_id", user.id);
  }
  return reply({ token: await token(db, user.id) });
});
