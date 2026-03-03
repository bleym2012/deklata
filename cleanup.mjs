/**
 * DEKLATA TEST DATA CLEANUP
 * Deletes ONLY seed items (those with [SEED] in description).
 * Real items are never touched.
 *
 * Usage:
 *   node cleanup.mjs          → shows count, asks to confirm
 *   node cleanup.mjs --force  → deletes immediately
 */

import { createClient } from "@supabase/supabase-js";
import { createInterface } from "readline";

const SUPABASE_URL = "https://iibknadykycghvbjbwxs.supabase.co";

// Same service role key as seed.mjs
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpYmtuYWR5a3ljZ2h2Ympid3hzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE1OTMyMywiZXhwIjoyMDg0NzM1MzIzfQ.nSdkI5o9PCvjFlt1aqWx1VOoM3trPbGsKJwUP75wV7U";

const BATCH_SIZE = 50;
const FORCE = process.argv.includes("--force");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

function prompt(q) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((r) =>
    rl.question(q, (a) => {
      rl.close();
      r(a.trim().toLowerCase());
    }),
  );
}

async function main() {
  if (
    SUPABASE_SERVICE_KEY ===
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpYmtuYWR5a3ljZ2h2Ympid3hzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE1OTMyMywiZXhwIjoyMDg0NzM1MzIzfQ.nSdkI5o9PCvjFlt1aqWx1VOoM3trPbGsKJwUP75wV7U"
  ) {
    console.error(
      "\n❌  Paste your service_role key on line 12 of cleanup.mjs",
    );
    console.error(
      "   Supabase Dashboard → Project Settings → API → service_role\n",
    );
    process.exit(1);
  }

  console.log("\n🧹  Deklata Cleanup");
  console.log('   Looking for items with "[SEED]" in description...\n');

  const { count, error } = await supabase
    .from("items")
    .select("id", { count: "exact", head: true })
    .ilike("description", "[SEED]%");

  if (error) {
    console.error("❌  Error:", error.message);
    process.exit(1);
  }

  if (!count || count === 0) {
    console.log("✅  No seed items found. Database is clean.\n");
    process.exit(0);
  }

  console.log(`   Found ${count} seed items to delete.`);
  console.log("   Your real items will NOT be touched.\n");

  if (!FORCE) {
    const answer = await prompt(
      `   Type "yes" to delete all ${count} seed items: `,
    );
    if (answer !== "yes") {
      console.log("\n   Cancelled. Nothing deleted.\n");
      process.exit(0);
    }
  }

  console.log("\n   Deleting...\n");
  let totalDeleted = 0;

  while (true) {
    const { data: batch, error: fetchErr } = await supabase
      .from("items")
      .select("id")
      .ilike("description", "[SEED]%")
      .limit(BATCH_SIZE);

    if (fetchErr || !batch?.length) break;

    const ids = batch.map((r) => r.id);

    await supabase.from("requests").delete().in("item_id", ids);
    await supabase.from("item_images").delete().in("item_id", ids);
    const { error: delErr } = await supabase
      .from("items")
      .delete()
      .in("id", ids);

    if (delErr) {
      console.error("❌  Delete error:", delErr.message);
      break;
    }

    totalDeleted += ids.length;
    process.stdout.write(`\r   Deleted: ${totalDeleted}/${count}...`);
  }

  console.log(
    `\n\n✅  Done! ${totalDeleted} seed items deleted. Real items untouched.\n`,
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
