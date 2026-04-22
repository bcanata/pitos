import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import type { SQLiteSessionTable } from "@lucia-auth/adapter-drizzle";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

// The schema uses mode:"timestamp" (Date) but the adapter type expects integer (number).
// Both are stored as integers in SQLite — the cast is safe at runtime.
const adapter = new DrizzleSQLiteAdapter(db, sessions as unknown as SQLiteSessionTable, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: { secure: process.env.NODE_ENV === "production" },
  },
  getUserAttributes: (attrs) => ({
    email: (attrs as { email: string }).email,
    name: (attrs as { name: string | null }).name,
  }),
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: { email: string; name: string | null };
  }
}
