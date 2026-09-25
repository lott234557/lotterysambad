import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { results, posts, pages, media, scrapeLogs } from "@/lib/db/schema";
import { SLOTS, SLOT_META } from "@/lib/draws";
import { getResultsForDate } from "@/lib/results";
import { siteUrl, getSettingsFresh } from "@/lib/settings";
import { formatIST, fullDate, isoToDMY, todayIST } from "@/lib/time";
import { PageHeader, Panel, Badge } from "@/components/admin/ui";
import { CopyField } from "@/components/admin/forms";
import { ScrapeButton } from "@/components/admin/ScrapeButton";
import { Backfill } from "@/components/admin/Backfill";
import { RefreshSite } from "@/components/admin/RefreshSite";
import { ensureSetup } from "@/lib/setup";
import { Trophy, FileText, Files, Image as ImageIcon, Plus } from "lucide-react";

export default async function Dashboard() {
  // layout and page render in parallel – make sure tables exist before querying
  await ensureSetup().catch(() => {});
  const today = todayIST();
  const [draws, counts, logs, s] = await Promise.all([
    getResultsForDate(today),
    Promise.all([db.$count(results), db.$count(posts), db.$count(pages), db.select({ n: sql<number>`count(*)::int`, bytes: sql<number>`coalesce(sum(size),0)::bigint` }).from(media)]),
    db.select().from(scrapeLogs).orderBy(desc(scrapeLogs.runAt)).limit(12),
    getSettingsFresh(),
  ]);
  const [nResults, nPosts, nPages, mediaAgg] = counts;
  const cronUrl = `${siteUrl()}/api/cron/scrape?key=${process.env.CRON_SECRET ?? "SET_CRON_SECRET"}`;
  return (
    <>
      <PageHeader
        title="Dashboard"
        desc={<>Today is <b>{fullDate(today)}</b> (IST). Scraper is {s.scraperEnabled ? <Badge tone="ok">enabled</Badge> : <Badge tone="live">disabled</Badge>}</>}
        actions={
          <>
            <RefreshSite />
            <Link href="/admin/results/new" className="btn btn-gold !py-2 text-sm"><Plus className="size-4" /> Add result</Link>
            <Link href="/admin/articles/new" className="btn btn-ghost !py-2 text-sm"><Plus className="size-4" /> New article</Link>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {SLOTS.map((x) => {
          const r = draws[x];
          return (
            <div key={x} className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold">{SLOT_META[x].time}</h2>
                {r?.isComplete ? <Badge tone="ok">Complete</Badge> : r ? <Badge tone="warn">Partial</Badge> : <Badge>Waiting</Badge>}
              </div>
              <div className="num mt-3 text-3xl font-extrabold">{r?.firstPrize ?? "—"}</div>
              <div className="mt-1 text-xs text-muted">
                {r ? `${r.drawName ?? ""} · updated ${formatIST(r.updatedAt).split(", ")[1]} · ${r.source ?? ""}` : `Expected ${SLOT_META[x].expected}`}
              </div>
              <div className="mt-4 flex flex-wrap items-start gap-2">
                <ScrapeButton date={today} slot={x} small />
                {r && <Link href={`/admin/results/${r.id}`} className="btn btn-ghost !px-2.5 !py-1.5 text-xs">Edit</Link>}
                <a href={`/result/${isoToDMY(today)}/${x}`} target="_blank" className="btn btn-ghost !px-2.5 !py-1.5 text-xs">View</a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { l: "Results", v: nResults, Icon: Trophy, href: "/admin/results" },
          { l: "Articles", v: nPosts, Icon: FileText, href: "/admin/articles" },
          { l: "Pages", v: nPages, Icon: Files, href: "/admin/pages" },
          { l: `Media · ${(Number(mediaAgg[0]?.bytes ?? 0) / 1048576).toFixed(1)} MB`, v: mediaAgg[0]?.n ?? 0, Icon: ImageIcon, href: "/admin/media" },
        ].map(({ l, v, Icon, href }) => (
          <Link key={l} href={href} className="card flex items-center gap-4 p-4 hover:border-brand-2">
            <span className="grid size-11 place-items-center rounded-xl bg-navy text-gold"><Icon className="size-5" /></span>
            <span>
              <span className="block text-2xl font-extrabold">{v}</span>
              <span className="text-xs text-muted">{l}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Automatic scraping (cron)" desc="Ping this URL every minute (cron-job.org, free). It only works inside draw windows and returns instantly otherwise.">
          <CopyField value={cronUrl} secret />
          <ul className="mt-4 space-y-1.5 text-xs text-muted">
            <li>• Windows (IST): 1:03–3:30 PM, 6:03–8:30 PM, 8:03–10:30 PM – polls each minute until the draw is complete.</li>
            <li>• Catch-up: <code>/api/cron/catchup</code> fills any missing draw of the last 2 days (Vercel daily cron runs it at ~10:10 PM IST).</li>
            <li>• Each run is logged under <Link href="/admin/logs" className="text-brand-2 underline">Scraper Logs</Link>.</li>
          </ul>
        </Panel>
        <Panel title="Import old results" desc="Fetches missing results for a date range from the sources (3 draws per day).">
          <Backfill today={today} />
        </Panel>
      </div>

      <Panel title="Latest scraper activity" className="mt-6">
        <div className="overflow-x-auto">
          <table className="table-x min-w-[640px] text-xs">
            <thead>
              <tr><th>Time</th><th>Draw</th><th>Status</th><th>Message</th></tr>
            </thead>
            <tbody>
              {logs.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-muted">No activity yet.</td></tr>}
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap">{formatIST(l.runAt)}</td>
                  <td className="whitespace-nowrap">{l.drawDate} {l.slot}</td>
                  <td><Badge tone={l.status === "success" ? "ok" : l.status === "partial" ? "warn" : l.status === "error" ? "live" : "muted"}>{l.status}</Badge></td>
                  <td className="max-w-md truncate text-muted" title={l.message ?? ""}>{l.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
