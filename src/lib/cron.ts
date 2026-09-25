import "server-only";
import { SLOTS, SLOT_META, type Slot } from "./draws";
import { addDays, nowIST } from "./time";
import { scrapeDraw, type ScrapeOutcome } from "./scraper";
import { getSettingsFresh } from "./settings";
import { revalidateSite } from "./revalidate";
import { lt } from "drizzle-orm";
import { db } from "./db";
import { scrapeLogs } from "./db/schema";

/** Polling window per draw: from draw time + START to draw time + END (minutes). */
export const WINDOW_START = 3;
export const WINDOW_END = 150;

export function activeSlots(minuteOfDay: number): Slot[] {
  return SLOTS.filter((s) => {
    const m = SLOT_META[s].hour * 60 + SLOT_META[s].minute;
    return minuteOfDay >= m + WINDOW_START && minuteOfDay <= m + WINDOW_END;
  });
}

export async function runCron(mode: "auto" | "catchup", opts: { days?: number } = {}) {
  const now = nowIST();
  const today = now.iso;
  const outcomes: ScrapeOutcome[] = [];
  const notes: string[] = [];

  // Midnight roll-over: refresh "today" pages without touching the database.
  if (mode === "auto" && now.minuteOfDay <= 1) {
    revalidateSite();
    notes.push("midnight revalidate");
  }

  let jobs: { date: string; slot: Slot }[] = [];
  if (mode === "auto") {
    jobs = activeSlots(now.minuteOfDay).map((slot) => ({ date: today, slot }));
  } else {
    // housekeeping: keep 30 days of scraper logs
    await db.delete(scrapeLogs).where(lt(scrapeLogs.runAt, new Date(Date.now() - 30 * 864e5))).catch(() => {});
    const days = Math.min(Math.max(opts.days ?? 2, 1), 7);
    for (let i = 0; i < days; i++) {
      const date = addDays(today, -i);
      for (const slot of SLOTS) {
        const drawMin = SLOT_META[slot].hour * 60 + SLOT_META[slot].minute;
        if (i === 0 && now.minuteOfDay < drawMin + 10) continue; // not drawn yet
        jobs.push({ date, slot });
      }
    }
  }

  if (!jobs.length) return { ok: true, idle: true, istTime: `${now.iso} ${now.hours}:${String(now.minutes).padStart(2, "0")}`, notes, outcomes };

  const settings = await getSettingsFresh();
  if (!settings.scraperEnabled) return { ok: true, idle: true, notes: [...notes, "scraper disabled in settings"], outcomes };

  for (const j of jobs) {
    try {
      outcomes.push(await scrapeDraw(j.date, j.slot));
    } catch (e) {
      outcomes.push({ date: j.date, slot: j.slot, status: "error", message: (e as Error).message, changed: false });
    }
  }
  if (outcomes.some((o) => o.changed)) revalidateSite();
  return { ok: true, idle: false, notes, outcomes };
}
