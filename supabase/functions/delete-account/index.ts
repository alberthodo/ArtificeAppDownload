// Deletes the signed-in person's Artifice account (Account › Delete account,
// planning/redesign/08-profile-and-sign-in.md 4.5). Nothing on their computer
// is touched; Artifice holds only their email and name.
//
// Deploy: supabase functions deploy delete-account
// It runs with the service role (set by Supabase), and only ever deletes the
// user the request's own access token belongs to.
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
  return Response.json({ deleted: true });
});
