// Runs Drizzle SQL migrations and seeds default pages/articles. Safe to run on every deploy.
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { seedDefaults } from "./seed-defaults.mjs";

let url = process.env.DATABASE_URL;
if (!url) {
  console.warn("[migrate] ⚠ DATABASE_URL is not set – skipping migrations. Add it in Vercel → Settings → Environment Variables and redeploy.");
  process.exit(0);
}
const u = new URL(url);
for (const k of ["channel_binding", "pgbouncer", "options"]) u.searchParams.delete(k);
url = u.toString();

const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
try {
  await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
  console.log("[migrate] migrations applied");
  const { inserted } = await seedDefaults(sql);
  console.log(`[migrate] default content ensured (${inserted} new rows)`);
} catch (e) {
  console.error("[migrate] failed:", e);
  process.exitCode = 1;
} finally {
  await sql.end();
}
