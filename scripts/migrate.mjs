// Runs Drizzle SQL migrations and inserts default pages. Safe to run on every deploy.
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { DEFAULT_PAGES } from "./default-pages.mjs";

let url = process.env.DATABASE_URL;
if (url) {
  const u = new URL(url);
  for (const k of ["channel_binding", "pgbouncer", "options"]) u.searchParams.delete(k);
  url = u.toString();
}
if (!url) {
  console.warn("[migrate] DATABASE_URL not set – skipping migrations");
  process.exit(0);
}

const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
try {
  await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
  console.log("[migrate] migrations applied");
  for (const p of DEFAULT_PAGES) {
    await sql`
      insert into pages (slug, title, content, meta_description, sort_order, show_in_footer, status)
      values (${p.slug}, ${p.title}, ${p.content}, ${p.metaDescription}, ${p.sortOrder}, true, 'published')
      on conflict (slug) do nothing`;
  }
  console.log("[migrate] default pages ensured");
} catch (e) {
  console.error("[migrate] failed:", e);
  process.exitCode = 1;
} finally {
  await sql.end();
}
