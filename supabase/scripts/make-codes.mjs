// Make access codes and print them as CSV.
//
//   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node supabase/scripts/make-codes.mjs \
//     --label cwd-pilot --kind free_time --months 3 --count 10 [--uses 1] [--redeem-by 2027-03-01]
//   … --label nonprofit --kind discount --percent 40 --coupon <stripe coupon id> --count 1 --uses 200
//
// --months omitted with free_time = no end. One code with --uses 50 suits a
// class or an event; --count 10 --uses 1 gives ten personal codes.
import { randomInt } from "node:crypto";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith("--") ? [...a, [v.slice(2), all[i + 1]?.startsWith("--") ? true : all[i + 1]]] : a), []));
const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !args.label || !args.kind) {
  console.error("needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, --label and --kind (free_time | discount)");
  process.exit(1);
}
// no 0/O, 1/I/L: easy to read aloud and type
const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const part = () => Array.from({ length: 4 }, () => ALPHA[randomInt(ALPHA.length)]).join("");
const rows = Array.from({ length: Number(args.count ?? 1) }, () => ({
  code: `ARTF-${part()}-${part()}`,
  label: String(args.label),
  kind: args.kind,
  months: args.months ? Number(args.months) : null,
  discount_pct: args.percent ? Number(args.percent) : null,
  stripe_coupon: args.coupon ?? null,
  max_uses: Number(args.uses ?? 1),
  redeem_by: args["redeem-by"] ? new Date(args["redeem-by"]).toISOString() : null,
  created_by: process.env.USER ?? null,
}));
if (args.kind === "discount" && !args.coupon) {
  console.error("a discount code needs --coupon (create the coupon in Stripe first)");
  process.exit(1);
}
const r = await fetch(`${url}/rest/v1/codes`, {
  method: "POST",
  headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json", prefer: "return=minimal" },
  body: JSON.stringify(rows),
});
if (!r.ok) {
  console.error("couldn't save the codes:", r.status, await r.text());
  process.exit(1);
}
console.log("code,label,kind,months,percent,uses,redeem_by");
for (const c of rows) console.log([c.code, c.label, c.kind, c.months ?? "", c.discount_pct ?? "", c.max_uses, c.redeem_by ?? ""].join(","));
