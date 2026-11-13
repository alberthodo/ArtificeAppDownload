// Shared by the plan functions (simpleAI/planning/Artifice paid plans spec.md).
//
// Secrets (supabase secrets set NAME=value):
//   PLAN_SIGNING_KEY       base64 PKCS#8 Ed25519 private key (supabase/scripts/plan-key.ts makes it;
//                          its public half is built into the app as ARTIFICE_PLAN_PUBLIC_KEY)
//   STRIPE_SECRET_KEY      sk_test_… first, sk_live_… only when charging starts
//   STRIPE_WEBHOOK_SECRET  whsec_… for stripe-webhook
//   RESEND_API_KEY         sends the student check email (optional until student checks open)
//   STUDENT_EMAIL_FROM     e.g. "Artifice <support@tryartifice.com>"
//   SITE_URL               https://tryartifice.com
import { createClient, SupabaseClient, User } from "jsr:@supabase/supabase-js@2.49.4";

export type Config = {
  trial_days: number;
  offline_grace_days: number;
  payment_grace_days: number;
  devices_per_person: number;
  student_years: number;
  price_monthly: string | null;
  price_yearly: string | null;
  price_founding_monthly: string | null;
  label_monthly: string;
  label_yearly: string;
  label_founding_monthly: string;
  charging_starts_at: string | null;
};

export type Entitlement = {
  user_id: string;
  plan: string;
  source: string | null;
  status: string;
  starts_at: string;
  ends_at: string | null;
  renews: boolean | null;
  price_label: string | null;
  founding: boolean;
  discount_coupon: string | null;
  stripe_customer: string | null;
  stripe_subscription: string | null;
};

export const DAY = 86400;

export function admin(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function siteUrl(): string {
  return (Deno.env.get("SITE_URL") ?? "https://tryartifice.com").replace(/\/+$/, "");
}

/** A JSON reply; `message` is what the app shows. */
export function reply(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}
export function fail(message: string, status = 400, extra: Record<string, unknown> = {}): Response {
  return reply({ message, ...extra }, status);
}

/** The signed-in person: from the request's own access token, never the body. */
export async function who(req: Request, db: SupabaseClient): Promise<User | null> {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await db.auth.getUser(token);
  return error ? null : data.user;
}

export async function config(db: SupabaseClient): Promise<Config> {
  const { data, error } = await db.from("plans_config").select("*").eq("id", true).single();
  if (error || !data) throw new Error("plans_config is missing: run the paid_plans migration");
  return data as Config;
}

export async function entitlement(db: SupabaseClient, userId: string): Promise<Entitlement | null> {
  const { data } = await db.from("entitlements").select("*").eq("user_id", userId).maybeSingle();
  return (data as Entitlement | null) ?? null;
}

/** The person's plan, creating their trial the first time. */
export async function ensureEntitlement(db: SupabaseClient, userId: string): Promise<Entitlement> {
  const e = await entitlement(db, userId);
  if (e) return e;
  const { data, error } = await db
    .from("entitlements")
    .insert({ user_id: userId, plan: "trial", source: "trial", status: "active" })
    .select("*")
    .single();
  if (error) {
    // created by another request at the same moment
    const again = await entitlement(db, userId);
    if (again) return again;
    throw error;
  }
  return data as Entitlement;
}

const secs = (iso: string | null | undefined) => (iso ? Math.floor(new Date(iso).getTime() / 1000) : null);

/** When a trial ends: trial_days after it started, or after charging starts
 *  if it started before that. No end while charging hasn't been scheduled. */
export function trialEnd(e: Entitlement, cfg: Config): number | null {
  if (e.ends_at) return secs(e.ends_at);
  if (!cfg.charging_starts_at) return null;
  const from = Math.max(secs(e.starts_at)!, secs(cfg.charging_starts_at)!);
  return from + cfg.trial_days * DAY;
}

/** What the app gets, before signing. */
export function claims(e: Entitlement, cfg: Config, deviceId: string | null) {
  const now = Math.floor(Date.now() / 1000);
  const ends = e.plan === "trial" ? trialEnd(e, cfg) : secs(e.ends_at);
  return {
    user_id: e.user_id,
    plan: e.plan,
    source: e.source,
    status: e.status,
    ends_at: ends,
    renews: e.renews,
    price: e.price_label,
    issued_at: now,
    valid_until: now + cfg.offline_grace_days * DAY,
    device_id: deviceId,
  };
}

// ---------------------------------------------------------------- signing

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
let signingKey: CryptoKey | null = null;

async function key(): Promise<CryptoKey> {
  if (signingKey) return signingKey;
  const pkcs8 = Deno.env.get("PLAN_SIGNING_KEY");
  if (!pkcs8) throw new Error("PLAN_SIGNING_KEY isn't set");
  const raw = Uint8Array.from(atob(pkcs8), (c) => c.charCodeAt(0));
  signingKey = await crypto.subtle.importKey("pkcs8", raw, { name: "Ed25519" }, false, ["sign"]);
  return signingKey;
}

/** `<base64url claims>.<base64url Ed25519 signature>`; plan.rs checks it. */
export async function sign(c: unknown): Promise<string> {
  const body = b64url(new TextEncoder().encode(JSON.stringify(c)));
  const sig = new Uint8Array(await crypto.subtle.sign("Ed25519", await key(), new TextEncoder().encode(body)));
  return `${body}.${b64url(sig)}`;
}

/** The signed plan for a person, as the app receives it. */
export async function token(db: SupabaseClient, userId: string, deviceId: string | null = null): Promise<string> {
  const [e, cfg] = await Promise.all([ensureEntitlement(db, userId), config(db)]);
  return sign(claims(e, cfg, deviceId));
}

// ---------------------------------------------------------------- Stripe (REST, no SDK)

function form(params: Record<string, string | number | boolean | undefined>, prefix = ""): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(prefix ? `${prefix}[${k}]` : k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

export async function stripe(method: "GET" | "POST", path: string, params: Record<string, string | number | boolean | undefined> = {}) {
  const sk = Deno.env.get("STRIPE_SECRET_KEY");
  if (!sk) throw new Error("STRIPE_SECRET_KEY isn't set");
  const q = form(params);
  const r = await fetch(`https://api.stripe.com/v1/${path}${method === "GET" && q ? `?${q}` : ""}`, {
    method,
    headers: { authorization: `Bearer ${sk}`, "content-type": "application/x-www-form-urlencoded" },
    body: method === "POST" ? q : undefined,
  });
  const v = await r.json();
  if (!r.ok) throw new Error(`Stripe ${path}: ${v?.error?.message ?? r.status}`);
  return v;
}

/** Stripe-Signature check (HMAC-SHA256 of "<t>.<payload>", 5-minute tolerance). */
export async function stripeSignatureOk(payload: string, header: string | null, secret: string): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(`${t}.${payload}`)));
  const hex = [...mac].map((b) => b.toString(16).padStart(2, "0")).join("");
  const sigs = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  return sigs.some((s) => s.length === hex.length && timingSafe(s, hex));
}

function timingSafe(a: string, b: string): boolean {
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** The app's label for a Stripe price. */
export function priceLabel(cfg: Config, priceId: string | undefined): string | null {
  if (priceId && priceId === cfg.price_yearly) return cfg.label_yearly;
  if (priceId && priceId === cfg.price_founding_monthly) return cfg.label_founding_monthly;
  if (priceId && priceId === cfg.price_monthly) return cfg.label_monthly;
  return null;
}

/** Copy a Stripe subscription onto the person's plan. */
export async function applySubscription(db: SupabaseClient, sub: any, userId?: string) {
  const cfg = await config(db);
  const item = sub.items?.data?.[0];
  // newer API versions keep the period on the item
  const periodEnd: number = item?.current_period_end ?? sub.current_period_end;
  const grace = cfg.payment_grace_days * DAY;
  const map: Record<string, { plan: string; status: string; ends: number | null }> = {
    active: { plan: "pro", status: sub.cancel_at_period_end ? "canceled" : "active", ends: periodEnd + DAY },
    trialing: { plan: "pro", status: "active", ends: periodEnd + DAY },
    past_due: { plan: "pro", status: "past_due", ends: Math.max(periodEnd, Math.floor(Date.now() / 1000)) + grace },
    unpaid: { plan: "none", status: "ended", ends: Math.floor(Date.now() / 1000) },
    canceled: { plan: "none", status: "ended", ends: Math.floor(Date.now() / 1000) },
    incomplete: { plan: "none", status: "ended", ends: Math.floor(Date.now() / 1000) },
    incomplete_expired: { plan: "none", status: "ended", ends: Math.floor(Date.now() / 1000) },
    paused: { plan: "none", status: "ended", ends: Math.floor(Date.now() / 1000) },
  };
  const m = map[sub.status] ?? map.canceled;
  const row = {
    plan: m.plan,
    source: "stripe",
    status: m.status,
    ends_at: m.ends ? new Date(m.ends * 1000).toISOString() : null,
    renews: sub.status === "active" || sub.status === "trialing" || sub.status === "past_due" ? !sub.cancel_at_period_end : false,
    price_label: priceLabel(cfg, item?.price?.id),
    stripe_customer: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
    stripe_subscription: sub.id,
    updated_at: new Date().toISOString(),
  };
  const uid = userId ?? sub.metadata?.user_id;
  if (uid) {
    const { error } = await db.from("entitlements").upsert({ user_id: uid, ...row }, { onConflict: "user_id" });
    if (error) throw error;
  } else {
    const { error } = await db.from("entitlements").update(row).eq("stripe_subscription", sub.id);
    if (error) throw error;
  }
}

/** Is the person paying for Pro right now? (Codes and student checks then don't replace it.) */
export function paying(e: Entitlement | null): boolean {
  return !!e && e.plan === "pro" && e.source === "stripe" && e.status !== "ended";
}
