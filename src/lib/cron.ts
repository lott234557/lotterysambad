import "server-only";
import { SLOTS, SLOT_META, type Slot } from "./draws";
import { addDays, nowIST } from "./time";
import { scrapeDraw, type ScrapeOutcome } from "./scraper";
import { getSettingsFresh } from "./settings";
import { revalidateDraw, revalidateOther } from "./revalidate";
import { lt } from "drizzle-orm";
import { db } from "./db";
import { scrapeLogs } from "./db/schema";
import { autoFetch, ensureRollover } from "./autofetch";
import { OTHER, OTHER_IDS, type OtherId } from "./others/config";
import { lotteryDraws } from "./db/schema";
import { and, eq } from "drizzle-orm";
import { scrapeOther, type OtherOutcome } from "./others/scrape";

/** Run async jobs with at most `n` at a time. */
async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(n, queue.length) }, async () => {
      while (queue.length) await fn(queue.shift()!);
    }),
  );
}

/**
 * auto    – every-minute cron: fetches only inside the draw windows (same lock as visitors / dashboard)
 * sweep   – on demand only (/api/cron/sweep?key=…): fetches every draw of TODAY that has been drawn but is
 *           still missing or incomplete, whatever the time (not scheduled – see vercel.json)
 * catchup – nightly: the same for the last N days + housekeeping
 */
export async function runCron(mode: "auto" | "catchup" | "sweep", opts: { days?: number } = {}) {
  const now = nowIST();
  const today = now.iso;

  // auto: same windows + lock as the built-in auto-fetch (visitors / dashboard)
  if (mode === "auto") {
    const r = await autoFetch("cron");
    return {
      ok: true,
      idle: !r.due.length && !r.others.length && !r.skipped.length,
      istTime: `${now.iso} ${now.hours}:${String(now.minutes).padStart(2, "0")}`,
      notes: [...(r.rolledOver ? ["midnight cache refresh"] : []), ...(r.enabled ? [] : ["scraper disabled in settings"]), ...r.skipped],
      outcomes: r.ran,
      others: r.others,
    };
  }

  // catch-up / sweep: fill anything missing (sweep = today only, no housekeeping)
  const outcomes: ScrapeOutcome[] = [];
  const trigger = mode === "sweep" ? "sweep" : "catch-up";
  await ensureRollover(today).catch(() => false); // the nightly catch-up also switches "today" pages to the new date
  if (mode === "catchup") await db.delete(scrapeLogs).where(lt(scrapeLogs.runAt, new Date(Date.now() - 30 * 864e5))).catch(() => {});
  const days = mode === "sweep" ? 1 : Math.min(Math.max(opts.days ?? 2, 1), 7);
  const jobs: { date: string; slot: Slot }[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(today, -i);
    for (const slot of SLOTS) {
      const drawMin = SLOT_META[slot].hour * 60 + SLOT_META[slot].minute;
      if (i === 0 && now.minuteOfDay < drawMin + 10) continue; // not drawn yet
      jobs.push({ date, slot });
    }
  }
  const settings = await getSettingsFresh();
  if (!settings.scraperEnabled) return { ok: true, idle: true, notes: ["scraper disabled in settings"], outcomes };

  // Sambad draws: 3 at a time (finished draws return instantly), other lotteries in parallel with them
  const sambad = pool(jobs, 3, async (j) => {
    try {
      outcomes.push(await scrapeDraw(j.date, j.slot, { trigger }));
    } catch (e) {
      outcomes.push({ date: j.date, slot: j.slot, status: "error", message: (e as Error).message, changed: false });
    }
  });
  // other state lotteries (Kerala / Punjab / Maharashtra) – dates that are already complete are skipped
  const others: OtherOutcome[] = [];
  const otherJobs: { id: OtherId; date: string }[] = [];
  for (const id of OTHER_IDS) {
    const w = OTHER[id].window;
    if (!w || !settings.others[id].enabled) continue;
    for (let i = 0; i < Math.min(days, 3); i++) {
      if (i === 0 && now.minuteOfDay < w.from) continue;
      const date = addDays(today, -i);
      const rows = await db
        .select({ c: lotteryDraws.isComplete })
        .from(lotteryDraws)
        .where(and(eq(lotteryDraws.lottery, id), eq(lotteryDraws.drawDate, date)));
      if (rows.length && rows.every((r) => r.c)) continue;
      otherJobs.push({ id, date });
    }
  }
  await Promise.all([
    sambad,
    ...OTHER_IDS.map(async (id) => {
      for (const j of otherJobs.filter((x) => x.id === id)) {
        try {
          others.push(await scrapeOther(id, j.date, { trigger }));
        } catch (e) {
          others.push({ lottery: id, date: j.date, status: "error", message: (e as Error).message, changed: false, draws: 0 });
        }
      }
    }),
  ]);
  // rebuild only the pages of the dates that changed
  for (const d of new Set(outcomes.filter((o) => o.changed).map((o) => o.date))) revalidateDraw(d, { newUrls: true });
  for (const o of others) if (o.changed) revalidateOther(o.lottery, o.date, { newUrls: true });
  return { ok: true, idle: false, notes: [], outcomes, others };
}
