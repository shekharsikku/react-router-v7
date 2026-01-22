import { cleanEnv, url, str, port } from "envalid";
import "dotenv/config";

const env = cleanEnv(process.env, {
  REDIS_URL: url(),
  CORS_ORIGIN: str({ default: "*" }),
  PORT: port({ default: 5000 }),
  NODE_ENV: str({
    choices: ["development", "production"],
    default: "development",
  }),
});

export default env;
