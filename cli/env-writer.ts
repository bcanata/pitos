import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

interface EnvConfig {
  anthropicApiKey: string;
  databaseUrl?: string;
  appUrl?: string;
  // Email — Resend (free, preferred)
  resendApiKey?: string;
  resendFromEmail?: string;
  // Email — Cloudflare (requires Workers Paid, $5/mo)
  cloudflareAccountId?: string;
  cloudflareEmailApiToken?: string;
  fromEmail?: string;
  // Database — Turso (free persistent SQLite)
  tursoDatabaseUrl?: string;
  tursoAuthToken?: string;
}

export interface WrittenEnv {
  authSecret: string;
  anthropicApiKey: string;
  appUrl: string;
  resendApiKey: string;
  resendFromEmail: string;
  cloudflareAccountId: string;
  cloudflareEmailApiToken: string;
  fromEmail: string;
  tursoDatabaseUrl: string;
  tursoAuthToken: string;
}

export function writeEnvFile(config: EnvConfig, force: boolean): WrittenEnv {
  const envPath = path.join(process.cwd(), ".env.local");

  if (fs.existsSync(envPath) && !force) {
    throw new Error("ENV_EXISTS");
  }

  const written: WrittenEnv = {
    authSecret: randomBytes(32).toString("hex"),
    anthropicApiKey: config.anthropicApiKey,
    appUrl: config.appUrl ?? "http://localhost:3000",
    resendApiKey: config.resendApiKey ?? "",
    resendFromEmail: config.resendFromEmail ?? "",
    cloudflareAccountId: config.cloudflareAccountId ?? "",
    cloudflareEmailApiToken: config.cloudflareEmailApiToken ?? "",
    fromEmail: config.fromEmail ?? "",
    tursoDatabaseUrl: config.tursoDatabaseUrl ?? "",
    tursoAuthToken: config.tursoAuthToken ?? "",
  };

  const lines = [
    `DATABASE_URL=${config.databaseUrl ?? "./pitos.db"}`,
    `ANTHROPIC_API_KEY=${written.anthropicApiKey}`,
    `AUTH_SECRET=${written.authSecret}`,
    `APP_URL=${written.appUrl}`,
    ``,
    `# Email — Resend (free 3k/mo: resend.com/api-keys)`,
    `RESEND_API_KEY=${written.resendApiKey}`,
    `RESEND_FROM_EMAIL=${written.resendFromEmail}`,
    ``,
    `# Email — Cloudflare (requires Workers Paid $5/mo — leave blank if using Resend)`,
    `CLOUDFLARE_ACCOUNT_ID=${written.cloudflareAccountId}`,
    `CLOUDFLARE_EMAIL_API_TOKEN=${written.cloudflareEmailApiToken}`,
    `FROM_EMAIL=${written.fromEmail}`,
    ``,
    `# Database — Turso (free persistent SQLite: turso.tech)`,
    `TURSO_DATABASE_URL=${written.tursoDatabaseUrl}`,
    `TURSO_AUTH_TOKEN=${written.tursoAuthToken}`,
  ];

  fs.writeFileSync(envPath, lines.join("\n") + "\n");
  return written;
}
