import { config } from "dotenv";
import { type Config } from "drizzle-kit";

// drizzle-kit runs as a standalone CLI — unlike `next dev`, it does not load
// `.env.local` on its own (it only auto-loads `.env`). `vercel env pull` writes
// `.env.local`, so load that explicitly here. dotenv does not overwrite vars
// that are already set, so the precedence is: real env > .env.local > .env.
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const url = process.env.POSTGRES_URL;

if (!url) {
  throw new Error(
    "POSTGRES_URL is not set.\n\n" +
      "  1. Run `vercel env pull .env.local` to pull your Vercel env vars.\n" +
      "  2. Open .env.local and confirm a POSTGRES_URL line is present.\n" +
      "     If it is missing, the variable is not set for the environment you\n" +
      "     pulled. Add it in the Vercel dashboard (Settings > Environment\n" +
      "     Variables) for Development, or pull another environment with\n" +
      "     `vercel env pull .env.local --environment=production`.\n",
  );
}

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url },
  tablesFilter: ["crtv_shelves_*"],
} satisfies Config;
