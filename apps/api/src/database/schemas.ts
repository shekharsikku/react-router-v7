import { pgTable, bigint, varchar, text, boolean, timestamp, pgEnum, uniqueIndex, index } from "drizzle-orm/pg-core";
import { Snowflake } from "@sapphire/snowflake";

export function generateSnowflake() {
  const epoch = new Date("2000-01-01T00:00:00.000Z");
  const snowflake = new Snowflake(epoch);
  return snowflake.generate();
}

export const genderEnum = pgEnum("gender", ["Male", "Female", "Other"]);

export const users = pgTable(
  "users",
  {
    id: bigint("id", { mode: "bigint" }).primaryKey().$defaultFn(generateSnowflake),

    name: varchar("name", { length: 255 }),

    email: varchar("email", { length: 255 }).notNull().unique(),

    username: varchar("username", { length: 255 }).unique(),

    password: text("password").notNull(),

    gender: genderEnum(),

    image: text("image"),

    bio: text("bio"),

    setup: boolean("setup").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    {
      emailIdx: uniqueIndex("users_email_unique").on(table.email),
      usernameIdx: uniqueIndex("users_username_unique").on(table.username),
    },
  ]
);

export const tokens = pgTable(
  "tokens",
  {
    id: bigint("id", { mode: "bigint" }).primaryKey().$defaultFn(generateSnowflake),

    userId: bigint("user_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    tokenHash: text("token_hash").notNull().unique(),

    revoked: boolean("revoked").notNull().default(false),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  },
  (table) => [
    {
      userIdx: index("refresh_tokens_user_idx").on(table.userId),
      tokenIdx: index("refresh_tokens_token_idx").on(table.tokenHash),
    },
  ]
);
