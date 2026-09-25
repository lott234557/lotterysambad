import "server-only";
import { cache } from "react";
import { and, desc, eq, gte, lte, lt, gt, sql, asc } from "drizzle-orm";
import { db, safeRead } from "./db";
import { results, type Result } from "./db/schema";
import type { Slot } from "./draws";
import { SLOTS } from "./draws";
import { addDays, daysInMonth } from "./time";

export type { Result };

const published = eq(results.status, "published");

export const getResultsForDate = cache(async (iso: string): Promise<Partial<Record<Slot, Result>>> => {
  const rows = await safeRead(
    () => db.select().from(results).where(and(eq(results.drawDate, iso), published)),
    [] as Result[],
  );
  const out: Partial<Record<Slot, Result>> = {};
  for (const r of rows) out[r.slot as Slot] = r;
  return out;
});

export const getResult = cache(async (iso: string, slot: Slot): Promise<Result | null> => {
  const rows = await safeRead(
    () =>
      db
        .select()
        .from(results)
        .where(and(eq(results.drawDate, iso), eq(results.slot, slot), published))
        .limit(1),
    [] as Result[],
  );
  return rows[0] ?? null;
});

/** Latest N results of one slot (newest first). */
export const getRecentBySlot = cache(async (slot: Slot, limit = 10, beforeISO?: string) => {
  return safeRead(
    () =>
      db
        .select()
        .from(results)
        .where(and(eq(results.slot, slot), published, beforeISO ? lt(results.drawDate, beforeISO) : undefined))
        .orderBy(desc(results.drawDate))
        .limit(limit),
    [] as Result[],
  );
});

/** Results in a date range (inclusive), newest first. */
export const getRange = cache(async (fromISO: string, toISO: string) => {
  return safeRead(
    () =>
      db
        .select()
        .from(results)
        .where(and(gte(results.drawDate, fromISO), lte(results.drawDate, toISO), published))
        .orderBy(desc(results.drawDate), asc(results.slot)),
    [] as Result[],
  );
});

export type DayRow = { date: string; draws: Partial<Record<Slot, Result>> };

export function groupByDate(rows: Result[]): DayRow[] {
  const map = new Map<string, DayRow>();
  for (const r of rows) {
    const row = map.get(r.drawDate) ?? { date: r.drawDate, draws: {} };
    row.draws[r.slot as Slot] = r;
    map.set(r.drawDate, row);
  }
  return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const getLastNDays = cache(async (todayISO: string, days: number) => {
  const rows = await getRange(addDays(todayISO, -(days - 1)), todayISO);
  return groupByDate(rows);
});

export const getMonth = cache(async (key: string) => {
  const from = `${key}-01`;
  const to = `${key}-${String(daysInMonth(key)).padStart(2, "0")}`;
  return groupByDate(await getRange(from, to));
});

/** Months that have data, newest first: [{ key: '2026-09', count }] */
export const getArchiveMonths = cache(async () => {
  return safeRead(
    () =>
      db
        .select({
          key: sql<string>`to_char(${results.drawDate}, 'YYYY-MM')`,
          count: sql<number>`count(*)::int`,
        })
        .from(results)
        .where(published)
        .groupBy(sql`to_char(${results.drawDate}, 'YYYY-MM')`)
        .orderBy(desc(sql`to_char(${results.drawDate}, 'YYYY-MM')`)),
    [] as { key: string; count: number }[],
  );
});

/** Nearest dates with data before / after a date (for prev/next navigation). */
export const getNeighbours = cache(async (iso: string) => {
  const [prev, next] = await Promise.all([
    safeRead(
      () =>
        db
          .select({ d: results.drawDate })
          .from(results)
          .where(and(lt(results.drawDate, iso), published))
          .orderBy(desc(results.drawDate))
          .limit(1),
      [] as { d: string }[],
    ),
    safeRead(
      () =>
        db
          .select({ d: results.drawDate })
          .from(results)
          .where(and(gt(results.drawDate, iso), published))
          .orderBy(asc(results.drawDate))
          .limit(1),
      [] as { d: string }[],
    ),
  ]);
  return { prev: prev[0]?.d ?? null, next: next[0]?.d ?? null };
});

/** How often a series (e.g. "84L") won the 1st prize in the last `days` days. */
export const getSeriesStats = cache(async (series: string, beforeISO: string, days = 365) => {
  return safeRead(
    () =>
      db
        .select({ drawDate: results.drawDate, slot: results.slot, firstPrize: results.firstPrize })
        .from(results)
        .where(
          and(
            published,
            sql`${results.firstPrize} like ${series + " %"}`,
            lt(results.drawDate, beforeISO),
            gte(results.drawDate, addDays(beforeISO, -days)),
          ),
        )
        .orderBy(desc(results.drawDate))
        .limit(20),
    [] as { drawDate: string; slot: string; firstPrize: string | null }[],
  );
});

export const getAllResultKeys = async () =>
  safeRead(
    () =>
      db
        .select({ drawDate: results.drawDate, slot: results.slot, updatedAt: results.updatedAt })
        .from(results)
        .where(published)
        .orderBy(desc(results.drawDate)),
    [] as { drawDate: string; slot: string; updatedAt: Date }[],
  );

export const slotsOf = (d: Partial<Record<Slot, Result>>) => SLOTS.filter((s) => d[s]);
