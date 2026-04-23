#!/usr/bin/env node
// Bootstraps the TypeScript setup wizard via tsx.
// Handles npm hoisting: tsx may be in a parent node_modules, not inside this package.

const { spawnSync } = require("child_process");
const { join, dirname } = require("path");
const { existsSync, readFileSync } = require("fs");

const PKG_ROOT = join(__dirname, "..");
const script = join(PKG_ROOT, "cli", "index.ts");

function findTsx() {
  // 1. Resolve tsx via Node's module resolution — handles npm hoisting correctly.
  try {
    const tsxPkg = require.resolve("tsx/package.json", { paths: [PKG_ROOT] });
    const tsxDir = dirname(tsxPkg);
    const tsxPkgJson = JSON.parse(readFileSync(tsxPkg, "utf8"));
    const binRelPath = typeof tsxPkgJson.bin === "string"
      ? tsxPkgJson.bin
      : (tsxPkgJson.bin?.tsx ?? "dist/cli.mjs");
    const cli = join(tsxDir, binRelPath);
    if (existsSync(cli)) return { cmd: process.execPath, args: [cli] };
  } catch {}

  // 2. Walk up directory tree looking for tsx in .bin (belt-and-suspenders).
  const binName = process.platform === "win32" ? "tsx.cmd" : "tsx";
  let dir = PKG_ROOT;
  while (true) {
    const candidate = join(dir, "node_modules", ".bin", binName);
    if (existsSync(candidate)) return { cmd: candidate, args: [] };
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return null;
}

const tsx = findTsx();
if (!tsx) {
  console.error(
    "Error: tsx not found. This is unexpected — please file an issue at\n" +
    "https://github.com/bcanata/pitos/issues"
  );
  process.exit(1);
}

const result = spawnSync(tsx.cmd, [...tsx.args, script, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error("Failed to start pitos:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
