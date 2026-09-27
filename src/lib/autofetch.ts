import "server-only";
import { and, eq } from "drizzle-orm";
import { db, getSql } from "./db";
import { results } from "./db/schema";
import { dueSlots, type DueSlot } from "./windows";
import { nowIST } from "./time";
import { getSettingsFresh } from "./settings";
import { scrapeDraw, type ScrapeOutcome } from "./scraper";
import { revalidateSite } from "./revalidate";
import { lotteryDraws } from "./db/schema";
import { OTHER, OTHER_IDS, windowPhase, type OtherId } from "./others/config";
import { scrapeOther, type OtherOutcome } from "./others/scrape";

/**
 * Built-in automatic result fetching.
 *
 * Runs from three places and they all share one database lock, so a draw is never fetched twice at once:
 *  - visitors: pages waiting for a result poll /api/status, which calls this in the background
 *  - admin:    the dashboard calls it every 20 s while it is open
 *  - cron:     /api/cron/scrape (e.g. cron-job.org every minute) – optional, makes it independent of visitors
 *
 * Fast window: draw time +1 → +20 min (1:01–1:20, 6:01–6:20, 8:01–8:20) → at most one fetch every 25 s.
 * Slow window: until +150 min, only while the draw is still incomplete → one fetch every 2 min.
 * After every saved change all pages are revalidated (cache cleared) so visitors see the result at once.
 */
export type Trigger = "visitor" | "admin" | "cron";

/**
 * Atomic "at most once every N seconds" lock stored in the settings table.
 * Returns true for exactly one caller per interval, even across serverless instances.
 */
async function acquire(key: string, gapSeconds: number, note: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    insert into settings (key, value, updated_at)
    values (${key}, ${JSON.stringify({ by: note })}::jsonb, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
    where settings.updated_at < now() - ${`${gapSeconds} seconds`}::interval
    returning key`;
  return rows.length > 0;
}

let rolledFor = "";

/** Once per IST day (first call after midnight): clear the page cache so "today" pages switch to the new date. */
export async function ensureRollover(today: string): Promise<boolean> {
  if (rolledFor === today) return false;
  const sql = getSql();
  const rows = await sql`
    insert into settings (key, value, updated_at)
    values ('lock:rollover', ${JSON.stringify({ d: today })}::jsonb, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
    where settings.value->>'d' is distinct from ${today}
    returning key`;
  rolledFor = today;
  if (rows.length > 0) {
    revalidateSite();
    return true;
  }
  return false;
}

export type AutoFetchResult = {
  enabled: boolean;
  due: DueSlot[];
  ran: ScrapeOutcome[];
  skipped: string[];
  rolledOver: boolean;
  /** Kerala / Punjab / Maharashtra */
  others: OtherOutcome[];
};

export async function autoFetch(trigger: Trigger): Promise<AutoFetchResult> {
  const now = nowIST();
  const today = now.iso;
  const res: AutoFetchResult = { enabled: true, due: dueSlots(now.minuteOfDay), ran: [], skipped: [], rolledOver: false, others: [] };

  res.rolledOver = await ensureRollover(today).catch(() => false);
  const otherPhases = OTHER_IDS.map((id) => ({ id, phase: windowPhase(OTHER[id], now.minuteOfDay) })).filter((x) => x.phase);
  if (!res.due.length && !otherPhases.length) return res;

  const settings = await getSettingsFresh();
  if (!settings.scraperEnabled) {
    res.enabled = false;
    return res;
  }

  // Several windows can overlap (e.g. 6:35 PM: Sambad 6 PM + Punjab + Maharashtra). To stay well inside the
  // function time limit, one call runs at most MAX_JOBS fetches in parallel; the rest are picked up by the
  // next call (their lock is not taken, so nothing is skipped for long). Fast windows go first.
  const MAX_JOBS = 2;
  const jobs: { priority: number; run: () => Promise<void> }[] = [];
  let taken = 0;
  const take = async (key: string, gap: number) => {
    if (taken >= MAX_JOBS) return "busy" as const;
    const ok = await acquire(key, gap, `${trigger} ${new Date().toISOString()}`);
    if (ok) taken++;
    return ok ? ("ok" as const) : ("recent" as const);
  };

  type Cand = { key: string; gap: number; fast: boolean; label: string; run: () => Promise<void> };
  const cands: Cand[] = [];

  /* ---- Lottery Sambad 1 / 6 / 8 PM ---- */
  if (res.due.length) {
    const rows = await db
      .select({ slot: results.slot, isComplete: results.isComplete, source: results.source })
      .from(results)
      .where(eq(results.drawDate, today));
    const state = new Map(rows.map((r) => [r.slot, r]));
    for (const d of res.due) {
      const r = state.get(d.slot);
      if (r?.isComplete) {
        res.skipped.push(`${d.slot}: complete`);
        continue;
      }
      if (r?.source === "manual") {
        res.skipped.push(`${d.slot}: locked (manual)`);
        continue;
      }
      cands.push({
        key: `lock:auto:${d.slot}`,
        gap: d.gap,
        fast: d.phase === "fast",
        label: d.slot,
        run: async () => {
          try {
            res.ran.push(await scrapeDraw(today, d.slot, { trigger: `auto:${trigger}`, skipMemo: true }));
          } catch (e) {
            res.ran.push({ date: today, slot: d.slot, status: "error", message: (e as Error).message, changed: false });
          }
        },
      });
    }
  }

  /* ---- Kerala / Punjab / Maharashtra ---- */
  for (const { id, phase } of otherPhases as { id: OtherId; phase: "fast" | "slow" }[]) {
    if (!settings.others[id].enabled) {
      res.skipped.push(`${id}: auto-fetch off`);
      continue;
    }
    const rows = await db
      .select({ isComplete: lotteryDraws.isComplete })
      .from(lotteryDraws)
      .where(and(eq(lotteryDraws.lottery, id), eq(lotteryDraws.drawDate, today)));
    const done = rows.length > 0 && rows.every((r) => r.isComplete) && (!OTHER[id].multi || phase === "slow");
    if (done) {
      res.skipped.push(`${id}: complete`);
      continue;
    }
    const w = OTHER[id].window!;
    cands.push({
      key: `lock:auto:${id}`,
      gap: phase === "fast" ? w.fastGap : w.slowGap,
      fast: phase === "fast",
      label: id,
      run: async () => {
        try {
          res.others.push(await scrapeOther(id, today, { trigger: `auto:${trigger}` }));
        } catch (e) {
          res.others.push({ lottery: id, date: today, status: "error", message: (e as Error).message, changed: false, draws: 0 });
        }
      },
    });
  }

  cands.sort((a, b) => Number(b.fast) - Number(a.fast));
  for (const c of cands) {
    const r = await take(c.key, c.gap);
    if (r === "ok") jobs.push({ priority: c.fast ? 1 : 0, run: c.run });
    else res.skipped.push(`${c.label}: ${r === "busy" ? "queued for the next check" : "fetched moments ago"}`);
  }
  await Promise.all(jobs.map((j) => j.run()));

  if (res.ran.some((o) => o.changed) || res.others.some((o) => o.changed)) revalidateSite();
  return res;
}
