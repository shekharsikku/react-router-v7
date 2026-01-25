import { redisClient } from "#/configs/redis.js";
import { io } from "#/server.js";

export const redisKeys = {
  userSockets: (uid: string) => `user:sockets:${uid}`,
  socketUser: (sid: string) => `socket:user:${sid}`,
  usersOnline: () => `users:online`,
};

export const onlineSnapshot = async (): Promise<Record<string, string[]>> => {
  const users = await redisClient.sMembers(redisKeys.usersOnline());

  const entries = await Promise.all(
    users.map(async (uid) => {
      const sockets = await redisClient.sMembers(redisKeys.userSockets(uid));
      return [uid, sockets] as const;
    })
  );

  return Object.fromEntries(entries);
};

export const emitToUser = async (uid: string, event: string, payload: any) => {
  const sockets = await redisClient.sMembers(redisKeys.userSockets(uid));
  io.to(sockets).emit(event, payload);
};
