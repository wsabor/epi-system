import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Em dev as variáveis vêm do .env da raiz; no Docker vêm do compose e o arquivo não existe.
const envFile = new URL("../.env", import.meta.url);
if (existsSync(envFile)) process.loadEnvFile(envFile);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
