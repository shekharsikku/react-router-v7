import { serve } from "@hono/node-server";
import app from "#/app.js";
import env from "#/configs/env.js";
import { pubClient } from "#/configs/redis.js";

const port = env.PORT;

app.get("/", async (c) => {
  const payload = { message: "Hello Hono!" };
  const res = await pubClient.publish("notifications", JSON.stringify(payload));
  return c.json({ ...payload, res });
});

serve({ fetch: app.fetch, port: port }, (info) => {
  console.log(`Hono server listening on port: ${info.port}`);
});
