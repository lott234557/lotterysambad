import "server-only";
import { SLOTS, SLOT_META, type Slot } from "./draws";
import { addDays, nowIST } from "./time";
import { scrapeDraw, type ScrapeOutcome } from "./scraper";
import { getSettingsFresh } from "./settings";
import { revalidateSite } from "./revalidate";
import { lt } from "drizzle-orm";
import { db } from "./db";
import { scrapeLogs } from "./db/schema";
import { autoFetch } from "./autofetch";

export async function runCron(mode: "auto" | "catchup", opts: { days?: number } = {}) {
  const now = nowIST();
  const today = now.iso;

  // auto: same windows + lock as the built-in auto-fetch (visitors / dashboard)
  if (mode === "auto") {
    const r = await autoFetch("cron");
    return {
      ok: true,
      idle: !r.due.length,
      istTime: `${now.iso} ${now.hours}:${String(now.minutes).padStart(2, "0")}`,
      notes: [...(r.rolledOver ? ["midnight cache refresh"] : []), ...(r.enabled ? [] : ["scraper disabled in settings"]), ...r.skipped],
      outcomes: r.ran,
    };
  }

  // catch-up: housekeeping + fill anything missing in the last N days
  const outcomes: ScrapeOutcome[] = [];
  await db.delete(scrapeLogs).where(lt(scrapeLogs.runAt, new Date(Date.now() - 30 * 864e5))).catch(() => {});
  const days = Math.min(Math.max(opts.days ?? 2, 1), 7);
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

  for (const j of jobs) {
    try {
      outcomes.push(await scrapeDraw(j.date, j.slot, { trigger: "catch-up" }));
    } catch (e) {
      outcomes.push({ date: j.date, slot: j.slot, status: "error", message: (e as Error).message, changed: false });
    }
  }
  if (outcomes.some((o) => o.changed)) revalidateSite();
  return { ok: true, idle: false, notes: [], outcomes };
}
