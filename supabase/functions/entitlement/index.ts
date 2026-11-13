// The person's plan, signed for the app (plan.rs checks it with the key built
// into the app). Creates the trial the first time. Records the computer, and
// refuses a new one past the limit.
//
// Deploy: supabase functions deploy entitlement
import { admin, config, ensureEntitlement, claims, sign, who, reply, fail } from "../_shared/plans.ts";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const db = admin();
  const user = await who(req, db);
  if (!user) return fail("Sign in to Artifice again.", 401);
  const body = await req.json().catch(() => ({}));
  const deviceId = typeof body.device_id === "string" ? body.device_id.slice(0, 80) : null;
  const cfg = await config(db);

  if (deviceId) {
    const { data: devices } = await db.from("devices").select("device_id").eq("user_id", user.id);
    const known = (devices ?? []).some((d) => d.device_id === deviceId);
    if (!known && (devices?.length ?? 0) >= cfg.devices_per_person) {
      return fail(
        `Artifice is already on ${cfg.devices_per_person} computers for this account. Remove one in Account › Your computers on any of them, then try again.`,
        403,
        { code: "device_limit" },
      );
    }
    await db.from("devices").upsert(
      {
        user_id: user.id,
        device_id: deviceId,
        name: String(body.device_name ?? "").slice(0, 80) || null,
        os: String(body.os ?? "").slice(0, 20) || null,
        last_seen: new Date().toISOString(),
      },
      { onConflict: "user_id,device_id" },
    );
  }

  const e = await ensureEntitlement(db, user.id);
  return reply({ token: await sign(claims(e, cfg, deviceId)) });
});
