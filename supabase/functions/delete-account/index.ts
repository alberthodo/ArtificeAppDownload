// Deletes the signed-in person's Artifice account (Account › Delete account,
// planning/redesign/08-profile-and-sign-in.md 4.5). Nothing on their computer
// is touched; Artifice holds only their email and name.
//
// Deploy: supabase functions deploy delete-account
// It runs with the service role (set by Supabase), and only ever deletes the
// user the request's own access token belongs to.
//
// It also deletes them, and their usage events, from PostHog: signed-in usage
// is linked to the account id there (Artifice's analytics::identify). Set
// these secrets for that (supabase secrets set NAME=value):
//   POSTHOG_PERSONAL_API_KEY  a personal API key with the person:write scope
//   POSTHOG_PROJECT_ID        the PostHog project's id (Project settings)
//   POSTHOG_HOST              optional, default https://eu.posthog.com
// Without them the account is still deleted; PostHog is skipped.
import { createClient } from "jsr:@supabase/supabase-js@2.49.4";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ msg: "Sign in first." }, { status: 401 });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  // Who is asking: the token's own user, never an id from the request body.
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return Response.json({ msg: "Sign in again, then delete the account." }, { status: 401 });

  const del = await admin.auth.admin.deleteUser(data.user.id);
  if (del.error) return Response.json({ msg: "The account couldn't be deleted. Try again in a moment." }, { status: 500 });
  const analytics = await forgetInPostHog(data.user.id);
  return Response.json({ deleted: true, analytics });
});

/** Delete the person PostHog files this account's usage under, and their events. */
async function forgetInPostHog(userId: string): Promise<string> {
  const key = Deno.env.get("POSTHOG_PERSONAL_API_KEY");
  const project = Deno.env.get("POSTHOG_PROJECT_ID");
  if (!key || !project) return "skipped";
  const host = (Deno.env.get("POSTHOG_HOST") ?? "https://eu.posthog.com").replace(/\/+$/, "");
  try {
    const r = await fetch(`${host}/api/projects/${encodeURIComponent(project)}/persons/bulk_delete/`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ distinct_ids: [userId], delete_events: true }),
    });
    if (!r.ok) console.error("PostHog deletion failed", r.status, await r.text());
    return r.ok ? "deleted" : "failed";
  } catch (e) {
    console.error("PostHog deletion failed", e);
    return "failed";
  }
}
