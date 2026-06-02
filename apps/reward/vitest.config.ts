import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

const ROOT = path.resolve(".");

// Hand-rolled .env loader (no extra dep). Skips comments + blank lines.
function loadEnv(file: string) {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnv(path.resolve(ROOT, ".env"));

export default defineConfig({
  resolve: {
    alias: {
      "@": ROOT,
    },
  },
  test: {
    environment: "node",
    include: ["tests/server/**/*.test.ts"],
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
