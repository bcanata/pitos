import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../db/schema";
import { randomBytes, randomUUID } from "crypto";
import { join } from "path";

interface SetupConfig {
  email: string;
  name: string;
  teamName: string;
  teamNumber?: number;
  language?: string;
  appUrl: string;
}

export function setupDatabase(config: SetupConfig): string {
  const dbPath = process.env.DATABASE_URL ?? "./pitos.db";
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });

  migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });

  const now = new Date();
  const userId = randomUUID();
  const teamId = randomUUID();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

  const doInserts = sqlite.transaction(() => {
    db.insert(schema.users)
      .values({ id: userId, email: config.email, name: config.name, createdAt: now })
      .run();

    db.insert(schema.teams)
      .values({
        id: teamId,
        name: config.teamName,
        number: config.teamNumber ?? null,
        language: config.language ?? "en",
        createdByUserId: userId,
        createdAt: now,
      })
      .run();

    db.insert(schema.memberships)
      .values({ id: randomUUID(), userId, teamId, role: "lead_mentor", joinedAt: now })
      .run();

    const channelNames = ["general", "outreach", "build", "programming"] as const;
    for (const name of channelNames) {
      const channelId = randomUUID();
      db.insert(schema.channels)
        .values({ id: channelId, teamId, name, type: "public", createdAt: now })
        .run();
      db.insert(schema.channelMembers)
        .values({ id: randomUUID(), channelId, userId, joinedAt: now })
        .run();
    }

    db.insert(schema.magicLinks)
      .values({ id: randomUUID(), email: config.email, token, expiresAt })
      .run();
  });

  doInserts();
  sqlite.close();

  return `${config.appUrl}/api/auth/verify?token=${token}`;
}
