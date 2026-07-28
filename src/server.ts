import { createServer } from "node:http";
import type { Request, Response } from "express";
import { ExpressPeerServer } from "peer";
import { logger } from "#/middlewares/index.js";
import { HttpResponse } from "#/utilities/response.js";
import env from "#/utilities/env.js";
import app from "#/app.js";

const server = createServer(app);

const peerServer = ExpressPeerServer(server, {
  corsOptions: {
    origin: env.CORS_ORIGIN,
    credentials: true,
    maxAge: 86400,
  },
  allow_discovery: env.isDev,
});

peerServer.on("connection", (client) => {
  logger.info("Peer connected: %s", client.getId());
});

peerServer.on("disconnect", (client) => {
  logger.info("Peer disconnected: %s", client.getId());
});

app.use("/synchronous", peerServer);

app.use((req: Request, res: Response) => {
  return HttpResponse.error(res, 404, `Requested url '${req.url}' no found!`);
});

export default server;
