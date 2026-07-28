import type { NextFunction, Request, Response } from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { MulterError } from "multer";
import { pinoHttp } from "pino-http";
import requestIp from "request-ip";
import { limiter, logger } from "#/middlewares/index.js";
import routers from "#/routers/index.js";
import env from "#/utilities/env.js";
import { HttpError, HttpResponse } from "#/utilities/response.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

/** Trust Proxy */
if (env.isProd) {
  app.set("trust proxy", 1);
}

/** Logging */
app.use(pinoHttp({ logger }));

/** Security */
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true, maxAge: 86400 }));
app.use(requestIp.mw());

/** Parsing */
app.use(cookieParser());
app.use(express.json({ limit: env.BODY_LIMIT, strict: true }));
app.use(express.urlencoded({ limit: env.BODY_LIMIT, extended: true }));

/** Compression */
app.use(
  compression({
    filter: (req: Request, res: Response) => {
      if (req.headers.accept === "text/event-stream") return false;
      return compression.filter(req, res);
    },
  })
);

/** Static Files */
app.use(
  express.static(join(__dirname, "../public"), {
    maxAge: "30d",
    immutable: true,
  })
);

/** API Routes */
app.use("/api", limiter(), routers);

app.get("/", (_req: Request, res: Response) => {
  return res.sendFile(join(__dirname, "../public", "index.html"), {
    headers: {
      "Cache-Control": "no-store, must-revalidate",
    },
  });
});

/** Error Handler */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);

  if (err instanceof MulterError) {
    return HttpResponse.error(res, err.code === "LIMIT_FILE_SIZE" ? 413 : 400, `${err.message}!`);
  }

  if (err instanceof HttpError) {
    return HttpResponse.error(res, err.code, err.message);
  }

  req.log.error({ err }, "Unhandled server error!");
  return HttpResponse.error(res, 500, "Internal server error!");
});

export default app;
