import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "./schema";
import { join } from "path";

function resolveDbConfig(): { url: string; authToken?: string } {
  if (process.env.TURSO_DATABASE_URL) {
    return {
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    };
  }
  const path = process.env.VERCEL ? "/tmp/pitos.db" : (process.env.DATABASE_URL ?? "./pitos.db");
  const url = path.startsWith("/") ? `file:${path}` : `file:${join(process.cwd(), path)}`;
  return { url };
}

const cfg = resolveDbConfig();
const client = createClient(cfg);
export const db = drizzle(client, { schema });

// Idempotent migrations on Vercel cold starts (ephemeral /tmp SQLite only).
// With Turso, run `npm run db:push` once during CLI setup — no cold-start migrations needed.
if (process.env.VERCEL && !process.env.TURSO_DATABASE_URL) {
  migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") }).catch(console.error);
}
