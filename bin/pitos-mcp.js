#!/usr/bin/env node
// Bootstraps the MCP stdio server via the bundled tsx runner.

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
const script = join(pkgRoot, "mcp", "server.ts");

if (!existsSync(tsxBin)) {
  console.error("tsx not found in node_modules. Run `npm install` first.");
  process.exit(1);
}

const result = spawnSync(tsxBin, [script, ...process.argv.slice(2)], {
  stdio: "inherit",
});

if (result.error) {
  console.error("Failed to start pitos-mcp:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
