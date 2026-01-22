import { createClient } from "redis";

type RedisClientType = ReturnType<typeof createClient>;

export type RedisClients = {
  redisClient: RedisClientType;
  pubClient: RedisClientType;
  subClient: RedisClientType;
};

export const createRedisClients = async (url: string, service: "api" | "wss"): Promise<RedisClients> => {
  const redisClient = createClient({ url });
  const pubClient = createClient({ url });
  const subClient = pubClient.duplicate();

  redisClient.on("ready", () => console.log(`Redis client ready: ${service}`));
  redisClient.on("error", (err) => console.error(`Redis client error: ${service}`, err));

  await Promise.all([redisClient.connect(), pubClient.connect(), subClient.connect()]);

  return { redisClient, pubClient, subClient };
};
