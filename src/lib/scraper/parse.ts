/**
 * Structure-agnostic parsers for lottery result pages.
 * They rely on stable things (prize labels, number formats, image file names)
 * instead of CSS class names, so small redesigns of the source sites don't break them.
 */
import * as cheerio from "cheerio";
import { isSlot, normalizeTicket, titleCaseDraw, type Slot, type TierKey } from "../draws";
import { MONTHS, isValidISO } from "../time";

export type ImageRef = { url: string; slot: Slot | null; dateISO: string | null };

export type ParsedDraw = {
  slot: Slot | null;
  drawName: string | null;
  drawNo: string | null;
  first: string | null;
  cons: string | null;
  second: string[];
  third: string[];
  fourth: string[];
  fifth: string[];
};

export type ParsedPage = {
  draws: ParsedDraw[];
  images: ImageRef[];
  pdfs: ImageRef[];
  text: string;
};

const emptyDraw = (slot: Slot | null = null): ParsedDraw => ({
  slot,
  drawName: null,
  drawNo: null,
  first: null,
  cons: null,
  second: [],
  third: [],
  fourth: [],
  fifth: [],
});

const WEEKDAY_RE = "(SUNDAY|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY)";
const DRAW_NAME_RE = new RegExp(`\\bDEAR\\s+([A-Z]{3,15})\\s+${WEEKDAY_RE}\\b`, "i");
const SLOT_TEXT_RE = /(?<![\d:])(1|6|8)\s*(?:[:.]\s*00)?\s*(?:p\.?\s*m\b\.?)/i;

export function slotFromText(t: string): Slot | null {
  const m = SLOT_TEXT_RE.exec(t);
  if (!m) return null;
  const s = `${m[1]}pm`;
  return isSlot(s) ? s : null;
}

const uniq = (a: string[]) => Array.from(new Set(a));

/** Remove money amounts, dates and times so they are not mistaken for ticket numbers. */
export function stripNoise(t: string): string {
  return t
    .replace(/(?:₹|rs\.?|inr)\s*[\d,]+(?:\.\d+)?(?:\s*\/-)?/gi, " ")
    .replace(/[\d,]+\s*\/-/g, " ")
    .replace(/\d+(?:\.\d+)?\s*(?:crore|cr\b|lakh|lac|thousand)/gi, " ")
    .replace(/\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g, " ")
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?/gi, " ")
    .replace(new RegExp(`\\b\\d{1,2}\\s+(?:${MONTHS.join("|")}|${MONTHS.map((m) => m.slice(0, 3)).join("|")})[a-z]*,?\\s+\\d{4}\\b`, "gi"), " ")
    .replace(new RegExp(`\\b(?:${MONTHS.join("|")})\\s+\\d{1,2},?\\s+\\d{4}\\b`, "gi"), " ");
}

export function classifyLabel(label: string): TierKey | null {
  const l = label.toLowerCase().replace(/\s+/g, " ").trim();
  if (!l || l.length > 60) return null;
  if (/\bcons(?:olation|\.)?\b/.test(l)) return "cons";
  if (/\b(1st|first)\b/.test(l)) return "first";
  if (/\b(2nd|second)\b/.test(l)) return "second";
  if (/\b(3rd|third)\b/.test(l)) return "third";
  if (/\b(4th|fourth)\b/.test(l)) return "fourth";
  if (/\b(5th|fifth)\b/.test(l)) return "fifth";
  return null;
}

export function numbersFor(key: TierKey, raw: string): string[] {
  const t = stripNoise(raw);
  if (key === "first") {
    const n = normalizeTicket(t);
    return n ? [n] : [];
  }
  if (key === "cons") {
    const m = /(?<!\d)(\d{5})(?!\d)/.exec(t);
    return m ? [m[1]] : [];
  }
  const re = key === "second" ? /(?<![\dA-Z])\d{5}(?![\d])/gi : /(?<![\dA-Z])\d{4}(?![\d])/gi;
  return uniq(t.match(re) ?? []);
}

function applyTier(d: ParsedDraw, key: TierKey, value: string) {
  const nums = numbersFor(key, value);
  if (!nums.length) return;
  if (key === "first") d.first ??= nums[0];
  else if (key === "cons") d.cons ??= nums[0];
  else if (d[key].length < nums.length) d[key] = nums;
}

export const tierScore = (d: ParsedDraw) =>
  (d.first ? 50 : 0) + (d.cons ? 5 : 0) + d.second.length + d.third.length + d.fourth.length + d.fifth.length;

/* ------------------------------------------------------------------ */
/* image / pdf references                                              */
/* ------------------------------------------------------------------ */

const MONTH_IDX = new Map(
  MONTHS.flatMap((m, i) => [
    [m.toLowerCase(), i + 1],
    [m.slice(0, 3).toLowerCase(), i + 1],
  ]),
);

function classifyAsset(url: string): { slot: Slot | null; dateISO: string | null } {
  const u = decodeURIComponent(url).toLowerCase();
  let slot: Slot | null = null;
  let dateISO: string | null = null;
  // lottery-sambad-1pm-25-09-2026.jpg
  let m = /(?:^|[^\d])(1|6|8)\s*-?\s*pm[-_](\d{2})[-_.](\d{2})[-_.](\d{4})/.exec(u);
  if (m) {
    slot = `${m[1]}pm` as Slot;
    dateISO = `${m[4]}-${m[3]}-${m[2]}`;
  } else {
    // dear-lottery-sambad-8-pm-25-september-2026-...
    m = /(?:^|[^\d])(1|6|8)\s*-?\s*pm[-_](\d{1,2})[-_]([a-z]{3,9})[-_](\d{4})/.exec(u);
    if (m && MONTH_IDX.has(m[3])) {
      slot = `${m[1]}pm` as Slot;
      dateISO = `${m[4]}-${String(MONTH_IDX.get(m[3])).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
    } else {
      // 25-09-2026-1pm / 25.09.26 ...
      m = /(\d{2})[-_.](\d{2})[-_.](\d{4})[-_](1|6|8)\s*-?\s*pm/.exec(u);
      if (m) {
        slot = `${m[4]}pm` as Slot;
        dateISO = `${m[3]}-${m[2]}-${m[1]}`;
      }
    }
  }
  if (dateISO && !isValidISO(dateISO)) dateISO = null;
  return { slot, dateISO };
}

export function extractAssets(html: string, baseUrl: string): { images: ImageRef[]; pdfs: ImageRef[] } {
  const re = /(?:https?:)?\/\/[^\s"'<>()\\]+?\.(?:webp|jpe?g|png|pdf)(?:\?[^\s"'<>\\]*)?|(?<=["'(\s,=])\/[^\s"'<>()\\]+?\.(?:webp|jpe?g|png|pdf)(?:\?[^\s"'<>\\]*)?/gi;
  const found = new Set<string>();
  for (const m of html.matchAll(re)) {
    try {
      found.add(new URL(m[0].replace(/&amp;/g, "&"), baseUrl).toString());
    } catch {
      /* ignore */
    }
  }
  const images: ImageRef[] = [];
  const pdfs: ImageRef[] = [];
  for (const url of found) {
    const c = classifyAsset(url);
    if (!c.slot) continue;
    const ref = { url, ...c };
    if (/\.pdf(\?|$)/i.test(url)) pdfs.push(ref);
    else images.push(ref);
  }
  return { images, pdfs };
}

/* ------------------------------------------------------------------ */
/* page parsing                                                        */
/* ------------------------------------------------------------------ */

function cleanText(s: string) {
  return s.replace(/ /g, " ").replace(/[ \t]+/g, " ").trim();
}

/** Parse all draws found in a page. */
export function parsePage(html: string, baseUrl: string): ParsedPage {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, template").remove();

  // Block-level newlines so text parsing keeps structure.
  $("br").replaceWith("\n");
  $("p, div, li, tr, h1, h2, h3, h4, h5, h6, section, article, table").each((_, el) => {
    $(el).append("\n");
  });
  const text = cleanText($("body").text() || $.root().text()).replace(/\n\s*\n+/g, "\n");

  const all = $("body *").toArray();
  const indexOf = new Map(all.map((el, i) => [el, i] as const));

  const draws: ParsedDraw[] = [];

  // 1) Table based: every table that has at least one prize row.
  $("table").each((_, table) => {
    const d = emptyDraw();
    let rows = 0;
    $(table)
      .find("tr")
      .each((__, tr) => {
        const cells = $(tr).children("td, th").toArray();
        if (cells.length < 2) return;
        const key = classifyLabel($(cells[0]).text());
        if (!key) return;
        const value = cells
          .slice(1)
          .map((c) => $(c).text())
          .join(" ");
        applyTier(d, key, value);
        rows++;
      });
    if (!rows || tierScore(d) < 50) return; // must at least have a first prize

    // Context: walk back in document order until the previous table.
    const idx = indexOf.get(table) ?? 0;
    const ctxParts: string[] = [];
    const caption = cleanText($(table).find("caption, thead").first().text());
    if (caption) ctxParts.push(caption);
    for (let i = idx - 1, steps = 0; i >= 0 && steps < 600; i--, steps++) {
      const el = all[i];
      if (el.tagName === "table") break;
      if (/^h[1-6]$|^caption$|^strong$|^b$|^p$|^span$|^div$|^em$|^i$/.test(el.tagName)) {
        const own = cleanText($(el).clone().children().remove().end().text());
        if (own && own.length < 140) ctxParts.push(own);
      }
    }
    for (const part of ctxParts) {
      if (!d.slot) d.slot = slotFromText(part);
      if (!d.drawName) {
        const n = DRAW_NAME_RE.exec(part);
        if (n) d.drawName = titleCaseDraw(`Dear ${n[1]} ${n[2]}`);
      }
      if (!d.drawNo) {
        const n = /draw\s*no\.?\s*[:\-]?\s*(\d{1,4})/i.exec(part);
        if (n) d.drawNo = n[1];
      }
    }
    draws.push(d);
  });

  // 2) Text fallback when no usable table was found.
  if (!draws.length) {
    const d = parseTiersFromText(text);
    if (d.first) {
      // slot stays null: single-draw pages are fetched for a known slot (menus mention every slot)
      const n = DRAW_NAME_RE.exec(text);
      if (n) d.drawName = titleCaseDraw(`Dear ${n[1]} ${n[2]}`);
      const dn = /draw\s*no\.?\s*[:\-]?\s*(\d{1,4})/i.exec(text);
      if (dn) d.drawNo = dn[1];
      draws.push(d);
    } else {
      // Headline-only pages: the first ticket number near the top is the 1st prize.
      const head = stripNoise(text.slice(0, 3000));
      const first = normalizeTicket(head);
      if (first) {
        const h = emptyDraw();
        h.first = first;
        draws.push(h);
      }
    }
  }

  // Page-level draw name / number when a single draw has none.
  if (draws.length === 1) {
    const d = draws[0];
    if (!d.drawName) {
      const n = DRAW_NAME_RE.exec(text);
      if (n) d.drawName = titleCaseDraw(`Dear ${n[1]} ${n[2]}`);
    }
    if (!d.drawNo) {
      const dn = /draw\s*no\.?\s*[:\-]?\s*(\d{1,4})/i.exec(text);
      if (dn) d.drawNo = dn[1];
    }
  }

  const { images, pdfs } = extractAssets(html, baseUrl);
  return { draws, images, pdfs, text };
}

/** Label-scanning parser for pages without prize tables. */
export function parseTiersFromText(text: string): ParsedDraw {
  const d = emptyDraw();
  const labelRe = /\b(1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth)\s*prize\b|\bcons(?:olation|\.)?\s*prize\b/gi;
  const marks: { key: TierKey; start: number; end: number }[] = [];
  for (const m of text.matchAll(labelRe)) {
    const key = classifyLabel(m[0]);
    if (key) marks.push({ key, start: m.index!, end: m.index! + m[0].length });
  }
  // For each tier keep the segment that yields the most numbers.
  const best: Partial<Record<TierKey, string[]>> = {};
  marks.forEach((mk, i) => {
    const segEnd = i + 1 < marks.length ? marks[i + 1].start : Math.min(text.length, mk.end + 1500);
    const seg = text.slice(mk.end, segEnd);
    const nums = numbersFor(mk.key, seg);
    if (mk.key === "first" || mk.key === "cons") {
      if (!best[mk.key] && nums.length) best[mk.key] = nums;
    } else if (nums.length > (best[mk.key]?.length ?? 0)) best[mk.key] = nums;
  });
  d.first = best.first?.[0] ?? null;
  d.cons = best.cons?.[0] ?? null;
  d.second = best.second ?? [];
  d.third = best.third ?? [];
  d.fourth = best.fourth ?? [];
  d.fifth = best.fifth ?? [];
  return d;
}

/** All the ways a date may be written on a result page. */
export function dateVariants(iso: string): string[] {
  const [y, m, d] = iso.split("-");
  const yy = y.slice(2);
  const mi = Number(m) - 1;
  const dn = String(Number(d));
  return [
    `${d}.${m}.${y}`,
    `${d}.${m}.${yy}`,
    `${d}/${m}/${y}`,
    `${d}/${m}/${yy}`,
    `${d}-${m}-${y}`,
    `${dn} ${MONTHS[mi]} ${y}`,
    `${dn} ${MONTHS[mi].slice(0, 3)} ${y}`,
    `${d} ${MONTHS[mi]} ${y}`,
    `${d} ${MONTHS[mi].slice(0, 3)} ${y}`,
    `${MONTHS[mi]} ${dn}, ${y}`,
    `${MONTHS[mi].slice(0, 3)} ${dn}, ${y}`,
  ];
}

export function textMentionsDate(text: string, iso: string): boolean {
  const t = text.toLowerCase();
  return dateVariants(iso).some((v) => t.includes(v.toLowerCase()));
}
