import "server-only";
import { join } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { getSql } from "./db";
// Shared with scripts/migrate.mjs so the build and the runtime seed the same content.
import { seedDefaults } from "../../scripts/seed-defaults.mjs";

let running: Promise<{ inserted: number }> | null = null;

/**
 * Creates/updates tables and inserts the default pages + starter articles (once).
 * Runs automatically on the first admin visit, so the site works even if the
 * build-time migration was skipped (e.g. DATABASE_URL added after the first deploy).
 */
export function ensureSetup(force = false) {
  if (!running || force) {
    running = (async () => {
      const sql = getSql();
      await migrate(drizzle(sql), { migrationsFolder: join(process.cwd(), "drizzle") });
      return seedDefaults(sql);
    })().catch((e) => {
      running = null;
      throw e;
    });
  }
  return running;
}
