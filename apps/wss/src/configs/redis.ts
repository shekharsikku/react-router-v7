import { createClient } from "redis";
import env from "#/configs/env.js";

export const redisClient = createClient({ url: env.REDIS_URL });
export const pubClient = createClient({ url: env.REDIS_URL });
export const subClient = pubClient.duplicate();

redisClient.on("ready", () => console.log("Redis client ready for api!"));
redisClient.on("error", (err) => console.error("Redis client error for api!", err));

await Promise.all([redisClient.connect(), pubClient.connect(), subClient.connect()]);
