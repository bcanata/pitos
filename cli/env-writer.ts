import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

interface EnvConfig {
  anthropicApiKey: string;
  databaseUrl?: string;
  appUrl?: string;
  cloudflareAccountId?: string;
  cloudflareEmailApiToken?: string;
  fromEmail?: string;
}

export interface WrittenEnv {
  authSecret: string;
  anthropicApiKey: string;
  appUrl: string;
  cloudflareAccountId: string;
  cloudflareEmailApiToken: string;
  fromEmail: string;
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
    cloudflareAccountId: config.cloudflareAccountId ?? "",
    cloudflareEmailApiToken: config.cloudflareEmailApiToken ?? "",
    fromEmail: config.fromEmail ?? "",
  };

  const lines = [
    `DATABASE_URL=${config.databaseUrl ?? "./pitos.db"}`,
    `ANTHROPIC_API_KEY=${written.anthropicApiKey}`,
    `AUTH_SECRET=${written.authSecret}`,
    `APP_URL=${written.appUrl}`,
    ``,
    `# Cloudflare Email Service (https://blog.cloudflare.com/email-for-agents/)`,
    `CLOUDFLARE_ACCOUNT_ID=${written.cloudflareAccountId}`,
    `CLOUDFLARE_EMAIL_API_TOKEN=${written.cloudflareEmailApiToken}`,
    `FROM_EMAIL=${written.fromEmail}`,
  ];

  fs.writeFileSync(envPath, lines.join("\n") + "\n");
  return written;
}
