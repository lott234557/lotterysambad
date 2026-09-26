import { NextResponse, after, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { results } from "@/lib/db/schema";
import { isValidISO, todayIST } from "@/lib/time";
import { autoFetch } from "@/lib/autofetch";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Lightweight live status used by pages while waiting for a result (CDN cached for 15 s).
 * Each uncached call also runs the built-in auto-fetch in the background (after the response is sent),
 * so results are fetched automatically whenever someone is waiting for them – no external cron needed.
 */
export async function GET(req: NextRequest) {
  const d = req.nextUrl.searchParams.get("date") ?? "";
  const today = todayIST();
  const date = isValidISO(d) ? d : today;
  if (date === today) {
    after(async () => {
      try {
        await autoFetch("visitor");
      } catch (e) {
        console.warn("[autofetch] visitor trigger failed", (e as Error).message);
      }
    });
  }
  const rows = await db
    .select({ slot: results.slot, firstPrize: results.firstPrize, imageKey: results.imageKey, isComplete: results.isComplete, updatedAt: results.updatedAt })
    .from(results)
    .where(and(eq(results.drawDate, date), eq(results.status, "published")));
  const slots: Record<string, { first: string | null; image: boolean; complete: boolean; updatedAt: string }> = {};
  for (const r of rows) {
    slots[r.slot] = { first: r.firstPrize, image: !!r.imageKey, complete: r.isComplete, updatedAt: r.updatedAt.toISOString() };
  }
  return NextResponse.json(
    { date, today, slots },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=15, stale-while-revalidate=15" } },
  );
}
