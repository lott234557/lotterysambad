import { NextResponse, after, type NextRequest } from "next/server";
import { runCron } from "@/lib/cron";
import { scrapeDraw } from "@/lib/scraper";
import { revalidateSite } from "@/lib/revalidate";
import { isSlot } from "@/lib/draws";
import { dmyToISO, isValidISO, nowIST } from "@/lib/time";
import { cronAuthorized } from "@/lib/cronAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const noStore = { "Cache-Control": "no-store" };

/**
 * Called every minute by an external cron (cron-job.org).
 *   /api/cron/scrape?key=SECRET                         -> auto (fetches only inside draw windows)
 *   /api/cron/scrape?key=SECRET&wait=1                  -> same, but waits and returns the full report
 *   /api/cron/scrape?key=SECRET&mode=catchup&days=2     -> fill any missing draws of the last N days
 *   /api/cron/scrape?key=SECRET&mode=sweep              -> fill today's missing / incomplete draws
 *   /api/cron/scrape?key=SECRET&mode=force&date=25-09-2026&slot=8pm
 *
 * In auto mode the answer is sent at once and the fetching continues in the background, so cron-job.org
 * (30 s time-out) never records a failure and never disables the job.
 */
export async function GET(req: NextRequest) {
  if (!cronAuthorized(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const mode = sp.get("mode") ?? "auto";
  try {
    if (mode === "force") {
      const raw = sp.get("date") ?? "";
      const date = isValidISO(raw) ? raw : dmyToISO(raw);
      const slot = sp.get("slot") ?? "";
      if (!date || !isSlot(slot)) return NextResponse.json({ ok: false, error: "bad date/slot" }, { status: 400 });
      const outcome = await scrapeDraw(date, slot, { force: true, trigger: "cron:force" });
      if (outcome.changed) revalidateSite();
      return NextResponse.json({ ok: true, outcome }, { headers: noStore });
    }
    if (mode === "catchup" || mode === "sweep") {
      const res = await runCron(mode, { days: Number(sp.get("days") ?? 2) });
      return NextResponse.json(res, { headers: noStore });
    }
    if (sp.get("wait") === "1") {
      return NextResponse.json(await runCron("auto"), { headers: noStore });
    }
    after(async () => {
      try {
        await runCron("auto");
      } catch (e) {
        console.error("[cron] auto failed", e);
      }
    });
    const n = nowIST();
    return NextResponse.json(
      { ok: true, accepted: true, istTime: `${n.iso} ${n.hours}:${String(n.minutes).padStart(2, "0")}`, note: "running in the background – see Admin → Scraper logs" },
      { headers: noStore },
    );
  } catch (e) {
    console.error("[cron]", e);
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
