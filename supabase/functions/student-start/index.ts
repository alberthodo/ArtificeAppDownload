// Student check, step 1: send a 6-digit code to a school email address.
// Domains come from the school_domains table (a subdomain of a listed school
// counts: cs.stanford.edu → stanford.edu).
//
// Deploy: supabase functions deploy student-start
// Needs RESEND_API_KEY and STUDENT_EMAIL_FROM.
import { admin, who, reply, fail } from "../_shared/plans.ts";

async function hash(s: string): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  return [...d].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const db = admin();
  const user = await who(req, db);
  if (!user) return fail("Sign in to Artifice again.", 401);
  const { school_email } = await req.json().catch(() => ({}));
  const email = String(school_email ?? "").trim().toLowerCase();
  const domain = email.split("@")[1] ?? "";
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(email)) return fail("That email address doesn't look right.");

  // the domain or any parent of it is a known school
  const labels = domain.split(".");
  const candidates = labels.slice(0, -1).map((_, i) => labels.slice(i).join("."));
  const { data: school } = await db.from("school_domains").select("domain").in("domain", candidates).limit(1).maybeSingle();
  if (!school) return reply({ sent: false, known_school: false });

  const { data: prev } = await db.from("student_checks").select("sent_at").eq("user_id", user.id).maybeSingle();
  if (prev?.sent_at && Date.now() - new Date(prev.sent_at).getTime() < 60_000) return fail("We just sent a code. Wait a minute before asking for another.", 429);

  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return fail("Student checks aren't open yet.", 503);
  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("STUDENT_EMAIL_FROM") ?? "Artifice <support@tryartifice.com>",
      to: [email],
      subject: `Your Artifice student code: ${code}`,
      text: `Your code is ${code}. Type it in Artifice to confirm you're a student. It works for 15 minutes.\n\nDidn't ask for this? You can ignore this email.`,
    }),
  });
  if (!sent.ok) return fail("We couldn't send the email. Check the address and try again.", 502);
  await db.from("student_checks").upsert(
    { user_id: user.id, domain: school.domain, school_email: email, code_hash: await hash(`${user.id}:${code}`), code_expires: new Date(Date.now() + 15 * 60_000).toISOString(), attempts: 0, sent_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
  return reply({ sent: true, known_school: true, to: email });
});
