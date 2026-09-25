# Lottery Sambad Plus — lotterysambad.plus

Premium, fast Lottery Sambad (Dear Lottery) results website with automatic scraping, admin dashboard, auto-updating sitemap and full SEO setup.

**Stack:** Next.js 16 (App Router) · Tailwind CSS 4 · Drizzle ORM · Neon Postgres · Vercel (+ optional Vercel Blob) · cheerio + sharp for scraping/images.

---

## What's inside

**Public site**

| Page | URL | Target keywords |
| --- | --- | --- |
| Home (today's 3 draws live, 7-day table, timings, FAQ) | `/` | lottery sambad, lottery sambad result today, lottery results |
| 1 PM live result | `/lottery-sambad-1pm-result` | lottery sambad 1pm, 1 pm result, dear morning |
| 6 PM live result | `/lottery-sambad-6pm-result` | 6 pm result, dear day |
| 8 PM live result | `/lottery-sambad-8pm-result` | 8 pm result, dear night |
| Today — all draws, full prize list | `/lottery-sambad-today` | lottery sambad today |
| Yesterday result | `/lottery-sambad-yesterday-result` | lottery sambad yesterday |
| Day archive (auto-created) | `/result/25-09-2026` | lottery sambad 25.09.2026 |
| Single draw (auto-created "article") | `/result/25-09-2026/8pm` | lottery sambad 8pm 25.09.2026 |
| Old results (calendar + months) | `/old-results`, `/old-results/2026-09` | lottery sambad old result |
| 30-day chart | `/lottery-sambad-chart` | lottery sambad chart |
| Draw schedule & prizes | `/lottery-sambad-draw-schedule` | dear lottery schedule |
| Ticket checker | `/check-ticket` | check lottery ticket |
| Guides (blog) | `/blog`, `/blog/[slug]` | |
| Legal pages (editable) | `/privacy-policy`, `/disclaimer`, `/dmca`, `/content-policy`, `/terms-and-conditions`, `/about-us`, `/contact-us` | |

Plus: real-time IST clock + next-draw countdown, dark mode, mobile bottom navigation, result in **text + image** (download button), "find my number" highlighter, share buttons, per-result OG images, JSON-LD (NewsArticle, FAQPage, BreadcrumbList, WebSite, Organization), `sitemap.xml`, `robots.txt`, `ads.txt`, `manifest.webmanifest`, favicon/app icons. Footer carries the small educational-purpose disclaimer.

Pages are static (ISR) and are re-generated **instantly** whenever the scraper saves a new result, so they load in milliseconds. While a draw is due, open pages poll a tiny cached status API and refresh themselves the moment the result is published.

**Admin dashboard** (`/admin`)

Dashboard (today's 3 draws, "Fetch now", cron URL, import old results) · Results (list / edit / add manually / re-fetch / lock / upload image) · Articles (Markdown editor with image upload & preview) · Pages · Media · Ads & ads.txt (AdSense ID + 7 ad placements) · SEO & Analytics (GA4, Search Console & Bing verification, IndexNow, robots rules, custom scripts) · Settings (site name, logo, footer text, social links, prize amounts, weekly draw names, scraper on/off) · Scraper logs.

---

## How the automatic result scraping works

1. An external cron pings `GET /api/cron/scrape?key=CRON_SECRET` **every minute**.
2. Outside draw windows it returns instantly (no DB/network work). Inside the windows
   (IST **1:03–3:30 PM**, **6:03–8:30 PM**, **8:03–10:30 PM**) it scrapes the due draw.
3. Sources are fetched in parallel: `sambad.com/today-{1pm|6pm|8pm}`, `lottery.sambad.com/today/{1|6|8}-pm/`, `sambad.com/DD-MM-YYYY`. The parsers read prize labels + number formats (not CSS classes) so small redesigns don't break them.
4. Safety checks: the page must show the **requested date** (result-image file name or date text), and a new 1st prize can never equal a previous draw (prevents publishing yesterday's result).
5. The result image is copied from the source (`lottery-sambad-{slot}-{DD-MM-YYYY}.jpg/.webp`), converted to optimised WebP and served from your own domain (`/media/...`).
6. The draw is saved → all pages + sitemap are revalidated → IndexNow ping (if configured). Once a draw has all tiers + image it's marked **complete** and not fetched again.
7. A daily Vercel Cron (`/api/cron/catchup`, ~10:10 PM IST) fills anything missed in the last 2 days. Admin → Dashboard → **Import old results** back-fills any date range.

Every run is visible in **Admin → Scraper logs**. If a source changes its layout, results can always be added/edited manually (and **locked** so the scraper never overwrites them).

---

## Deploy (≈15 minutes)

### 1. Database — Neon (free)
1. Create a project at <https://neon.tech> — pick the region closest to India (e.g. AWS Asia Pacific / Singapore).
2. Copy the **pooled** connection string (host contains `-pooler`).

### 2. Code — GitHub
```bash
git init && git add . && git commit -m "lotterysambad.plus"
git branch -M main
git remote add origin https://github.com/<you>/lotterysambad-plus.git
git push -u origin main
```

### 3. Hosting — Vercel
1. Vercel → **Add New Project** → import the repo (framework: Next.js, defaults are fine).
2. **Environment variables** (see `.env.example`): `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL=https://lotterysambad.plus`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `CRON_SECRET`.
   Generate secrets with `openssl rand -hex 32`.
3. *(Recommended)* Storage → **Create Blob store** → connect to the project (adds `BLOB_READ_WRITE_TOKEN`). Without it, images are stored in Postgres (fine to start; ~100 KB per image).
4. Deploy. The `vercel-build` script runs the database migrations and creates the default legal pages automatically.
5. Settings → Functions → set the function region to the **same region as your Neon database** (e.g. Singapore `sin1`) so database calls stay fast (optional but recommended).

### 4. Domain
Vercel → Project → Settings → Domains → add `lotterysambad.plus` (and `www` redirect). Point DNS at your registrar as Vercel shows (A `76.76.21.21` / CNAME `cname.vercel-dns.com`).

### 5. Every-minute trigger — cron-job.org (free)
1. Sign up at <https://cron-job.org> → **Create cronjob**.
2. URL: `https://lotterysambad.plus/api/cron/scrape?key=YOUR_CRON_SECRET`
3. Schedule: **every 1 minute** (or custom: minutes `*`, hours `12-22`, timezone **Asia/Kolkata**). Save.
4. That's it — results now appear within ~1 minute of publication.

> Vercel's own Cron on the free Hobby plan only runs once a day, which is why an external 1-minute pinger is used. On Vercel Pro you can instead add `{"path": "/api/cron/scrape", "schedule": "* * * * *"}` to `vercel.json`. An optional GitHub Actions fallback is in `.github/workflows/scrape-cron.yml`.

### 6. First run
1. Open `https://lotterysambad.plus/admin`, sign in.
2. Dashboard → **Import old results** → choose e.g. the last 30–60 days → Import.
3. Admin → Settings: check site name, contact email, social links. Admin → Pages: review legal pages.
4. Admin → SEO: add GA4 ID + Search Console verification, then submit `https://lotterysambad.plus/sitemap.xml` in Search Console.
5. Admin → Ads: after AdSense approval add your `ca-pub-…` ID and ad codes; `ads.txt` is generated automatically.

---

## Local development

```bash
cp .env.example .env.local        # fill DATABASE_URL etc.
npm install
npm run db:migrate
npm run dev                       # http://localhost:3000  (admin: /admin)
```

Test the scraper offline with the bundled mock of the source sites:

```bash
node scripts/dev/mock-sources.mjs          # MOCK_ALL=1 to publish today's draws too
# .env.local → SCRAPER_MOCK_ORIGIN=http://localhost:4010
curl "http://localhost:3000/api/cron/scrape?key=$CRON_SECRET&mode=catchup&days=7"
npm run test:parser                        # parser unit tests (fixtures in scripts/fixtures)
```

Useful endpoints:
- `/api/cron/scrape?key=…` – auto mode (inside draw windows only)
- `/api/cron/scrape?key=…&mode=catchup&days=3` – fill missing draws of the last N days (max 7)
- `/api/cron/scrape?key=…&mode=force&date=25-09-2026&slot=8pm` – re-fetch one draw

## Project structure

```
src/app/(site)/…         public pages (ISR)
src/app/admin/…          admin dashboard + server actions (actions.ts)
src/app/api/cron/…       scraper triggers
src/app/media/[...key]   image server (DB or Blob) with 1-year immutable caching
src/lib/scraper/         sources.ts (URLs), parse.ts (parsers), index.ts (merge/save)
src/lib/db/schema.ts     tables: results, media, posts, pages, settings, scrape_logs
drizzle/                 SQL migrations  (npm run db:generate after schema changes)
scripts/                 migrate.mjs, default legal pages, parser tests, dev mock server
```

## Notes
- Neon free tier auto-suspends when idle; pages are static and the scraper only touches the DB inside draw windows, keeping usage low.
- Prize amounts and weekly draw names are editable in Admin → Settings (verify with the official notification).
- The site is informational only; keep the footer disclaimer and link users to the official gazette.
