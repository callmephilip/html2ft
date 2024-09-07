/// <reference types="vitest" />

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
    exclude: ["**/src/**", "**/node_modules/**", "**/samples/**", "out/**"],
  },
  base: "./src/",
});
