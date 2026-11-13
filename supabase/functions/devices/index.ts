// The person's computers: list them, or remove one (it asks for a slot again
// the next time Artifice there checks the plan).
//
// Deploy: supabase functions deploy devices
import { admin, config, who, reply, fail } from "../_shared/plans.ts";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const db = admin();
  const user = await who(req, db);
  if (!user) return fail("Sign in to Artifice again.", 401);
  const { action, device_id } = await req.json().catch(() => ({}));
  if (action === "remove" && typeof device_id === "string") {
    await db.from("devices").delete().eq("user_id", user.id).eq("device_id", device_id);
  }
  const [{ data }, cfg] = await Promise.all([
    db.from("devices").select("device_id,name,os,first_seen,last_seen").eq("user_id", user.id).order("last_seen", { ascending: false }),
    config(db),
  ]);
  return reply({ devices: data ?? [], limit: cfg.devices_per_person });
});
