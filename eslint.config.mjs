import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // bin/*.js are package CLI entry points — intentionally CJS so they run
  // standalone via `npx` regardless of the host package's "type" field.
  // The require()/__dirname patterns are correct here.
  {
    files: ["bin/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Seed-data files are large hand-curated arrays. They keep a header block
  // of user-id constants for documentation even when a particular file
  // doesn't reference every member — silencing the warning is intentional.
  {
    files: ["scripts/seed-data/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
]);

export default eslintConfig;
