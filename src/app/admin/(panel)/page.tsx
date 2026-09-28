import Link from "next/link";
import { desc, inArray, like, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { results, posts, pages, media, scrapeLogs, settings as settingsT } from "@/lib/db/schema";
import { SLOTS, SLOT_META } from "@/lib/draws";
import { getResultsForDate } from "@/lib/results";
import { siteUrl, getSettingsFresh } from "@/lib/settings";
import { formatIST, fullDate, isoToDMY, todayIST } from "@/lib/time";
import { PageHeader, Panel, Badge } from "@/components/admin/ui";
import { CopyField } from "@/components/admin/forms";
import { ScrapeButton } from "@/components/admin/ScrapeButton";
import { Backfill } from "@/components/admin/Backfill";
import { RefreshSite } from "@/components/admin/RefreshSite";
import { AutoFetchPanel } from "@/components/admin/AutoFetchPanel";
import { OtherFetch } from "@/components/admin/OtherFetch";
import { lotteryDraws } from "@/lib/db/schema";
import { eq as eqOp } from "drizzle-orm";
import { OTHER, OTHER_IDS, clockLabel, type OtherId } from "@/lib/others/config";
import { ensureSetup } from "@/lib/setup";
import { Trophy, FileText, Files, Image as ImageIcon, Plus } from "lucide-react";

export default async function Dashboard() {
  // layout and page render in parallel – make sure tables exist before querying
  await ensureSetup().catch(() => {});
  const today = todayIST();
  const [draws, counts, logs, s, otherToday, beats] = await Promise.all([
    getResultsForDate(today),
    Promise.all([db.$count(results), db.$count(posts), db.$count(pages), db.select({ n: sql<number>`count(*)::int`, bytes: sql<number>`coalesce(sum(size),0)::bigint` }).from(media)]),
    db.select().from(scrapeLogs).orderBy(desc(scrapeLogs.runAt)).limit(12),
    getSettingsFresh(),
    db.select().from(lotteryDraws).where(eqOp(lotteryDraws.drawDate, today)).catch(() => []),
    // heartbeats of the automatic triggers + the most recent auto-fetch lock (who fetched last)
    db
      .select({ key: settingsT.key, value: settingsT.value, updatedAt: settingsT.updatedAt })
      .from(settingsT)
      .where(or(inArray(settingsT.key, ["hb:cron", "hb:vercel"]), like(settingsT.key, "lock:auto:%")))
      .catch(() => []),
  ]);
  const beatAt = (k: string) => beats.find((b) => b.key === k)?.updatedAt?.toISOString() ?? null;
  const lastLock = beats.filter((b) => b.key.startsWith("lock:auto:")).sort((a, b) => +b.updatedAt - +a.updatedAt)[0];
  const health = {
    cron: beatAt("hb:cron"),
    vercel: beatAt("hb:vercel"),
    last: lastLock
      ? { what: lastLock.key.replace("lock:auto:", ""), at: lastLock.updatedAt.toISOString(), by: String((lastLock.value as { by?: string })?.by ?? "").split(" ")[0] }
      : null,
  };
  const ONAME: Record<OtherId, string> = { kerala: "Kerala", punjab: "Punjab", maharashtra: "Maharashtra", westbengal: "West Bengal" };
  const byLottery = (id: OtherId) => otherToday.filter((d) => d.lottery === id);
  const othersState = Object.fromEntries(
    OTHER_IDS.map((id) => [id, { enabled: s.others[id].enabled, done: byLottery(id).length > 0 && byLottery(id).every((d) => d.isComplete) }]),
  ) as Record<OtherId, { enabled: boolean; done: boolean }>;
  const [nResults, nPosts, nPages, mediaAgg] = counts;
  const cronSecret = (process.env.CRON_SECRET ?? "").trim();
  const cronUrl = `${siteUrl()}/api/cron/scrape?key=${encodeURIComponent(cronSecret)}`;
  return (
    <>
      <PageHeader
        title="Dashboard"
        desc={<>Today is <b>{fullDate(today)}</b> (IST). Auto-fetch is {s.scraperEnabled ? <Badge tone="ok">ON</Badge> : <Badge tone="live">OFF</Badge>}</>}
        actions={
          <>
            <RefreshSite />
            <Link href="/admin/results/new" className="btn btn-gold !py-2 text-sm"><Plus className="size-4" /> Add result</Link>
            <Link href="/admin/articles/new" className="btn btn-ghost !py-2 text-sm"><Plus className="size-4" /> New article</Link>
          </>
        }
      />
      <div className="mb-4">
        <AutoFetchPanel
          enabled={s.scraperEnabled}
          complete={{ "1pm": !!draws["1pm"]?.isComplete, "6pm": !!draws["6pm"]?.isComplete, "8pm": !!draws["8pm"]?.isComplete }}
          others={othersState}
          health={health}
        />
      </div>
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

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {OTHER_IDS.filter((id) => OTHER[id].window).map((id) => {
          const list = byLottery(id);
          return (
            <div key={id} className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <Link href={`/admin/lotteries?l=${id}`} className="font-extrabold hover:text-brand-2">
                  {ONAME[id]} <span className="text-xs font-semibold text-muted">{clockLabel(OTHER[id].drawMinute)}</span>
                </Link>
                {list.length ? (
                  othersState[id].done ? <Badge tone="ok">Complete</Badge> : <Badge tone="warn">Partial</Badge>
                ) : (
                  <Badge>Waiting</Badge>
                )}
              </div>
              <div className="mt-2 space-y-0.5 text-xs text-muted">
                {list.length ? list.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex justify-between gap-2">
                    <span className="truncate">{d.drawName}</span>
                    <span className="num font-bold text-ink">{d.firstPrize ?? "image"}</span>
                  </div>
                )) : <div>No result yet today.</div>}
                {list.length > 5 && <div>+{list.length - 5} more</div>}
              </div>
              <div className="mt-3">
                <OtherFetch lottery={id} today={today} compact />
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
        <div id="cron" className="scroll-mt-24">
          <Panel
            title="Every-minute cron – recommended (free, 2 minutes)"
            desc="Vercel's free plan cannot run a job every minute, so without this the results are fetched only while someone has the site open, plus the nightly catch-up. With it, every result is fetched inside its window even when nobody is online."
          >
            {cronSecret ? (
              <CopyField value={cronUrl} secret />
            ) : (
              <div className="rounded-xl border border-live/40 bg-live/10 p-3 text-xs leading-relaxed">
                <b className="text-live">CRON_SECRET is missing or empty on this deployment</b>, so there is no key for the URL yet.
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
                  <li>Vercel → your project → <b>Settings → Environment Variables</b> → add or edit <code>CRON_SECRET</code>.</li>
                  <li>Value: a long random text of letters and numbers only (30+ characters). Tick <b>Production</b> (and Preview). Save.</li>
                  <li><b>Deployments</b> → latest → <b>⋯ → Redeploy</b> (new values only apply after a redeploy), then reload this page.</li>
                </ol>
              </div>
            )}
            <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-xs text-muted">
              <li>Sign up free at <a href="https://cron-job.org" target="_blank" rel="noreferrer" className="font-bold text-brand-2 underline">cron-job.org</a> → <b>Dashboard → Create cronjob</b>.</li>
              <li>Title: <b>Lottery auto-fetch</b>. URL: press <b>Copy</b> above and paste it.</li>
              <li>Execution schedule: <b>Every 1 minute</b>. Leave everything else as it is and press <b>Create</b>.</li>
              <li>Press <b>Test run</b> – it should answer <code>200</code> with <code>&quot;accepted&quot;:true</code>. The “Every-minute cron” line in the Auto-fetch panel turns green during the next draw window.</li>
            </ol>
            <ul className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs text-muted">
              <li>• Outside the draw windows a call does nothing (no database use), so it is safe to run all day.</li>
              <li>• Windows (IST): 1:05–1:13 PM, 6:05–6:13 PM, 8:00–8:12 PM (every 25 s); Kerala 3:05–3:13 PM, Maharashtra 4:20–4:28 PM, Punjab 6:35–6:43 PM (every 60 s).</li>
              <li>• A draw still incomplete after its window: press <b>Fetch now</b>, or the nightly catch-up (~12:10–1:10 AM IST) fills it.</li>
              <li>• Pages are rebuilt only when the first prize, the image or the full result arrives, and only the pages that show it (keeps Vercel ISR writes low).</li>
              <li>• Each run is logged under <Link href="/admin/logs" className="text-brand-2 underline">Scraper Logs</Link>.</li>
            </ul>
          </Panel>
        </div>
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
