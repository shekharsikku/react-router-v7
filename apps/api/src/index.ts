import { serve } from "@hono/node-server";
import env from "#/configs/env.js";
import app from "#/app.js";

const port = env.PORT;

serve({ fetch: app.fetch, port: port }, ({ port }) => {
  console.log(`Hono server listening on port: ${port}`);
});
