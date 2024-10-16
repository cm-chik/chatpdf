//Tell Drizzle where our schema is
import { defineConfig, Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" }); //load env and we can access env variables

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
}) satisfies Config;
