import { NextResponse, type NextRequest } from "next/server";
import { runCron } from "@/lib/cron";
import { cronAuthorized } from "@/lib/cronAuth";
import { beat } from "@/lib/autofetch";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily safety net (Vercel Cron): fills any draw of the last 2 days that is missing or incomplete. */
export async function GET(req: NextRequest) {
  if (!cronAuthorized(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  await beat("hb:vercel", new Date().toISOString()).catch(() => {});
  const res = await runCron("catchup", { days: 2 });
  return NextResponse.json(res, { headers: { "Cache-Control": "no-store" } });
}
