import { defineConfig } from "drizzle-kit";
import { loadEnv } from "./src/server/env";

const env = loadEnv();

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL ?? "postgres://liferpg:liferpg@localhost:5432/liferpg",
  },
});