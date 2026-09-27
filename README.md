# Lottery Sambad Plus — lotterysambad.plus

Premium, fast Lottery Sambad (Dear Lottery) results website with automatic scraping, admin dashboard, auto-updating sitemap and full SEO setup.

**Stack:** Next.js 16 (App Router) · Tailwind CSS 4 · Drizzle ORM · Neon Postgres · Vercel (+ optional Vercel Blob) · cheerio + sharp for scraping/images.

---

## What's inside

**Public site**

| Page | URL | Target keywords |
| --- | --- | --- |
| Home (today's 3 draws live, stats, 7-day table, timings, series chart, all-India comparison table + charts, long-form content, FAQ) | `/` | lottery sambad, lottery sambad result today, lottery results, lottery fax |
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
| All Indian lotteries compared (Kerala, Punjab, West Bengal, Sikkim, Maharashtra, legal states, fax) | `/indian-lotteries` | kerala lottery vs lottery sambad, lotteries in india, lottery fax |
| Kerala lottery result (live + date archive) | `/kerala-lottery-result`, `/kerala-lottery-result/25-09-2026` | kerala lottery result today |
| Punjab State lottery result | `/punjab-state-lottery-result`, `/punjab-state-lottery-result/26-09-2026` | punjab state lottery result, dear 50 |
| Maharashtra lottery result | `/maharashtra-lottery-result`, `/maharashtra-lottery-result/25-09-2026` | maharashtra lottery result |
| West Bengal State lottery result (Dear 1/6/8 PM + official WB draws) | `/west-bengal-state-lottery-result` | west bengal state lottery result |
| Guides (blog) | `/blog`, `/blog/[slug]` | |
| Legal pages (editable) | `/privacy-policy`, `/disclaimer`, `/dmca`, `/content-policy`, `/terms-and-conditions`, `/about-us`, `/contact-us` | |

Plus: real-time IST clock + next-draw countdown, dark mode, mobile bottom navigation, result in **text + image** (download button), "find my number" highlighter, share buttons, per-result OG images, JSON-LD (NewsArticle, FAQPage, BreadcrumbList, WebSite, Organization), `sitemap.xml`, `robots.txt`, `ads.txt`, `manifest.webmanifest`, favicon/app icons. Footer carries the small educational-purpose disclaimer.

**Languages:** every page above except the blog and legal pages also exists in Hindi (`/hi/…`), Bengali (`/bn/…`) and Malayalam (`/ml/…`), e.g. `/hi/lottery-sambad-8pm-result`. On the first visit the site reads the browser language and opens the matching version automatically; the language button in the header remembers the reader's choice (cookie `lang`). Search engines get `hreflang` links on every page and in the sitemap, and bots are never redirected.

Pages are static (ISR) and are re-generated **instantly** whenever the scraper saves a new result, so they load in milliseconds. While a draw is due, open pages poll a tiny cached status API and refresh themselves the moment the result is published.

**Admin dashboard** (`/admin`)

Dashboard (today's 3 draws, "Fetch now", cron URL, import old results) · Results (list / edit / add manually / re-fetch / lock / upload image) · Articles (Markdown editor with image upload & preview) · Pages · Media · Ads & ads.txt (AdSense ID + 7 ad placements) · SEO & Analytics (GA4, Search Console & Bing verification, IndexNow, robots rules, custom scripts) · Settings (site name, logo, footer text, social links, prize amounts, weekly draw names, scraper on/off) · Scraper logs.

The four state-lottery pages are **not in the menu** – they are linked from the comparison table, the “When do results come out” chart, `/indian-lotteries` and each other's sidebar.

---

## Other state lotteries (Kerala · Punjab · Maharashtra · West Bengal)

| Lottery | Auto-fetch window (IST) | Built-in sources | What is shown |
| --- | --- | --- | --- |
| Kerala | 3:02 – 6:30 PM (every 60 s until 4:45, then 4 min) | keralalotteries.net, keralalotteryresult.net (post for the date found on the home page / month archive) | full prize list (1st – 9th, consolation), ticket finder |
| Maharashtra | 4:20 – 7:30 PM (every 90 s, then 5 min) | goodreturns.in weekly / monthly / bumper pages for the date | every draw of the day with all prize tiers |
| Punjab | 6:35 – 9:45 PM (every 90 s, then 5 min) | goodreturns.in (1st prize) + punjablotterynews.com / punjabstatelotteryresult.com (official result-sheet image) | 1st prize + full result image per draw |
| West Bengal | – | uses the Lottery Sambad 1/6/8 PM results (what “West Bengal lottery result” searches mean) | Dear draws live + any official WB draw you add |

- Results are stored in the `lottery_draws` table (created automatically on deploy). All four use the same auto-fetch as the 1/6/8 PM draws (visitors, dashboard, optional cron) and the daily catch-up.
- **Admin → Other lotteries**: per-lottery status, *Fetch now* / *Fetch date*, auto-fetch on/off, up to 5 extra source URLs (with `{date}` placeholders), list / edit / delete draws, **Add result** with *Paste result text* (copy the result from any site or PDF – the prize tiers are filled in automatically), image upload and lock.
- The parsers read prize headings and ticket formats from the page text (not CSS classes). Run `npm run test:others` to check them; the dev mock (`scripts/dev/mock-sources.mjs`) serves sample pages for all sources.
- If a source site changes or disappears, add another one under *Extra source URLs* or paste the result manually – no code change needed.

## How the automatic result scraping works

1. **Auto-fetch is built in** (Admin → Dashboard → *Auto-fetch results*, on by default). Each draw is fetched in a fast window – IST **1:01–1:20 PM**, **6:01–6:20 PM**, **8:01–8:20 PM**, at most every 25 s – and after that every 2 min until the draw is complete (max 2.5 h).
2. It is triggered from these places, which share one database lock (a draw is never fetched twice at once):
   - **the every-minute cron (recommended)** – `GET /api/cron/scrape?key=CRON_SECRET` from cron-job.org makes it independent of visitors. It answers at once and fetches in the background (no cron-job.org time-outs);
   - **visitors** – every page view during a draw window, and result pages that are waiting for a draw (every 20 s), call `/api/status`, which runs the fetch in the background;
   - **the admin dashboard** – every 20 s while it is open;
   - **the hourly safety sweep** – Vercel Cron calls `/api/cron/sweep` once in every hour from 12:30 PM to 11:30 PM IST (free plan) and fetches every draw of today that is drawn but still missing or incomplete.
   Admin → Dashboard → *What starts an automatic fetch* shows whether the cron and the sweep are really running.
3. Sources are fetched in parallel: `sambad.com/today-{1pm|6pm|8pm}`, `lottery.sambad.com/today/{1|6|8}-pm/`, `sambad.com/DD-MM-YYYY`. The parsers read prize labels + number formats (not CSS classes) so small redesigns don't break them.
4. Safety checks: the page must show the **requested date** (result-image file name or date text), and a new 1st prize can never equal a previous draw (prevents publishing yesterday's result).
5. The result image is copied from the source (`lottery-sambad-{slot}-{DD-MM-YYYY}.jpg/.webp`), converted to optimised WebP and served from your own domain (`/media/...`).
6. The draw is saved → all pages + sitemap are revalidated (cache cleared) → open pages refresh themselves → IndexNow ping (if configured). Once a draw has all tiers + image it's marked **complete** and not fetched again. After midnight IST the cache is cleared once so "today" pages switch to the new date.
7. A nightly Vercel Cron (`/api/cron/catchup`, ~12:10–1:10 AM IST) fills anything missed in the last 2 days. Admin → Dashboard → **Import old results** back-fills any date range.

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
4. Deploy. The build runs the database migrations and creates the default legal pages + 4 starter guides automatically (if anything is missing, log in to /admin and click **Refresh website** – it repairs the database and refreshes every page).
5. Settings → Functions → set the function region to the **same region as your Neon database** (e.g. Singapore `sin1`) so database calls stay fast (optional but recommended).

### 4. Domain
Vercel → Project → Settings → Domains → add `lotterysambad.plus` (and `www` redirect). Point DNS at your registrar as Vercel shows (A `76.76.21.21` / CNAME `cname.vercel-dns.com`).

### 5. Every-minute trigger — cron-job.org (free, recommended)
Without it, results are fetched while someone is on the site plus once an hour by the built-in sweep. With it, every result is fetched within ~1 minute even when nobody is online:
1. Sign up at <https://cron-job.org> → **Dashboard → Create cronjob**.
2. URL: `https://lotterysambad.plus/api/cron/scrape?key=YOUR_CRON_SECRET` (Admin → Dashboard has a Copy button).
3. Schedule: **every 1 minute**. Save, then **Test run** → `200 {"ok":true,"accepted":true,…}`.
4. During the next draw window Admin → Dashboard shows “Every-minute cron: Working”.

> Vercel's own Cron on the free Hobby plan runs each job only once a day (±59 min), which is why the site uses eleven daily jobs as an hourly safety sweep plus an external 1-minute pinger. On Vercel Pro you can instead add `{"path": "/api/cron/scrape", "schedule": "* * * * *"}` to `vercel.json`.

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
- `/api/cron/scrape?key=…` – auto mode (inside draw windows only, answers at once; add `&wait=1` to see the report)
- `/api/cron/sweep?key=…` – fetch today's drawn-but-incomplete draws (all lotteries)
- `/api/cron/scrape?key=…&mode=catchup&days=3` – fill missing draws of the last N days (max 7)
- `/api/cron/scrape?key=…&mode=force&date=25-09-2026&slot=8pm` – re-fetch one draw

## Project structure

```
src/app/(site)/…         English public pages (ISR) – thin wrappers around src/views
src/app/[slug]/…         /hi, /bn, /ml versions of the same pages (+ English CMS pages at /[slug])
src/views/               page views + metadata builders shared by every language
src/lib/i18n/            dict/en|hi|bn|ml.ts (all UI text), config.ts (locales, lp() link helper), lotteryText.ts
src/lib/lotteries.ts     all-India lottery figures used by the comparison table and charts
src/components/charts/   bar / column / timeline charts (HTML, hover tooltips, table view)
src/proxy.ts             admin guard + browser-language redirect
src/lib/others/          Kerala / Punjab / Maharashtra / West Bengal: config (paths, windows), parse.ts, scrape.ts, data.ts
src/views/others.tsx     their live + date pages (all languages)
src/app/admin/…          admin dashboard + server actions (actions.ts)
src/app/api/cron/…       scraper triggers
src/app/media/[...key]   image server (DB or Blob) with 1-year immutable caching
src/lib/scraper/         sources.ts (URLs), parse.ts (parsers), index.ts (merge/save)
src/lib/db/schema.ts     tables: results, media, posts, pages, settings, scrape_logs
drizzle/                 SQL migrations  (npm run db:generate after schema changes)
scripts/                 migrate.mjs, default legal pages, parser tests, dev mock server
```

## Notes
- **Editing text / translations:** change `src/lib/i18n/dict/en.ts` and the same key in `hi.ts`, `bn.ts`, `ml.ts` (TypeScript refuses to build if a key is missing). Placeholders like `{date}` must stay; `**bold**` and `[link](/path)` work in most texts and links are sent to the right language automatically.
- **All-India figures** (bumper prizes, ticket prices) live in `src/lib/lotteries.ts` (numbers) and `src/lib/i18n/lotteryText.ts` (wording) – update them when a state announces new prizes.
- Admin-written articles, legal pages and result notes are shown as written (English). The footer about/disclaimer text is translated automatically unless you change it in Admin → Settings.
- Neon free tier auto-suspends when idle; pages are static and the scraper only touches the DB inside draw windows, keeping usage low.
- Prize amounts and weekly draw names are editable in Admin → Settings (verify with the official notification).
- The site is informational only; keep the footer disclaimer and link users to the official gazette.
