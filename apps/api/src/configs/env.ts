import { cleanEnv, url, str, port, num, bool } from "envalid";
import "dotenv/config";

const env = cleanEnv(process.env, {
  DATABASE_URL: url(),
  REDIS_URL: url(),
  ACCESS_SECRET: str(),
  ACCESS_EXPIRY: num(),
  REFRESH_SECRET: str(),
  REFRESH_EXPIRY: num(),
  COOKIES_SECRET: str(),
  STRICT_MODE: bool({ default: false }),
  CORS_ORIGIN: str({ default: "*" }),
  BODY_LIMIT: num({ default: 1 }),
  PORT: port({ default: 4000 }),
  NODE_ENV: str({
    choices: ["development", "production"],
    default: "development",
  }),
});

export default env;
