import { NextResponse, type NextRequest } from "next/server";
import { runCron } from "@/lib/cron";
import { scrapeDraw } from "@/lib/scraper";
import { revalidateSite } from "@/lib/revalidate";
import { isSlot } from "@/lib/draws";
import { dmyToISO, isValidISO } from "@/lib/time";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  return req.nextUrl.searchParams.get("key") === secret;
}

/**
 * Called every minute by an external cron (cron-job.org / GitHub Actions / Vercel Cron).
 *   /api/cron/scrape?key=SECRET                         -> auto (polls only inside draw windows)
 *   /api/cron/scrape?key=SECRET&mode=catchup&days=2     -> fill any missing draws of the last N days
 *   /api/cron/scrape?key=SECRET&mode=force&date=25-09-2026&slot=8pm
 */
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const mode = sp.get("mode") ?? "auto";
  try {
    if (mode === "force") {
      const raw = sp.get("date") ?? "";
      const date = isValidISO(raw) ? raw : dmyToISO(raw);
      const slot = sp.get("slot") ?? "";
      if (!date || !isSlot(slot)) return NextResponse.json({ ok: false, error: "bad date/slot" }, { status: 400 });
      const outcome = await scrapeDraw(date, slot, { force: true });
      if (outcome.changed) revalidateSite();
      return NextResponse.json({ ok: true, outcome }, { headers: { "Cache-Control": "no-store" } });
    }
    const res = await runCron(mode === "catchup" ? "catchup" : "auto", { days: Number(sp.get("days") ?? 2) });
    return NextResponse.json(res, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[cron]", e);
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
