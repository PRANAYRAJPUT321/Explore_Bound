/**
 * Creates / migrates the database and fills it with starter content.
 *
 *   npm run db:setup                 → migrate + seed (only if empty)
 *   npm run db:reset                 → wipe everything, migrate + seed again
 *   npm run db:reset -- --no-demo    → reseed without sample reviews, bookings & enquiries
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import fs from "node:fs";
import path from "node:path";
import * as schema from "../src/db/schema";
import { migrateDatabase, seedDatabase } from "../src/db/seed";
import { isEphemeralDatabase, resolveDatabaseUrl } from "../src/db/url";

for (const f of [".env", ".env.local"]) {
  if (fs.existsSync(f)) process.loadEnvFile(f);
}

const args = new Set(process.argv.slice(2));
const reset = args.has("--reset");
const withDemo = !args.has("--no-demo") && process.env.SEED_DEMO !== "false";

async function main() {
  if (isEphemeralDatabase()) {
    console.log("ℹ No DATABASE_URL on Vercel — the app will create a demo database in /tmp at runtime.");
    return;
  }
  const url = resolveDatabaseUrl();
  const isFile = url.startsWith("file:");
  if (isFile) {
    const file = path.resolve(url.slice("file:".length));
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (reset) for (const suffix of ["", "-wal", "-shm", "-journal"]) fs.rmSync(file + suffix, { force: true });
  }

  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  const db = drizzle(client, { schema });

  if (reset && !isFile) {
    console.log("↺ Dropping remote tables…");
    for (const t of ["bookings", "departures", "reviews", "enquiries", "feedback", "subscribers", "packages", "destinations", "__drizzle_migrations"]) {
      await client.execute(`DROP TABLE IF EXISTS "${t}"`);
    }
  }

  await migrateDatabase(db);
  console.log("🌱 Checking starter content…");
  const seeded = await seedDatabase(db, { withDemo });
  if (!seeded) console.log(`✓ Database ready. Use "npm run db:reset" to start fresh.`);
}

main().catch((err) => {
  console.error("✗ Database setup failed:", err);
  process.exit(1);
});
