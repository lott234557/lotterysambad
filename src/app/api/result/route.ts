import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { results } from "@/lib/db/schema";
import { isSlot } from "@/lib/draws";
import { isValidISO } from "@/lib/time";

export const dynamic = "force-dynamic";

/** Full numbers of one draw – used by the ticket checker. */
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  const slot = req.nextUrl.searchParams.get("slot") ?? "";
  if (!isValidISO(date) || !isSlot(slot)) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const rows = await db
    .select({
      drawDate: results.drawDate,
      slot: results.slot,
      drawName: results.drawName,
      firstPrize: results.firstPrize,
      consPrize: results.consPrize,
      secondPrize: results.secondPrize,
      thirdPrize: results.thirdPrize,
      fourthPrize: results.fourthPrize,
      fifthPrize: results.fifthPrize,
    })
    .from(results)
    .where(and(eq(results.drawDate, date), eq(results.slot, slot), eq(results.status, "published")))
    .limit(1);
  const r = rows[0] ?? null;
  return NextResponse.json(
    { result: r },
    { headers: { "Cache-Control": r ? "public, s-maxage=600, stale-while-revalidate=3600" : "public, s-maxage=20" } },
  );
}
