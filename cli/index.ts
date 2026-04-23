#!/usr/bin/env node
import { input, password, select, confirm } from "@inquirer/prompts";
import Anthropic from "@anthropic-ai/sdk";
import { spawn, spawnSync } from "child_process";
import { cp } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { t, loadLanguage, loadCustomBundle } from "./i18n/index";
import { translateBundle } from "./i18n/translate";
import { writeEnvFile } from "./env-writer";
import { setupDatabase } from "./setup";
import {
  isVercelInstalled,
  isVercelLinked,
  runInteractive,
  pushEnvVars,
  deployProd,
  addVercelDomain,
} from "./deploy";
import { findZone, setupDomainDns, type CfAuth } from "./cloudflare-setup";

const force = process.argv.includes("--force");
const PKG_ROOT = path.join(__dirname, "..");
const SKIP_TOP_LEVEL = new Set([
  "node_modules",
  ".next",
  ".vercel",
  ".git",
  ".claude",
  ".DS_Store",
  ".env.local",
  "pitos.db",
  "pitos.db-shm",
  "pitos.db-wal",
  "tsconfig.tsbuildinfo",
]);

/**
 * If the user ran `npx pitos` from outside a pitos checkout, copy the
 * package files into a new directory under cwd and `npm install` there,
 * then chdir so the rest of the wizard runs against that fresh project.
 *
 * Detection: cwd is already a pitos checkout if `db/schema.ts` +
 * `drizzle.config.ts` both exist. In that case, skip scaffolding.
 */
async function scaffoldIfNeeded(): Promise<void> {
  const cwd = process.cwd();
  const alreadyInCheckout =
    existsSync(path.join(cwd, "db", "schema.ts")) &&
    existsSync(path.join(cwd, "drizzle.config.ts"));
  if (alreadyInCheckout) return;

  const dirName = await input({
    message: "Project directory:",
    default: "pitos",
    validate: (v) => {
      const name = v.trim();
      if (!name) return "Directory name is required.";
      if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
        return "Use letters, numbers, dots, hyphens, or underscores.";
      }
      if (existsSync(path.join(cwd, name))) {
        return `"${name}" already exists — pick another name.`;
      }
      return true;
    },
  });

  const target = path.join(cwd, dirName.trim());

  process.stdout.write(`Copying files to ${dirName}/... `);
  await cp(PKG_ROOT, target, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(PKG_ROOT, src);
      if (!rel) return true;
      const parts = rel.split(path.sep);
      if (SKIP_TOP_LEVEL.has(parts[0])) return false;
      if (parts[0].endsWith(".db")) return false;
      if (
        parts[0] === "cli" &&
        parts[1] === "i18n" &&
        parts[2] === "cache" &&
        parts.length > 3 &&
        parts[3] !== ".gitignore"
      ) {
        return false;
      }
      return true;
    },
  });
  console.log("✓");

  process.chdir(target);

  process.stdout.write("Installing dependencies (~30s)... ");
  const r = spawnSync("npm", ["install", "--silent", "--no-audit", "--no-fund"], {
    stdio: ["ignore", "ignore", "inherit"],
  });
  if (r.status !== 0) {
    console.log("failed");
    throw new Error(
      `npm install failed. cd into "${dirName}" and run "npm install" manually, then re-run "npx pitos".`
    );
  }
  console.log("✓\n");
}

const LANGUAGES = [
  { value: "en", name: "English" },
  { value: "tr", name: "Türkçe" },
  { value: "es", name: "Español" },
  { value: "fr", name: "Français" },
  { value: "de", name: "Deutsch" },
  { value: "pt", name: "Português" },
  { value: "zh", name: "中文" },
  { value: "ja", name: "日本語" },
  { value: "he", name: "עברית" },
  { value: "other", name: "Other / Diğer / Otro / Autre..." },
];

async function main() {
  const bar = "═".repeat(52);
  console.log(`\n${bar}`);
  console.log("  PitOS — First-run setup");
  console.log(`${bar}\n`);
  console.log("This wizard sets up your team workspace in about 2 minutes.\n");

  // ── Step 0: Scaffold into a fresh dir if user ran `npx pitos` from anywhere ──
  await scaffoldIfNeeded();

  // ── Step 1: Claude API key (needed before language for on-demand translation) ──
  const apiKey = await password({ message: "Claude API key (sk-ant-...):" });

  process.stdout.write("Validating API key... ");
  try {
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 10,
      messages: [{ role: "user", content: "Reply: ok" }],
    });
    if (resp.content[0].type !== "text") throw new Error("unexpected response type");
    console.log("✓\n");
  } catch {
    console.log(
      "\nInvalid API key — check console.anthropic.com and try again.\n"
    );
    process.exit(1);
  }

  // ── Step 2: Language selection ──────────────────────────────────────────────
  const langCode = await select({
    message: "Select your team's language:",
    choices: LANGUAGES,
  });

  let effectiveLang = langCode;
  if (langCode === "other") {
    const langName = await input({
      message: "Enter your language (e.g. Korean, Arabic, Farsi):",
      validate: (v) => v.trim().length > 0 || "Please enter a language name.",
    });
    effectiveLang = langName.trim().toLowerCase();
    process.stdout.write(`\nTranslating PitOS to ${langName}... `);
    const bundle = await translateBundle(langName, apiKey);
    if (bundle) {
      loadCustomBundle(bundle);
      console.log("✓\n");
    } else {
      console.log("failed — continuing in English.\n");
    }
  } else {
    loadLanguage(langCode);
    if (langCode !== "en") console.log();
  }

  // ── Steps 3–8: Team + admin details (now localized) ────────────────────────
  const teamNumberRaw = await input({ message: t("prompt_team_number") });
  const teamNumber = teamNumberRaw.trim()
    ? parseInt(teamNumberRaw.trim(), 10)
    : undefined;

  const teamName = await input({
    message: t("prompt_team_name"),
    validate: (v) => v.trim().length > 0 || t("team_name_required"),
  });

  const adminName = await input({ message: t("prompt_admin_name") });

  const adminEmail = await input({
    message: t("prompt_admin_email"),
    validate: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || t("email_invalid"),
  });

  // ── Step 9: Cloudflare Email (optional) ────────────────────────────────────
  console.log();
  const skipCloudflare = await confirm({
    message: t("cloudflare_skip"),
    default: true,
  });

  let cfAccountId = "";
  let cfToken = "";
  let fromEmail = "";

  if (!skipCloudflare) {
    cfAccountId = await input({ message: t("prompt_cf_account") });
    cfToken = await input({ message: t("prompt_cf_token") });
    fromEmail = await input({ message: t("prompt_cf_from") });
  }

  // ── Step 10: Custom domain (optional) ─────────────────────────────────────
  console.log();
  const doDomain = await confirm({
    message: t("domain_prompt"),
    default: false,
  });

  let customDomain = "";
  let cfEmail = "";
  let cfGlobalKey = "";

  if (doDomain) {
    customDomain = await input({
      message: t("prompt_custom_domain"),
      validate: (v) => {
        const d = v.trim();
        return /^[a-zA-Z0-9]([a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}$/.test(d) || t("domain_invalid");
      },
    });
    customDomain = customDomain.trim().toLowerCase();

    cfEmail = await input({
      message: t("prompt_cf_email"),
      validate: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || t("email_invalid"),
    });
    cfEmail = cfEmail.trim();

    cfGlobalKey = await input({ message: t("prompt_cf_global_key") });
    cfGlobalKey = cfGlobalKey.trim();

    // Default FROM_EMAIL to noreply@{customDomain} if not already set
    if (!fromEmail && customDomain) {
      fromEmail = `noreply@${customDomain}`;
    }
  }

  // ── Step 11: Confirmation ──────────────────────────────────────────────────
  const sep = "─".repeat(44);
  console.log(`\n${sep}`);
  console.log(`  Team:   ${teamName}${teamNumber ? ` (#${teamNumber})` : ""}`);
  console.log(`  Admin:  ${adminName || "(unnamed)"} <${adminEmail}>`);
  console.log(`  Email:  ${skipCloudflare ? "console (dev mode)" : fromEmail}`);
  if (customDomain) console.log(`  Domain: ${customDomain}`);
  console.log(`${sep}\n`);

  const proceed = await confirm({ message: t("confirm_proceed"), default: true });
  if (!proceed) {
    console.log("\nAborted.\n");
    process.exit(0);
  }

  // ── Write .env.local ───────────────────────────────────────────────────────
  console.log();
  process.stdout.write(t("setup_env") + " ");
  let written;
  try {
    written = writeEnvFile(
      {
        anthropicApiKey: apiKey,
        cloudflareAccountId: cfAccountId,
        cloudflareEmailApiToken: cfToken,
        fromEmail,
      },
      force
    );
    console.log("✓");
  } catch (e) {
    if (e instanceof Error && e.message === "ENV_EXISTS") {
      console.log(`\n${t("env_exists")}\n`);
      process.exit(1);
    }
    throw e;
  }

  // ── Database + seed ────────────────────────────────────────────────────────
  process.stdout.write(t("setup_db") + " ");
  const signInUrl = setupDatabase({
    email: adminEmail,
    name: adminName,
    teamName,
    teamNumber,
    language: effectiveLang,
    appUrl: "http://localhost:3000",
  });
  console.log("✓");

  // ── Done (local) ───────────────────────────────────────────────────────────
  console.log(`\n${bar}`);
  console.log(`  ${t("setup_complete")}`);
  console.log(`${bar}`);
  console.log(`\n${t("signin_url")}`);
  console.log(`\n  ${signInUrl}\n`);

  // ── Optional: deploy to Vercel ─────────────────────────────────────────────
  console.log(`\n${sep}`);
  console.log(`  ${t("deploy_header")}`);
  console.log(`${sep}`);
  console.log(`${t("deploy_explainer")}`);
  console.log(`\n${t("deploy_warning_db")}\n`);

  const doDeploy = await confirm({ message: t("deploy_prompt"), default: false });

  if (doDeploy) {
    try {
      await runDeployFlow({
        anthropicApiKey: written.anthropicApiKey,
        authSecret: written.authSecret,
        cloudflareAccountId: written.cloudflareAccountId,
        cloudflareEmailApiToken: written.cloudflareEmailApiToken,
        fromEmail: written.fromEmail,
        customDomain,
        cfEmail,
        cfGlobalKey,
      });
      // deploy completed — skip dev-server offer
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`\n${t("deploy_failed")}\n  ${msg}\n`);
      // fall through to dev-server offer
    }
  }

  // ── Optional: start dev server ─────────────────────────────────────────────
  const startDev = await confirm({ message: t("prompt_start_dev"), default: true });

  if (startDev) {
    console.log("\nStarting dev server...\n");
    const child = spawn("npm", ["run", "dev"], { stdio: "inherit" });
    child.on("error", (err) => {
      console.error("Could not start dev server:", err.message);
      console.log("Run manually: npm run dev\n");
    });
  } else {
    console.log("\nRun: npm run dev\n");
  }
}

interface DeployEnvs {
  anthropicApiKey: string;
  authSecret: string;
  cloudflareAccountId: string;
  cloudflareEmailApiToken: string;
  fromEmail: string;
  customDomain?: string;
  cfEmail?: string;
  cfGlobalKey?: string;
}

async function runDeployFlow(envs: DeployEnvs): Promise<void> {
  if (!isVercelInstalled()) {
    console.log(`\n${t("deploy_cli_missing")}\n`);
    throw new Error("vercel_cli_missing");
  }

  // 1. Link (interactive) if not already linked.
  if (!isVercelLinked()) {
    console.log(`\n${t("deploy_linking")}\n`);
    const code = await runInteractive("vercel", ["link"]);
    if (code !== 0 || !isVercelLinked()) {
      throw new Error(t("deploy_link_failed"));
    }
  }

  // 2. Push env vars (everything except APP_URL — we set that after the first deploy).
  console.log(`\n${t("deploy_env_push")}`);
  await pushEnvVars({
    ANTHROPIC_API_KEY: envs.anthropicApiKey,
    AUTH_SECRET: envs.authSecret,
    CLOUDFLARE_ACCOUNT_ID: envs.cloudflareAccountId,
    CLOUDFLARE_EMAIL_API_TOKEN: envs.cloudflareEmailApiToken,
    FROM_EMAIL: envs.fromEmail,
  });

  // 3. First production deploy — we don't know the URL yet.
  console.log(`\n${t("deploy_deploying")}\n`);
  const deployedUrl = await deployProd();

  // 4. Custom domain setup (Cloudflare DNS + Vercel alias).
  let appUrl = deployedUrl;

  if (envs.customDomain && envs.cfEmail && envs.cfGlobalKey) {
    const auth: CfAuth = { email: envs.cfEmail, key: envs.cfGlobalKey };

    console.log(`\n${t("domain_setup_dns")}`);
    const zoneId = await findZone(envs.customDomain, auth);
    if (!zoneId) {
      console.warn(`\n  ${t("domain_zone_not_found", { domain: envs.customDomain })}`);
    } else {
      const result = await setupDomainDns(zoneId, envs.customDomain, auth);
      const lines = [
        `  CNAME  ${result.cname}`,
        `  SPF    ${result.spf}`,
        `  DKIM   ${result.dkim}`,
      ];
      if (result.errors.length) lines.push(...result.errors.map((e) => `  ⚠ ${e}`));
      console.log(lines.join("\n"));

      console.log(`\n${t("domain_setup_vercel")}`);
      try {
        await addVercelDomain(envs.customDomain);
        appUrl = `https://${envs.customDomain}`;
        // Update FROM_EMAIL env if it was auto-derived
        if (envs.fromEmail === `noreply@${envs.customDomain}`) {
          await pushEnvVars({ FROM_EMAIL: envs.fromEmail });
        }
        console.log(`  ${t("domain_setup_done")}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`  ${t("domain_setup_failed")}\n  ${msg}`);
      }
    }
  }

  // 5. Update APP_URL to the final URL, then redeploy so it takes effect.
  console.log(`\n${t("deploy_updating_url")} (${appUrl})`);
  await pushEnvVars({ APP_URL: appUrl });

  console.log(`\n${t("deploy_redeploying")}\n`);
  const finalUrl = await deployProd();

  // 6. Success.
  console.log(`\n${"═".repeat(52)}`);
  console.log(`  ${t("deploy_done")}`);
  console.log(`${"═".repeat(52)}`);
  console.log(`\n  ${finalUrl}/onboarding\n`);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`\n${t("error_prefix")} ${msg}\n`);
  process.exit(1);
});
