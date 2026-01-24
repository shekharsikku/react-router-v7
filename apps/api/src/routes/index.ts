import { Hono } from "hono";
import authRoutes from "#/routes/auth.js";
import userRoutes from "#/routes/user.js";

const routes = new Hono().route("/auth", authRoutes).route("/user", userRoutes);

export default routes;
