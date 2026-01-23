import { relations } from "drizzle-orm";
import { users, tokens } from "./schemas.js";

export const usersRelations = relations(users, ({ many }) => ({
  tokens: many(tokens),
}));

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id],
  }),
}));
