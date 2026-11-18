// List access codes, or end them early. (Making codes: make-codes.mjs.)
//
//   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node supabase/scripts/codes.mjs list [--label founders]
//   … codes.mjs end ARTF-7Q2K-M9XD            stop the code: nobody new can redeem it
//   … codes.mjs end --label friends-2026      stop every code with that label
//   … codes.mjs end ARTF-7Q2K-M9XD --users    also end the free time of everyone who redeemed it
//
// `end` shows what it will change and does nothing until you add --yes.
// --users only touches people whose plan still comes from that code: anyone who
// has since paid, verified as a student or redeemed a different code keeps it.
// Ended free time works like free time that ran out: the app shows "Plan ended".

const [cmd, ...rest] = process.argv.slice(2);
const args = {}, words = [];
for (let i = 0; i < rest.length; i++) {
  const v = rest[i];
  if (!v.startsWith("--")) words.push(v);
  else if (rest[i + 1] && !rest[i + 1].startsWith("--")) args[v.slice(2)] = rest[++i];
  else args[v.slice(2)] = true;
}
const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !["list", "end"].includes(cmd)) {
  console.error("usage: codes.mjs list [--label L] | codes.mjs end <CODE | --label L> [--users] [--yes]\nneeds SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function rest_(method, path, body) {
  const r = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json", prefer: "return=representation" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) {
    console.error(`couldn't ${method === "GET" ? "read" : "change"} ${path.split("?")[0]}:`, r.status, await r.text());
    process.exit(1);
  }
  return r.json();
}
const q = encodeURIComponent;
const now = new Date();
const state = (c) =>
  c.redeem_by && new Date(c.redeem_by) <= now ? "ended" : c.uses >= c.max_uses ? "used up" : "open";

if (cmd === "list") {
  const filter = args.label ? `&label=eq.${q(args.label)}` : "";
  const codes = await rest_("GET", `codes?select=*${filter}&order=created_at.desc`);
  console.log("code,label,kind,months,percent,used,max_uses,redeem_by,state,created_at");
  for (const c of codes)
    console.log([c.code, c.label, c.kind, c.months ?? "no end", c.discount_pct ?? "", c.uses, c.max_uses, c.redeem_by ?? "", state(c), c.created_at].join(","));
  if (!codes.length) console.error(args.label ? `no codes labelled "${args.label}"` : "no codes yet");
  process.exit(0);
}

// end
const code = words[0]?.trim().toUpperCase();
if (!code && typeof args.label !== "string") {
  console.error("say which code to end: codes.mjs end ARTF-XXXX-XXXX, or --label <label>");
  process.exit(1);
}
const codes = await rest_("GET", `codes?select=*&${code ? `code=eq.${q(code)}` : `label=eq.${q(args.label)}`}`);
if (!codes.length) {
  console.error(code ? `no code ${code}` : `no codes labelled "${args.label}"`);
  process.exit(1);
}
const open = codes.filter((c) => state(c) !== "ended");
const list = codes.map((c) => c.code);
const reds = args.users ? await rest_("GET", `redemptions?select=code,user_id&code=in.(${list.map(q).join(",")})`) : [];
// only people whose current plan still comes from one of these codes
const labelOf = Object.fromEntries(codes.map((c) => [c.code, c.label]));
const ids = [...new Set(reds.map((r) => r.user_id))];
const ents = ids.length
  ? await rest_("GET", `entitlements?select=user_id,plan,source,ends_at&user_id=in.(${ids.join(",")})&plan=eq.code`)
  : [];
const sources = new Set(reds.map((r) => `code:${labelOf[r.code]}`));
const affected = ents.filter((e) => sources.has(e.source) && (!e.ends_at || new Date(e.ends_at) > now));
const discounts = codes.filter((c) => c.kind === "discount").length;

console.log(`${codes.length} code(s): ${open.length} will stop accepting new redemptions (${codes.length - open.length} already ended).`);
if (args.users) {
  console.log(`${reds.length} redemption(s); ${affected.length} person(s) will lose free time from now.`);
  if (discounts) console.log(`${discounts} discount code(s): --users can't take back a discount already applied in Stripe; remove the coupon there.`);
}
if (!args.yes) {
  console.log("Nothing changed. Run again with --yes to do it.");
  process.exit(0);
}
if (open.length) await rest_("PATCH", `codes?code=in.(${open.map((c) => q(c.code)).join(",")})`, { redeem_by: now.toISOString() });
if (affected.length)
  await rest_("PATCH", `entitlements?user_id=in.(${affected.map((e) => e.user_id).join(",")})&plan=eq.code`, {
    ends_at: now.toISOString(),
    updated_at: now.toISOString(),
  });
console.log(`Done. ${open.length} code(s) ended${args.users ? `, free time ended for ${affected.length} person(s)` : ""}. People see it the next time the app checks their plan (on open, or within about 12 hours).`);
