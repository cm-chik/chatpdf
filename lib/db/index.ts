import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

neonConfig.fetchConnectionCache = true; //Cache the connection to the database

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not set");
}

const sql = neon(process.env.POSTGRES_URL);

export const db = drizzle(sql);
