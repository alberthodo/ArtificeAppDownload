// Fill the school_domains table from the university domains list
// (github.com/Hipo/university-domains-list, MIT licence). Safe to run again.
//
//   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node supabase/scripts/school-domains.mjs
const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const LIST = "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json";
const unis = await (await fetch(LIST)).json();
const seen = new Map();
for (const u of unis) for (const d of u.domains ?? []) {
  const domain = String(d).trim().toLowerCase().replace(/^www\./, "");
  if (domain.includes(".") && !seen.has(domain)) seen.set(domain, { domain, name: u.name });
}
const rows = [...seen.values()];
for (let i = 0; i < rows.length; i += 1000) {
  const r = await fetch(`${url}/rest/v1/school_domains?on_conflict=domain`, {
    method: "POST",
    headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json", prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows.slice(i, i + 1000)),
  });
  if (!r.ok) {
    console.error("failed at", i, r.status, await r.text());
    process.exit(1);
  }
}
console.log(`${rows.length} school domains saved`);
