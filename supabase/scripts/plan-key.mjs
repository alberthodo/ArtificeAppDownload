// Make the key pair that signs plans. Run once:  node supabase/scripts/plan-key.mjs
//   PLAN_SIGNING_KEY          → supabase secrets set PLAN_SIGNING_KEY=<private>
//   ARTIFICE_PLAN_PUBLIC_KEY  → the app's build environment (release workflow
//                               secret and scripts/build-release.sh)
// Keep the private key only in Supabase secrets and a password manager. If it
// leaks, anyone can sign themselves a plan: make a new pair and ship an update.
import { generateKeyPairSync } from "node:crypto";

const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const pkcs8 = privateKey.export({ type: "pkcs8", format: "der" }).toString("base64");
// the raw 32-byte public key is the last 32 bytes of its SPKI encoding
const raw = publicKey.export({ type: "spki", format: "der" }).subarray(-32).toString("base64");
console.log(`PLAN_SIGNING_KEY=${pkcs8}`);
console.log(`ARTIFICE_PLAN_PUBLIC_KEY=${raw}`);
