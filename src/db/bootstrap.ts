import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import { migrateDatabase, seedDatabase } from "./seed";
import { resolveDatabaseUrl } from "./url";

/** Applies migrations and seeds the starter catalogue if the database is empty. */
export async function bootstrapDatabase() {
  const url = resolveDatabaseUrl();
  if (url.startsWith("file:")) fs.mkdirSync(path.dirname(path.resolve(url.slice(5))), { recursive: true });
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  try {
    const db = drizzle(client, { schema });
    await migrateDatabase(db);
    await seedDatabase(db, { withDemo: process.env.SEED_DEMO !== "false" });
  } catch (err) {
    console.error("[db] bootstrap failed:", err);
  } finally {
    client.close();
  }
}
