import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { defineConfig } from "drizzle-kit";

const env = dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });
dotenvExpand.expand(env);

export default defineConfig({
  out: "./infra/database/migrations",
  schema: "./infra/database/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
