import { NextResponse, type NextRequest } from "next/server";
import { runCron } from "@/lib/cron";
import { beat } from "@/lib/autofetch";
import { cronAuthorized } from "@/lib/cronAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Hourly safety net (Vercel Cron – vercel.json runs it once in every hour from 1:30 PM to 10:30 PM IST).
 * Fetches every draw of today that has already been drawn but is still missing or incomplete:
 * Lottery Sambad 1 / 6 / 8 PM, Kerala, Maharashtra and Punjab. Works on the free Vercel plan and does
 * not depend on visitors or on an external cron.
 */
export async function GET(req: NextRequest) {
  if (!cronAuthorized(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  await beat("hb:vercel", new Date().toISOString()).catch(() => {});
  try {
    const res = await runCron("sweep");
    return NextResponse.json(res, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[sweep]", e);
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
