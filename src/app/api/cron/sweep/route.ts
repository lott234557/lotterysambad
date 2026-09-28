import { NextResponse, type NextRequest } from "next/server";
import { runCron } from "@/lib/cron";
import { cronAuthorized } from "@/lib/cronAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Manual safety net: /api/cron/sweep?key=CRON_SECRET fetches every draw of today that has already been
 * drawn but is still missing or incomplete (Lottery Sambad 1 / 6 / 8 PM, Kerala, Maharashtra, Punjab).
 * Not scheduled any more (to keep Vercel usage low) – the nightly catch-up does the same for 2 days.
 */
export async function GET(req: NextRequest) {
  if (!cronAuthorized(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const res = await runCron("sweep");
    return NextResponse.json(res, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[sweep]", e);
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
