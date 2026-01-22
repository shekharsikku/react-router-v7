import { defineConfig } from "drizzle-kit";
import env from "./src/configs/env.ts";

export default defineConfig({
  out: "./src/database/migrations",
  schema: "./src/database/schemas.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
