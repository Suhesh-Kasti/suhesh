import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Reading localStorage, matchMedia and other browser-only sources has to happen after
      // mount so the server and first client render agree. That one extra render is intended,
      // not the cascading-render bug this rule is aimed at.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Content and vendored vault plugins are data, not app source.
    "content/**",
    "public/**",
    // Build-time generated MDX modules.
    "src/generated/**",
  ]),
]);

export default eslintConfig;
