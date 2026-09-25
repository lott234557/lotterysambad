// Inserts default legal pages and starter articles ONCE (tracked in settings.key = 'seed'),
// so pages/articles deleted by the admin are not re-created on the next deploy.
import { DEFAULT_PAGES } from "./default-pages.mjs";
import { DEFAULT_ARTICLES } from "./default-articles.mjs";

/** @param {import('postgres').Sql} sql */
export async function seedDefaults(sql) {
  // value::text keeps this independent of the client's json/date parsers (drizzle overrides them)
  const rows = await sql`select value::text as v from settings where key = 'seed'`;
  const done = rows[0]?.v ? JSON.parse(rows[0].v) : {};
  let inserted = 0;

  if (!done.pages) {
    for (const p of DEFAULT_PAGES) {
      const r = await sql`
        insert into pages (slug, title, content, meta_description, sort_order, show_in_footer, status)
        values (${p.slug}, ${p.title}, ${p.content}, ${p.metaDescription}, ${p.sortOrder}, true, 'published')
        on conflict (slug) do nothing`;
      inserted += r.count;
    }
    done.pages = 1;
  }

  if (!done.articles) {
    let i = 0;
    for (const a of DEFAULT_ARTICLES) {
      const at = new Date(Date.now() - (DEFAULT_ARTICLES.length - i++) * 60_000).toISOString();
      const r = await sql`
        insert into posts (slug, title, excerpt, content, meta_description, status, published_at, created_at, updated_at)
        values (${a.slug}, ${a.title}, ${a.excerpt}, ${a.content}, ${a.metaDescription}, 'published', ${at}, ${at}, ${at})
        on conflict (slug) do nothing`;
      inserted += r.count;
    }
    done.articles = 1;
  }

  await sql`
    insert into settings (key, value, updated_at) values ('seed', ${JSON.stringify(done)}::jsonb, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()`;
  return { inserted };
}
