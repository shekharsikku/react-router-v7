import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import env from "#/configs/env.js";
import * as schemas from "#/database/schemas.js";
import * as relations from "#/database/relations.js";

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema: { ...schemas, ...relations }, logger: env.isDev });
