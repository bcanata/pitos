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
  const raw = process.env.VERCEL ? "/tmp/pitos.db" : (process.env.DATABASE_URL ?? "./pitos.db");
  // Accept either a libsql URL (already file:/libsql:/https:) or a bare path.
  // Without this guard, `DATABASE_URL=file:./pitos.db` would get joined with
  // process.cwd() and produce `file:/abs/cwd/file:./pitos.db` which libsql
  // can't open — that broke local builds + GitHub Actions CI.
  let url: string;
  if (/^(file|libsql|wss?|https?):/.test(raw)) {
    url = raw;
  } else if (raw.startsWith("/")) {
    url = `file:${raw}`;
  } else {
    url = `file:${join(process.cwd(), raw)}`;
  }
  return { url };
}

const cfg = resolveDbConfig();
const client = createClient(cfg);
export const db = drizzle(client, { schema });

// Idempotent migrations on Vercel cold starts (ephemeral /tmp SQLite only).
// With Turso, run `npm run db:push` once during CLI setup — no cold-start
// migrations needed.
//
// Skipped during `next build` ("collecting page data") because that phase
// imports route modules eagerly; firing migrate() inside a build worker can
// stall or fail when /tmp isn't yet provisioned, taking the whole build
// down. Runtime cold starts still get migrate() through the normal import.
const isBuildPhase =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.npm_lifecycle_event === "build";
if (
  process.env.VERCEL &&
  !process.env.TURSO_DATABASE_URL &&
  !isBuildPhase
) {
  migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") }).catch(console.error);
}
