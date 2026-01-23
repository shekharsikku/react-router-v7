import { serve } from "@hono/node-server";
import { db } from "#/database/drizzle.js";
import env from "#/configs/env.js";
import app from "#/app.js";

async function assertConnection() {
  try {
    const [result] = await db.execute<{ value: number }>("select 1 as value");
    console.log("Database connection success:", result?.value);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

void (async () => {
  /** Basic Check for Database Connection */
  await assertConnection();

  /** Running Node.js Hono Server */
  serve({ fetch: app.fetch, port: env.PORT }, ({ port }) => {
    console.log(`Hono server listening on port: ${port}`);
  });
})();
