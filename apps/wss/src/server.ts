import { createServer } from "node:http";
import { createAdapter } from "@socket.io/redis-adapter";
import { Server } from "socket.io";

import env from "#/configs/env.js";
import { pubClient, subClient } from "#/configs/redis.js";

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
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

export default server;
