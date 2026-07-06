import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  esbuild: {
    target: "node22",
  },
  resolve: {
    alias: {
      "@repo/db": path.resolve(__dirname, "../../packages/db/src/index.ts"),
      "@repo/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
    },
    extensions: [".ts", ".js"],
  },
  test: {
    globals: false,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ["tests/setup.ts"],
    pool: "forks",
  },
});
