import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import env from "./utils/env.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: env.PAYLOAD_LIMIT,
    strict: true,
  }),
);

app.use(
  express.urlencoded({
    limit: env.PAYLOAD_LIMIT,
    extended: true,
  }),
);

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.set("trust proxy", 1);
  app.use(morgan("tiny"));
  app.use(
    express.static(join(__dirname, "../client/dist"), {
      maxAge: "30d",
      immutable: true,
    }),
  );
}

app.get("/hello", async (req, res) => {
  const to = req.query.to ?? "Unknown";
  const ts = new Date().toISOString();
  const message = `Node + Express says hello to ${to} at ${ts}!`;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return res.status(200).json({ message });
});

app.all("*path", (req, res) => {
  if (env.NODE_ENV === "development") {
    return res
      .status(200)
      .json({ message: "Welcome to node/express backend!" });
  } else {
    return res
      .status(200)
      .sendFile(join(__dirname, "../client/dist", "index.html"), {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
        },
      });
  }
});

app.use((err, _req, res) => {
  console.error(`Error: ${err.message}`);
  res.status(500).json({ message: "Internal server error!" });
});

export default app;
