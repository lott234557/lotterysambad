import "server-only";
import { eq } from "drizzle-orm";
import { db, getSql } from "./db";
import { results } from "./db/schema";
import { dueSlots, type DueSlot } from "./windows";
import { nowIST } from "./time";
import { getSettingsFresh } from "./settings";
import { scrapeDraw, type ScrapeOutcome } from "./scraper";
import { revalidateSite } from "./revalidate";

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
};

export async function autoFetch(trigger: Trigger): Promise<AutoFetchResult> {
  const now = nowIST();
  const today = now.iso;
  const res: AutoFetchResult = { enabled: true, due: dueSlots(now.minuteOfDay), ran: [], skipped: [], rolledOver: false };

  res.rolledOver = await ensureRollover(today).catch(() => false);
  if (!res.due.length) return res;

  const settings = await getSettingsFresh();
  if (!settings.scraperEnabled) {
    res.enabled = false;
    return res;
  }

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
    if (!(await acquire(`lock:auto:${d.slot}`, d.gap, `${trigger} ${new Date().toISOString()}`))) {
      res.skipped.push(`${d.slot}: fetched moments ago`);
      continue;
    }
    try {
      res.ran.push(await scrapeDraw(today, d.slot, { trigger: `auto:${trigger}`, skipMemo: true }));
    } catch (e) {
      res.ran.push({ date: today, slot: d.slot, status: "error", message: (e as Error).message, changed: false });
    }
  }
  if (res.ran.some((o) => o.changed)) revalidateSite();
  return res;
}
