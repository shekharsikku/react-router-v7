import { createRedisClients } from "@repo/shared/redis";
import env from "#/configs/env.js";

export const { redisClient, pubClient, subClient } = await createRedisClients(env.REDIS_URL, "wss");
