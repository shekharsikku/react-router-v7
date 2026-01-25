import { createServer } from "node:http";
import { createAdapter } from "@socket.io/redis-adapter";
import { Server } from "socket.io";
import { redisClient, pubClient, subClient } from "#/configs/redis.js";
import { redisKeys, onlineSnapshot } from "#/utils/helpers.js";
import env from "#/configs/env.js";

const server = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: "Socket.io server actively listening!",
    })
  );
});

export const io = new Server(server, {
  cors: { origin: env.CORS_ORIGIN, credentials: true },
});

io.adapter(createAdapter(pubClient, subClient));

subClient.subscribe("notifications", (message) => {
  console.log("Payload at wss:", JSON.parse(message));
  io.emit("notifications", JSON.parse(message));
});

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.uid as string;

  if (!userId) {
    socket.disconnect(true);
    return;
  }

  const socketCount = await redisClient
    .multi()
    .sAdd(redisKeys.userSockets(userId), socket.id)
    .set(redisKeys.socketUser(socket.id), userId)
    .sCard(redisKeys.userSockets(userId))
    .exec()
    .then((result) => Number(result[2]));

  if (Number.isNaN(socketCount)) return;

  if (socketCount === 1) {
    await redisClient.sAdd(redisKeys.usersOnline(), userId);
  }

  io.emit("users:online", await onlineSnapshot());
  console.log(`User ${userId} connected with socket ${socket.id}`);

  socket.on("disconnect", async () => {
    const userId = await redisClient.get(redisKeys.socketUser(socket.id));
    if (!userId) return;

    const socketCount = await redisClient
      .multi()
      .sRem(redisKeys.userSockets(userId), socket.id)
      .del(redisKeys.socketUser(socket.id))
      .sCard(redisKeys.userSockets(userId))
      .exec()
      .then((result) => Number(result[2]));

    if (Number.isNaN(socketCount)) return;

    if (socketCount === 0) {
      await redisClient
        .multi()
        .del(redisKeys.userSockets(userId))
        .sRem(redisKeys.usersOnline(), userId)
        .exec()
        .then(() => console.log(`No any active socket for user ${userId}`));
    }

    io.emit("users:online", await onlineSnapshot());
    console.log(`Socket ${socket.id} disconnected of user ${userId}`);
  });
});

export default server;
