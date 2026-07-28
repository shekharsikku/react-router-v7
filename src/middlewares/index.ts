import { rateLimit } from "express-rate-limit";
import multer from "multer";
import pino from "pino";
import env from "#/utilities/env.js";
import { HttpError, HttpResponse } from "#/utilities/response.js";

/** Multer File Uploader */
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new HttpError(422, "Only image files are allowed!"));
    }
  },
  limits: {
    files: 1,
    fileSize: 10 * 1024 * 1024,
  },
});

/** Rate Limiter */
export const limiter = (minute = 10, limit = 1000) => {
  return rateLimit({
    windowMs: minute * 60 * 1000,
    limit: limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.clientIp!;
    },
    handler: (req, res) => {
      req.log.error("Rate limit exceeded for ip: %s", req.clientIp);
      return HttpResponse.error(res, 429, "You've made too many requests!");
    },
  });
};

const otherOptions = env.isDev ? { transport: { target: "pino-pretty", options: { colorize: true } } } : { base: null };

/** Pino Http Logger */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: ["req.headers.cookie", "res.headers['set-cookie']", "res.headers['content-security-policy']"],
    remove: true,
  },
  msgPrefix: "[SYNCHRONOUS] ",
  ...otherOptions,
});
