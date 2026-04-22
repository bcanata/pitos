/**
 * Vercel deployment helpers for the PitOS CLI setup wizard.
 *
 * Thin wrappers around the `vercel` CLI. Not a general-purpose SDK —
 * just enough to push env vars + deploy from the setup flow.
 */

import { spawn, spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export function isVercelInstalled(): boolean {
  try {
    const r = spawnSync("vercel", ["--version"], { encoding: "utf8" });
    return r.status === 0;
  } catch {
    return false;
  }
}

export function isVercelLinked(): boolean {
  return existsSync(join(process.cwd(), ".vercel", "project.json"));
}

export function readLinkedProjectName(): string | null {
  try {
    const p = join(process.cwd(), ".vercel", "project.json");
    const parsed = JSON.parse(readFileSync(p, "utf8")) as { projectName?: string };
    return parsed.projectName ?? null;
  } catch {
    return null;
  }
}

/** Run a command with the user's terminal attached (for `vercel login`, `vercel link`). */
export function runInteractive(cmd: string, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

type VercelEnv = "production" | "preview" | "development";

/**
 * Push a single env var to Vercel.
 * Removes any existing value first (idempotent), then adds the new one via stdin.
 */
export async function pushEnvVar(
  name: string,
  value: string,
  envs: VercelEnv[]
): Promise<void> {
  for (const env of envs) {
    // Silently remove if present — ignore errors (var may not exist yet).
    await new Promise<void>((resolve) => {
      const rm = spawn("vercel", ["env", "rm", name, env, "-y"], {
        stdio: "ignore",
      });
      rm.on("exit", () => resolve());
      rm.on("error", () => resolve());
    });

    // Add via stdin.
    await new Promise<void>((resolve, reject) => {
      const add = spawn("vercel", ["env", "add", name, env], {
        stdio: ["pipe", "pipe", "pipe"],
      });
      let stderr = "";
      add.stderr.on("data", (d) => (stderr += d.toString()));
      add.on("error", (e) => reject(e));
      add.on("exit", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`vercel env add ${name} (${env}) failed: ${stderr.trim()}`));
      });
      add.stdin.write(value + "\n");
      add.stdin.end();
    });
  }
}

export async function pushEnvVars(
  vars: Record<string, string>,
  envs: VercelEnv[] = ["production", "preview", "development"]
): Promise<void> {
  for (const [name, value] of Object.entries(vars)) {
    if (!value) continue; // skip empty values (optional vars)
    await pushEnvVar(name, value, envs);
  }
}

/**
 * Run `vercel --prod --yes`, stream output to user, extract the final URL.
 */
export async function deployProd(): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("vercel", ["--prod", "--yes"], {
      stdio: ["inherit", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d: Buffer) => {
      const s = d.toString();
      stdout += s;
      process.stdout.write(s);
    });
    child.stderr.on("data", (d: Buffer) => {
      const s = d.toString();
      stderr += s;
      process.stderr.write(s);
    });

    child.on("error", (e) => reject(e));
    child.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`vercel --prod exited with code ${code}`));
        return;
      }
      // Vercel prints the production URL to stdout and/or stderr.
      // Look for https://....vercel.app (may be a custom alias too, but .vercel.app is the default).
      const combined = stdout + stderr;
      const match =
        combined.match(/https:\/\/[a-zA-Z0-9-]+\.vercel\.app/) ??
        combined.match(/https:\/\/[^\s"]+/);
      if (!match) {
        reject(new Error("deployed but could not parse URL from Vercel output"));
        return;
      }
      resolve(match[0]);
    });
  });
}
