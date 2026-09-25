import { NextResponse, type NextRequest } from "next/server";
import { ensureSetup } from "@/lib/setup";
import { revalidateSite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** One-click repair: /api/setup?key=CRON_SECRET → migrate, seed defaults, refresh all pages. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.nextUrl.searchParams.get("key") !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const r = await ensureSetup(true);
    revalidateSite();
    return NextResponse.json({ ok: true, ...r, message: "Database ready, default content ensured, site cache refreshed." });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
