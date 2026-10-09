/**
 * Where the database lives:
 *  - DATABASE_URL if set (e.g. a Turso / libSQL URL for production)
 *  - on Vercel without DATABASE_URL: a throw-away SQLite file in /tmp (demo mode — data resets on cold starts)
 *  - locally: ./data/explorebound.db
 */
export function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.VERCEL) return "file:/tmp/explorebound.db";
  return "file:./data/explorebound.db";
}

export const isEphemeralDatabase = () => !process.env.DATABASE_URL && Boolean(process.env.VERCEL);
