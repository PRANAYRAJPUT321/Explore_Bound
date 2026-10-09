import "server-only";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import { resolveDatabaseUrl } from "./url";

export const DATABASE_URL = resolveDatabaseUrl();

function makeClient(): Client {
  if (DATABASE_URL.startsWith("file:")) {
    const file = DATABASE_URL.slice("file:".length);
    fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  }
  return createClient({ url: DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN });
}

const globalForDb = globalThis as unknown as { __ebClient?: Client };
const client = globalForDb.__ebClient ?? makeClient();
if (process.env.NODE_ENV !== "production") globalForDb.__ebClient = client;

export const db = drizzle(client, { schema });
export { schema };
