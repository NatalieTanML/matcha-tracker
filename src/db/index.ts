import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export { schema };

export function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl, {
    prepare: false, // Required for Supabase pooler and serverless environments
    max: 10,
  });
  return drizzle(client, { schema });
}

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return createDb(databaseUrl);
}

export type Database = ReturnType<typeof createDb>;
