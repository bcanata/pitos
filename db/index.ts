import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";
import { join } from "path";

function resolveDbPath(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.VERCEL) return "/tmp/pitos.db";
  return "./pitos.db";
}

const sqlite = new Database(resolveDbPath());
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// In production, apply migrations on every cold start (idempotent).
if (process.env.VERCEL) {
  migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
}
