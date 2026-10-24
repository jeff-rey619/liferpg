import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadEnv } from "@/server/env";

const env = loadEnv();

const connectionString =
  env.DATABASE_URL ?? "postgres://liferpg:liferpg@localhost:5432/liferpg";

const client = postgres(connectionString, { max: 10 });

export const db = drizzle(client);
export { client };