#!/usr/bin/env node
// Bootstraps the TypeScript setup wizard via the bundled tsx runner.
// Lets `npx pitos` and `npx github:bcanata/pitos` work without a build step.

const { spawnSync } = require("child_process");
const { join } = require("path");
const { existsSync } = require("fs");

const pkgRoot = join(__dirname, "..");
const tsxBin = join(
  pkgRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tsx.cmd" : "tsx"
);
const script = join(pkgRoot, "cli", "index.ts");

if (!existsSync(tsxBin)) {
  console.error("tsx not found in node_modules. Run `npm install` first.");
  process.exit(1);
}

const result = spawnSync(tsxBin, [script, ...process.argv.slice(2)], {
  stdio: "inherit",
});

if (result.error) {
  console.error("Failed to start pitos:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
