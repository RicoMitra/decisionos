import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["**/node_modules/**", "**/.pnpm-store/**", "**/Dan-Agent-F/**", "**/.next/**", "**/output/**", "**/tmp/**"],
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
