import { randomBytes, createHash } from "node:crypto";
import { setSignedCookie } from "hono/cookie";
import { SignJWT } from "jose";
import env from "#/configs/env.js";
import type { Users } from "#/database/schemas.js";
import type { Context } from "hono";
import type { Options } from "argon2";

export const generateAccess = async (ctx: Context, uid: string) => {
  const accessExpiry = env.ACCESS_EXPIRY;
  const accessSecret = new TextEncoder().encode(env.ACCESS_SECRET);

  const accessToken = await new SignJWT({ uid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${accessExpiry}sec`)
    .sign(accessSecret);

  await setSignedCookie(ctx, "access", accessToken, env.COOKIES_SECRET, {
    httpOnly: true,
    sameSite: "strict",
    secure: env.isProd,
    maxAge: accessExpiry,
  });

  return accessToken;
};

export const generateRefresh = async (ctx: Context, uid: string) => {
  const refreshExpiry = env.REFRESH_EXPIRY;
  const refreshSecret = new TextEncoder().encode(env.REFRESH_SECRET);

  const refreshToken = await new SignJWT({ uid })
    .setProtectedHeader({ alg: "HS512" })
    .setIssuedAt()
    .setExpirationTime(`${refreshExpiry}sec`)
    .sign(refreshSecret);

  await setSignedCookie(ctx, "refresh", refreshToken, env.COOKIES_SECRET, {
    httpOnly: true,
    sameSite: "strict",
    secure: env.isProd,
    maxAge: refreshExpiry * 2,
  });

  return refreshToken;
};

export const generateHash = async (token: string) => {
  return createHash("sha256").update(token).digest("hex");
};

export const generateUsername = (email: string) => {
  const [local] = email.split("@");

  if (!local) {
    throw new Error("Invalid email address!");
  }

  const basePart = local.split(".")[0];
  const uniqueSuffix = Date.now().toString(36);

  return `${basePart}_${uniqueSuffix}`;
};

export const createUserInfo = (user: Users) => {
  if (!user.setup) {
    return {
      id: user.id.toString(),
      email: user.email,
      setup: user.setup,
    };
  }
  return {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    username: user.username,
    gender: user.gender,
    bio: user.bio,
    image: user.image,
    setup: user.setup,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const argonOptions: Options = {
  hashLength: 48,
  timeCost: 4,
  memoryCost: 2 ** 16,
  parallelism: 2,
  type: 2,
  salt: randomBytes(32),
};
