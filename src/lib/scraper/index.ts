import "server-only";
import { and, desc, eq, lt, ne } from "drizzle-orm";
import { db } from "../db";
import { results, scrapeLogs, type Result } from "../db/schema";
import { SLOT_META, drawNameFor, normalizeTicket, type Slot } from "../draws";
import { getSettingsFresh } from "../settings";
import { toWebp } from "../image";
import { saveMedia } from "../storage";
import { isoToDMY } from "../time";
import { fetchImage } from "./fetch";
import { tierScore, type ParsedDraw } from "./parse";
import { SOURCES, imageProbeUrls, pdfProbeUrl, runSource, type Candidate } from "./sources";
import { pingIndexNow } from "../indexnow";

export type ScrapeOutcome = {
  date: string;
  slot: Slot;
  status: "success" | "partial" | "waiting" | "error" | "skipped";
  message: string;
  changed: boolean;
};

const EXPECTED = { second: 10, third: 10, fourth: 10, fifth: 100 };

export function isCompleteResult(r: Pick<Result, "firstPrize" | "secondPrize" | "thirdPrize" | "fourthPrize" | "fifthPrize" | "imageKey">) {
  return !!(
    r.firstPrize &&
    r.imageKey &&
    r.secondPrize.length >= EXPECTED.second &&
    r.thirdPrize.length >= EXPECTED.third &&
    r.fourthPrize.length >= EXPECTED.fourth &&
    r.fifthPrize.length >= EXPECTED.fifth
  );
}

/** In-memory memo so warm serverless instances skip finished draws without a DB hit. */
const done = new Set<string>();

async function log(entry: { date: string; slot: Slot; status: string; source?: string; message: string; ms: number }) {
  try {
    await db.insert(scrapeLogs).values({
      drawDate: entry.date,
      slot: entry.slot,
      status: entry.status,
      source: entry.source?.slice(0, 120),
      message: entry.message.slice(0, 4000),
      durationMs: entry.ms,
    });
  } catch (e) {
    console.warn("[scrape] log failed", (e as Error).message);
  }
}

/** Scrape one draw. Safe to call every minute – finished draws are skipped. */
export async function scrapeDraw(dateISO: string, slot: Slot, opts: { force?: boolean } = {}): Promise<ScrapeOutcome> {
  const t0 = Date.now();
  const memoKey = `${dateISO}:${slot}`;
  if (!opts.force && done.has(memoKey)) {
    return { date: dateISO, slot, status: "skipped", message: "already complete (memo)", changed: false };
  }

  const existingRows = await db
    .select()
    .from(results)
    .where(and(eq(results.drawDate, dateISO), eq(results.slot, slot)))
    .limit(1);
  const existing = existingRows[0] ?? null;
  if (existing && !opts.force) {
    if (existing.isComplete) {
      done.add(memoKey);
      return { date: dateISO, slot, status: "skipped", message: "already complete", changed: false };
    }
    if (existing.source === "manual") {
      return { date: dateISO, slot, status: "skipped", message: "manually managed result", changed: false };
    }
  }

  // 1) Fetch every source in parallel.
  const settled = await Promise.all(SOURCES.map((s) => runSource(s, dateISO, slot)));
  const candidates = settled.filter((c): c is Candidate => !!c);
  const notes = candidates.map((c) => `[${c.source}] ${c.note}`);
  const confirmed = candidates.filter((c) => c.confirmed && c.draw?.first);

  // 2) Guard against stale pages: a new first prize can't equal a previous draw's first prize.
  const previous = await db
    .select({ firstPrize: results.firstPrize, drawDate: results.drawDate, slot: results.slot })
    .from(results)
    .where(and(lt(results.drawDate, dateISO), ne(results.firstPrize, "")))
    .orderBy(desc(results.drawDate))
    .limit(6);
  const sameDayOthers = await db
    .select({ firstPrize: results.firstPrize })
    .from(results)
    .where(and(eq(results.drawDate, dateISO), ne(results.slot, slot)));
  const stale = new Set([...previous, ...sameDayOthers].map((p) => normalizeTicket(p.firstPrize)).filter(Boolean) as string[]);
  const fresh = confirmed.filter((c) => !stale.has(normalizeTicket(c.draw!.first)!));
  if (confirmed.length && !fresh.length) notes.push("rejected: first prize equals a previous draw (stale page)");

  // 3) Merge: numbers from the most complete fresh candidate, other fields from any.
  const best = [...fresh].sort((a, b) => tierScore(b.draw!) - tierScore(a.draw!))[0]?.draw ?? null;
  const firsts = new Set(fresh.map((c) => normalizeTicket(c.draw!.first)));
  if (firsts.size > 1) notes.push(`warning: sources disagree on 1st prize (${[...firsts].join(", ")})`);
  const pick = <K extends keyof ParsedDraw>(k: K) => fresh.map((c) => c.draw![k]).find((v) => v) ?? null;

  // 4) Image: try found URLs + deterministic URLs.
  const imageCandidates = Array.from(
    new Set([
      ...imageProbeUrls(dateISO, slot).slice(0, 2),
      ...candidates.flatMap((c) => (c.confirmed ? c.images.map((i) => i.url) : [])),
      ...imageProbeUrls(dateISO, slot).slice(2),
    ]),
  );
  let image: { key: string; width: number; height: number; source: string } | null = null;
  const needImage = !existing?.imageKey || opts.force;
  if (needImage) {
    for (const url of imageCandidates) {
      try {
        const img = await fetchImage(url);
        if (!img) continue;
        const webp = await toWebp(img.data);
        if (webp.srcWidth < 400) continue;
        const key = `results/lottery-sambad-result-${slot}-${isoToDMY(dateISO)}-${webp.hash}.webp`;
        await saveMedia({ key, data: webp.data, contentType: "image/webp", width: webp.width, height: webp.height });
        image = { key, width: webp.width, height: webp.height, source: url };
        notes.push(`image: ${url}`);
        break;
      } catch (e) {
        notes.push(`image error ${url}: ${(e as Error).message}`);
      }
    }
  }

  const haveNumbers = !!best?.first;
  const haveImage = !!(image || existing?.imageKey);
  if (!haveNumbers && !haveImage) {
    const ms = Date.now() - t0;
    const status = candidates.some((c) => c.note.startsWith("fetch error") || c.note.startsWith("HTTP")) ? "error" : "waiting";
    await log({ date: dateISO, slot, status, message: `Result not published yet. ${notes.join(" | ")}`, ms });
    return { date: dateISO, slot, status, message: "not published yet", changed: false };
  }

  // 5) Upsert.
  const settings = await getSettingsFresh();
  const keepExistingNumbers = existing && best && tierScore(best) < scoreOf(existing);
  const numbers = !best || keepExistingNumbers
    ? {
        firstPrize: existing?.firstPrize ?? null,
        consPrize: existing?.consPrize ?? null,
        secondPrize: existing?.secondPrize ?? [],
        thirdPrize: existing?.thirdPrize ?? [],
        fourthPrize: existing?.fourthPrize ?? [],
        fifthPrize: existing?.fifthPrize ?? [],
      }
    : {
        firstPrize: normalizeTicket(best.first),
        consPrize: best.cons ?? normalizeTicket(best.first)?.split(" ")[1] ?? null,
        secondPrize: best.second,
        thirdPrize: best.third,
        fourthPrize: best.fourth,
        fifthPrize: best.fifth,
      };

  const row = {
    drawDate: dateISO,
    slot,
    drawName: pick("drawName") ?? existing?.drawName ?? drawNameFor(slot, dateISO, settings.schedule),
    drawNo: pick("drawNo") ?? existing?.drawNo ?? null,
    state: existing?.state ?? SLOT_META[slot].state,
    ...numbers,
    imageKey: image?.key ?? existing?.imageKey ?? null,
    imageWidth: image?.width ?? existing?.imageWidth ?? null,
    imageHeight: image?.height ?? existing?.imageHeight ?? null,
    imageSourceUrl: image?.source ?? existing?.imageSourceUrl ?? null,
    pdfSourceUrl:
      existing?.pdfSourceUrl ??
      fresh.flatMap((c) => c.pdfs.map((p) => p.url))[0] ??
      (haveNumbers ? pdfProbeUrl(dateISO, slot) : null),
    source: fresh[0]?.source ?? existing?.source ?? (image ? new URL(image.source).hostname : null),
    status: existing?.status ?? "published",
    publishedAt: existing?.publishedAt ?? new Date(),
    updatedAt: new Date(),
  };
  const isComplete = isCompleteResult(row);

  const changed =
    !existing ||
    existing.firstPrize !== row.firstPrize ||
    existing.imageKey !== row.imageKey ||
    scoreOf(existing) !== scoreOf(row as Result);

  await db
    .insert(results)
    .values({ ...row, isComplete })
    .onConflictDoUpdate({ target: [results.drawDate, results.slot], set: { ...row, isComplete } });

  if (isComplete) done.add(memoKey);
  const status = isComplete ? "success" : "partial";
  const ms = Date.now() - t0;
  await log({
    date: dateISO,
    slot,
    status,
    source: row.source ?? undefined,
    message: `${changed ? "Saved" : "No change"} – 1st: ${row.firstPrize ?? "-"}, image: ${row.imageKey ? "yes" : "no"}. ${notes.join(" | ")}`,
    ms,
  });
  if (changed && !existing && settings.indexNowKey) {
    pingIndexNow(settings.indexNowKey, [`/result/${isoToDMY(dateISO)}/${slot}`, SLOT_META[slot].path, "/"]).catch(() => {});
  }
  return { date: dateISO, slot, status, message: `1st prize ${row.firstPrize ?? "pending"}`, changed };
}

function scoreOf(r: Pick<Result, "firstPrize" | "consPrize" | "secondPrize" | "thirdPrize" | "fourthPrize" | "fifthPrize">) {
  return (
    (r.firstPrize ? 50 : 0) +
    (r.consPrize ? 5 : 0) +
    (r.secondPrize?.length ?? 0) +
    (r.thirdPrize?.length ?? 0) +
    (r.fourthPrize?.length ?? 0) +
    (r.fifthPrize?.length ?? 0)
  );
}
