import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "~/env";
import * as schema from "./schema";

// No dotenv call here on purpose: Next.js loads `.env.local` before any app
// code runs. A `config()` call in this file would be dead weight anyway — ES
// module imports are hoisted, so `~/env` validates before the call executes.
// The drizzle-kit CLI is the one that needs explicit loading; see drizzle.config.ts.
const sql = neon(env.POSTGRES_URL);

export const db = drizzle({ client: sql, schema });
