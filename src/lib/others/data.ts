import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, gt, lt, lte, sql } from "drizzle-orm";
import { db, safeRead } from "../db";
import { lotteryDraws, type LotteryDraw } from "../db/schema";
import type { OtherId } from "./config";

const pub = eq(lotteryDraws.status, "published");
const order = [asc(lotteryDraws.drawTime), asc(lotteryDraws.drawName)];

/** Draws of one lottery on one date (published). */
export const getOtherDraws = cache(async (id: OtherId, iso: string): Promise<LotteryDraw[]> =>
  safeRead(
    () =>
      db
        .select()
        .from(lotteryDraws)
        .where(and(eq(lotteryDraws.lottery, id), eq(lotteryDraws.drawDate, iso), pub))
        .orderBy(...order),
    [] as LotteryDraw[],
  ),
);

/** Latest draws (newest first), optionally before a date. */
export const getOtherRecent = cache(async (id: OtherId, limit = 15, beforeISO?: string) =>
  safeRead(
    () =>
      db
        .select({
          id: lotteryDraws.id,
          drawDate: lotteryDraws.drawDate,
          drawName: lotteryDraws.drawName,
          drawTime: lotteryDraws.drawTime,
          firstPrize: lotteryDraws.firstPrize,
          firstAmount: lotteryDraws.firstAmount,
          imageKey: lotteryDraws.imageKey,
        })
        .from(lotteryDraws)
        .where(and(eq(lotteryDraws.lottery, id), pub, beforeISO ? lt(lotteryDraws.drawDate, beforeISO) : undefined))
        .orderBy(desc(lotteryDraws.drawDate), ...order)
        .limit(limit),
    [] as { id: number; drawDate: string; drawName: string; drawTime: string | null; firstPrize: string | null; firstAmount: string | null; imageKey: string | null }[],
  ),
);

/** Most recent date with a result on or before `iso`. */
export const getOtherLatestDate = cache(async (id: OtherId, iso: string) => {
  const r = await safeRead(
    () =>
      db
        .select({ d: lotteryDraws.drawDate })
        .from(lotteryDraws)
        .where(and(eq(lotteryDraws.lottery, id), pub, lte(lotteryDraws.drawDate, iso)))
        .orderBy(desc(lotteryDraws.drawDate))
        .limit(1),
    [] as { d: string }[],
  );
  return r[0]?.d ?? null;
});

export const getOtherNeighbours = cache(async (id: OtherId, iso: string) => {
  const [prev, next] = await Promise.all([
    safeRead(
      () =>
        db
          .select({ d: lotteryDraws.drawDate })
          .from(lotteryDraws)
          .where(and(eq(lotteryDraws.lottery, id), pub, lt(lotteryDraws.drawDate, iso)))
          .orderBy(desc(lotteryDraws.drawDate))
          .limit(1),
      [] as { d: string }[],
    ),
    safeRead(
      () =>
        db
          .select({ d: lotteryDraws.drawDate })
          .from(lotteryDraws)
          .where(and(eq(lotteryDraws.lottery, id), pub, gt(lotteryDraws.drawDate, iso)))
          .orderBy(asc(lotteryDraws.drawDate))
          .limit(1),
      [] as { d: string }[],
    ),
  ]);
  return { prev: prev[0]?.d ?? null, next: next[0]?.d ?? null };
});

/** (lottery, date, last update) of every published draw – for the sitemap. */
export const getOtherDateKeys = async () =>
  safeRead(
    () =>
      db
        .select({ lottery: lotteryDraws.lottery, drawDate: lotteryDraws.drawDate, updatedAt: sql<Date>`max(${lotteryDraws.updatedAt})`.mapWith(lotteryDraws.updatedAt) })
        .from(lotteryDraws)
        .where(pub)
        .groupBy(lotteryDraws.lottery, lotteryDraws.drawDate)
        .orderBy(desc(lotteryDraws.drawDate)),
    [] as { lottery: string; drawDate: string; updatedAt: Date }[],
  );
