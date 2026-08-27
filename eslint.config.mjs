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
    // Templates are separate applications with their own toolchain — they are
    // shipped as source, not compiled by this project. The demo overlay is
    // fragments of one: it only resolves once scripts/build-demo.mjs has laid
    // it over templates/ai-chat, so linting it here reports missing modules
    // that are not missing.
    "templates/**",
    "demo/**",
    ".demo-build/**",
  ]),
]);

export default eslintConfig;
