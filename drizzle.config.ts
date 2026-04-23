import type { Config } from "drizzle-kit";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

export default (
  tursoUrl
    ? {
        schema: "./db/schema.ts",
        out: "./drizzle",
        dialect: "turso",
        dbCredentials: { url: tursoUrl, authToken: tursoToken },
      }
    : {
        schema: "./db/schema.ts",
        out: "./drizzle",
        dialect: "sqlite",
        dbCredentials: { url: process.env.DATABASE_URL ?? "./pitos.db" },
      }
) satisfies Config;
