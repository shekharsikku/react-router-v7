import { type Context, Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import env from "#/configs/env.js";
import routes from "#/routes/index.js";
import { pubClient } from "#/configs/redis.js";
import { HttpError, ErrorResponse, SuccessResponse } from "#/utils/response.js";

const app = new Hono({ strict: env.STRICT_MODE });

app.use(logger());

app.use(
  "/api/*",
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    maxAge: 3600,
  })
);

app.use(
  "/api/*",
  bodyLimit({
    maxSize: env.BODY_LIMIT * 1024 * 1024,
    onError: (_ctx: Context) => {
      throw new HttpError(413, "Request payload is too large!");
    },
  })
);

app.use(
  "/api/*",
  rateLimiter({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    keyGenerator: (ctx) => {
      return ctx.req.header("User-Agent") || "Unknown-Agent";
    },
    handler: (_ctx: Context) => {
      throw new HttpError(429, "You've made too many requests!");
    },
  })
);

app.get("/", async (c) => {
  const payload = { message: "Hello Hono!" };
  const res = await pubClient.publish("notifications", JSON.stringify(payload));
  return c.json({ ...payload, res });
});

app.get("/hello", (ctx: Context) => {
  const name = ctx.req.query("name") ?? "Stranger";
  const message = `Hono + Node says hello to ${name}! Ready to serve your requests!`;
  return SuccessResponse(ctx, 200, message);
});

app.route("/api", routes);

app.onError((err: Error, ctx: Context) => {
  if (err instanceof HttpError) {
    return ErrorResponse(ctx, err.code, err.message);
  }
  const message = err.message || "Oops! Something went wrong!";
  console.error(`Server Error: ${message}`);
  return ErrorResponse(ctx, 500, message);
});

app.notFound((ctx: Context) => {
  const message = `Requested url '${ctx.req.path}' not found on the server!`;
  return ErrorResponse(ctx, 404, message);
});

export default app;
