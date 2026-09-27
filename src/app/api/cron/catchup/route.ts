import { NextResponse, type NextRequest } from "next/server";
import { runCron } from "@/lib/cron";
import { cronAuthorized } from "@/lib/cronAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily safety net (Vercel Cron): fills any draw of the last 2 days that is missing or incomplete. */
export async function GET(req: NextRequest) {
  if (!cronAuthorized(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const res = await runCron("catchup", { days: 2 });
  return NextResponse.json(res, { headers: { "Cache-Control": "no-store" } });
}
