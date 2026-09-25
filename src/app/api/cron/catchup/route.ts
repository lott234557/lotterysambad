import { NextResponse, type NextRequest } from "next/server";
import { runCron } from "@/lib/cron";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily safety net (Vercel Cron): fills any draw of the last 2 days that is missing or incomplete. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const ok =
    (!secret && process.env.NODE_ENV !== "production") ||
    req.headers.get("authorization") === `Bearer ${secret}` ||
    req.nextUrl.searchParams.get("key") === secret;
  if (!ok) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const res = await runCron("catchup", { days: 2 });
  return NextResponse.json(res, { headers: { "Cache-Control": "no-store" } });
}
