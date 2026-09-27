/**
 * Structure-agnostic parser for Kerala / Punjab / Maharashtra (and pasted) lottery results.
 * Works on the visible text of a page: finds prize headings ("1st Prize Rs.1,00,00,000/-",
 * "Consolation Prize", "FIRST PRIZE", "first prize of ₹21 Lakh was won by …") and collects the
 * ticket numbers that follow each heading. Draw names/sections are detected for pages that hold
 * several draws (Maharashtra weekly lotteries on one page).
 * Pure functions only – shared by the scraper, the admin "paste result" import and tests.
 */
import * as cheerio from "cheerio";
import type { DrawTier } from "../db/schema";

export type LotteryKind = "kerala" | "punjab" | "maharashtra" | "westbengal";

/* ---------------- text ---------------- */

const BLOCK = "p,div,section,article,header,footer,li,ul,ol,table,thead,tbody,tr,h1,h2,h3,h4,h5,h6,blockquote,figure,figcaption,dt,dd,center";

/** Visible text of an HTML page with one line per block element / table row. */
export function htmlToText(html: string): string {
  const $ = cheerio.load(html);
  $("script,style,noscript,svg,iframe,form,nav,button,select,template").remove();
  $("br").replaceWith("\n");
  $("td,th").each((_, el) => {
    $(el).append(" ");
  });
  $(BLOCK).each((_, el) => {
    $(el).prepend("\n").append("\n");
  });
  return cleanText($("body").length ? $("body").text() : $.root().text());
}

export function cleanText(s: string) {
  return s
    .replace(/ /g, " ")
    .replace(/[\t\r]+/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}

export function pageTitle(html: string) {
  const $ = cheerio.load(html);
  return ($("h1").first().text() || $("title").text() || "").replace(/\s+/g, " ").trim();
}

/** og:image / first large content images (absolute URLs). */
export function pageImages(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const out: string[] = [];
  const add = (u?: string | null) => {
    if (!u) return;
    try {
      const abs = new URL(u.trim(), baseUrl).toString();
      if (/\.(jpe?g|png|webp)(\?|$)/i.test(abs) && !out.includes(abs)) out.push(abs);
    } catch {}
  };
  add($('meta[property="og:image"]').attr("content"));
  $("article img, .entry-content img, .post-body img, .post img, main img, img").each((_, el) => {
    const $el = $(el);
    add($el.attr("data-src") || $el.attr("data-lazy-src") || $el.attr("src"));
  });
  return out.filter((u) => !/logo|icon|avatar|emoji|gravatar|favicon|banner-ad|placeholder/i.test(u)).slice(0, 12);
}

/** All links (absolute) on a page with their text. */
export function pageLinks(html: string, baseUrl: string): { href: string; text: string }[] {
  const $ = cheerio.load(html);
  const out: { href: string; text: string }[] = [];
  $("a[href]").each((_, el) => {
    try {
      out.push({ href: new URL(String($(el).attr("href")).trim(), baseUrl).toString(), text: $(el).text().replace(/\s+/g, " ").trim() });
    } catch {}
  });
  return out;
}

/* ---------------- dates ---------------- */

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/** Regexes that match `iso` (YYYY-MM-DD) written in the usual Indian formats. */
export function dateRegexes(iso: string): RegExp[] {
  const [y, m, d] = iso.split("-");
  const dn = Number(d);
  const mn = Number(m);
  const yy = y.slice(2);
  const mon = MONTHS[mn - 1];
  const D = `0?${dn}`;
  const M = `0?${mn}`;
  const ord = "(?:st|nd|rd|th)?";
  return [
    new RegExp(`\\b${D}\\s*[-/.]\\s*${M}\\s*[-/.]\\s*(?:${y}|${yy})\\b`),
    new RegExp(`\\b${y}\\s*[-/.]\\s*${m}\\s*[-/.]\\s*${d}\\b`),
    new RegExp(`\\b${D}${ord}\\s*(?:of\\s+)?(?:${mon}|${mon.slice(0, 3)})\\.?,?\\s*${y}\\b`, "i"),
    new RegExp(`\\b(?:${mon}|${mon.slice(0, 3)})\\.?\\s*${D}${ord},?\\s*${y}\\b`, "i"),
  ];
}

export const mentionsDate = (text: string, iso: string) => dateRegexes(iso).some((r) => r.test(text));

/** Remove dates / times so years and clock times are never read as winning numbers. */
function stripDates(s: string) {
  return s
    .replace(/\b\d{1,2}\s*[-/.]\s*\d{1,2}\s*[-/.]\s*\d{2,4}\b/g, " ")
    .replace(/\b\d{4}\s*[-/.]\s*\d{1,2}\s*[-/.]\s*\d{1,2}\b/g, " ")
    .replace(new RegExp(`\\b\\d{1,2}(?:st|nd|rd|th)?\\s*(?:${MONTHS.map((m) => `${m}|${m.slice(0, 3)}`).join("|")})\\.?,?\\s*\\d{4}\\b`, "gi"), " ")
    .replace(new RegExp(`\\b(?:${MONTHS.map((m) => `${m}|${m.slice(0, 3)}`).join("|")})\\.?\\s*\\d{1,2}(?:st|nd|rd|th)?,?\\s*\\d{4}\\b`, "gi"), " ")
    .replace(/\b\d{1,2}[:.]\d{2}\s*(?:[ap]\.?m\.?)?/gi, " ")
    .replace(/\b(?:19|20)\d{2}\s*[-–]\s*(?:19|20)?\d{2}\b/g, " ");
}

/* ---------------- amounts ---------------- */

/** "Rs.1,00,00,000/-", "₹ 30 Lakh", "Rs :10000000/-" → "₹1 Crore", "₹30 Lakh", "₹5,000" */
export function formatAmount(raw: string): string | undefined {
  const m = /(?:rs\.?|₹|inr)\s*[:\-]?\s*([\d,]+(?:\.\d+)?)\s*(?:\/-)?\s*(crores?|cr\b|lakhs?|lacs?|lakh)?/i.exec(raw);
  if (!m) return undefined;
  const unit = (m[2] ?? "").toLowerCase();
  const n = Number(m[1].replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return undefined;
  let rupees = n;
  if (unit.startsWith("cr")) rupees = n * 1e7;
  else if (unit.startsWith("la")) rupees = n * 1e5;
  const trim = (x: number) => String(Math.round(x * 100) / 100);
  if (rupees >= 1e7) return `₹${trim(rupees / 1e7)} Crore`;
  if (rupees >= 1e5) return `₹${trim(rupees / 1e5)} Lakh`;
  return `₹${Math.round(rupees).toLocaleString("en-IN")}`;
}

/* ---------------- ticket formats ---------------- */

type Formats = { full: RegExp; short: RegExp; normalize: (m: RegExpExecArray) => string };

export const FORMATS: Record<LotteryKind, Formats> = {
  // RA 494226 (ATTINGAL)
  kerala: {
    full: /\b([A-Z]{2})\s?-?\s?(\d{6})\b(?:\s*\(\s*([A-Za-z .]{3,30}?)\s*\))?/g,
    short: /(?<![\d.,])\b\d{4}\b(?!\d|[.,]\d)/g,
    normalize: (m) => `${m[1]} ${m[2]}${m[3] ? ` (${m[3].trim().toUpperCase()})` : ""}`,
  },
  // VL-08-6375, SR-05-3535
  maharashtra: {
    full: /\b([A-Z]{1,3})\s?-\s?(\d{1,2})\s?-\s?(\d{4,5})\b/g,
    short: /(?<![\d.,-])\b\d{4,5}\b(?!\d|[.,-]\d)/g,
    normalize: (m) => `${m[1]}-${m[2].padStart(2, "0")}-${m[3]}`,
  },
  // B 11949, B 896239
  punjab: {
    full: /\b([A-Z])\s?-?\s?(\d{5,6})\b/g,
    short: /(?<![\d.,])\b\d{4,5}\b(?!\d|[.,]\d)/g,
    normalize: (m) => `${m[1]} ${m[2]}`,
  },
  // Dear style: 56A 12345
  westbengal: {
    full: /\b(\d{2})\s?([A-Z])\s?(\d{5})\b/g,
    short: /(?<![\d.,])\b\d{4,5}\b(?!\d|[.,]\d)/g,
    normalize: (m) => `${m[1]}${m[2]} ${m[3]}`,
  },
};

/* ---------------- tiers ---------------- */

const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth"];
const TIER_RE = new RegExp(
  `\\b(?:(\\d{1,2})\\s*(?:st|nd|rd|th)|(${ORDINALS.join("|")})|(consolation|cons\\.))\\s*prizes?\\b`,
  "gi",
);
const STOP_RE =
  /\b(repeated numbers?|disclaimer|also read|related (?:posts|results)|previous results?|prize structure|how to check|frequently asked|faqs?\b|share this|next draw|important note|claim (?:your|the) prize|result chart|you may also like|download pdf)\b/i;

const ordinalLabel = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"} Prize`;

type RawHeading = { idx: number; end: number; label: string; rank: number };

function headings(text: string): RawHeading[] {
  const out: RawHeading[] = [];
  TIER_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TIER_RE.exec(text))) {
    let rank = 0;
    let label = "";
    if (m[1]) {
      rank = Number(m[1]);
      label = ordinalLabel(rank);
    } else if (m[2]) {
      rank = ORDINALS.indexOf(m[2].toLowerCase()) + 1;
      label = ordinalLabel(rank);
    } else {
      rank = 1.5; // consolation sits right after the 1st prize
      label = "Consolation Prize";
    }
    out.push({ idx: m.index, end: m.index + m[0].length, label, rank });
  }
  return out;
}

function numbersIn(body: string, f: Formats): { full: string[]; short: string[] } {
  const clean = stripDates(body);
  const full: string[] = [];
  const re = new RegExp(f.full.source, f.full.flags);
  let m: RegExpExecArray | null;
  let rest = clean;
  while ((m = re.exec(clean))) {
    full.push(f.normalize(m));
  }
  if (full.length) rest = clean.replace(new RegExp(f.full.source, f.full.flags), " ");
  const short = (rest.match(new RegExp(f.short.source, f.short.flags)) ?? []).map((x) => x.trim());
  return { full, short };
}

/**
 * Extract prize tiers from a block of text. When a tier label occurs several times (e.g. a prize
 * structure table AND the result), the occurrence with the most numbers wins.
 */
export function parseTiers(text: string, kind: LotteryKind): DrawTier[] {
  const f = FORMATS[kind];
  const hs = headings(text);
  const found = new Map<string, DrawTier & { rank: number }>();
  for (let i = 0; i < hs.length; i++) {
    const h = hs[i];
    const raw = text.slice(h.end, i + 1 < hs.length ? hs[i + 1].idx : Math.min(text.length, h.end + 6000));
    // amount: first money value close to the heading
    const head = raw.slice(0, 90);
    const amount = formatAmount(head);
    let body = raw;
    const am = /(?:rs\.?|₹|inr)\s*[:\-]?\s*[\d,]+(?:\.\d+)?\s*(?:\/-)?\s*(?:crores?|cr\b|lakhs?|lacs?)?(?:\s*\[[^\]]*\])?/i.exec(head);
    if (am) body = raw.slice(0, am.index) + " " + raw.slice(am.index + am[0].length);
    const exp = /drawn\s+(\d{1,4})\s+times/i.exec(body);
    const expected = exp ? Number(exp[1]) : undefined;
    body = body.replace(/\([^)]*drawn\s+\d+\s+times[^)]*\)/gi, " ").replace(/\((?:common to all series|remaining all series)\)/gi, " ");
    // stop at footer text / prose
    const lines = body.split("\n");
    const kept: string[] = [];
    let got = 0;
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      if (STOP_RE.test(line) && (got > 0 || li > 0)) break;
      const words = (line.match(/[A-Za-z]{3,}/g) ?? []).length;
      const n = numbersIn(line, f);
      const count = n.full.length + n.short.length;
      if (!count && words >= 6 && got > 0) break;
      if (/^(agent|agency|seller|place|venue|draw (?:no|date|time|held))/i.test(line)) continue;
      kept.push(line);
      got += count;
    }
    const nums = numbersIn(kept.join("\n"), f);
    const numbers = nums.full.length ? nums.full : nums.short;
    const uniq = Array.from(new Set(numbers));
    const prev = found.get(h.label);
    if (!prev || uniq.length > prev.numbers.length) {
      found.set(h.label, { label: h.label, amount: amount ?? prev?.amount, numbers: uniq, expected: expected ?? prev?.expected, rank: h.rank });
    }
  }
  return Array.from(found.values())
    .filter((t) => t.numbers.length > 0)
    .sort((a, b) => a.rank - b.rank)
    .map(({ rank: _r, ...t }) => t);
}

/* ---------------- draws on a page ---------------- */

export type ParsedDraw = {
  key: string;
  name: string;
  code?: string;
  time?: string;
  kind: "daily" | "weekly" | "monthly" | "bumper";
  tiers: DrawTier[];
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

const titleCase = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

function findTime(s: string) {
  const m = /\b(\d{1,2})[:.](\d{2})\s*([ap])\.?\s*m\b/i.exec(s) || /\b(\d{1,2})()\s*([ap])\.?\s*m\b/i.exec(s);
  if (!m) return undefined;
  return `${Number(m[1])}:${m[2] || "00"} ${m[3].toUpperCase()}M`;
}

export const KERALA_NAMES = [
  "Bhagyathara",
  "Sthree Sakthi",
  "Dhanalekshmi",
  "Karunya Plus",
  "Suvarna Keralam",
  "Karunya",
  "Samrudhi",
  "Akshaya",
  "Win Win",
  "Nirmal",
  "Fifty Fifty",
  "Karunya Plus",
];

/** Kerala: one draw per page. Name + code from the title/text, e.g. "Suvarna Keralam SK-71". */
export function parseKerala(text: string, title = ""): ParsedDraw | null {
  const tiers = parseTiers(text, "kerala");
  if (!tiers.length) return null;
  const hay = `${title}\n${text.slice(0, 3000)}`;
  let name = "";
  let code = "";
  const BAD = /^(on|no|at|to|in|of|is|by|dt|rs)$/i;
  const firstGood = (re: RegExp) => {
    let m: RegExpExecArray | null;
    while ((m = re.exec(hay))) if (!BAD.test(m[2])) return m;
    return null;
  };
  const bump = firstGood(/\b([A-Za-z]+(?:[ -][A-Za-z]+){0,3}?)\s+bumper\b[^\n]{0,40}?\b([A-Z]{2})[\s.-]*(\d{1,4})\b/gi);
  const known = firstGood(new RegExp(`\\b(${KERALA_NAMES.map((n) => n.replace(/ /g, "\\s*")).join("|")})\\b[^\\n]{0,40}?\\b([A-Z]{2})[\\s.-]*(\\d{1,4})\\b`, "gi"));
  const m = known ?? bump;
  if (m) {
    name = titleCase(m[1].replace(/\s+/g, " ")) + (m === bump ? " Bumper" : "");
    code = `${m[2].toUpperCase()}-${m[3]}`;
  }
  if (!name) name = "Kerala Lottery";
  return { key: code ? slugify(code) : "kerala", name: code ? `${name} ${code}` : name, code: code || undefined, time: "3:00 PM", kind: /bumper/i.test(name) ? "bumper" : "daily", tiers };
}

const ANY_DATE = new RegExp(
  `\\b\\d{1,2}\\s*[-/.]\\s*\\d{1,2}\\s*[-/.]\\s*\\d{2,4}\\b|\\b\\d{1,2}(?:st|nd|rd|th)?\\s*(?:${MONTHS.map((m) => m.slice(0, 3)).join("|")})[a-z]*\\.?,?\\s*\\d{4}\\b|\\b(?:${MONTHS.map((m) => m.slice(0, 3)).join("|")})[a-z]*\\.?\\s*\\d{1,2}(?:st|nd|rd|th)?,?\\s*\\d{4}\\b`,
  "i",
);

const SECTION_RE = /^(?:maharashtra\s+(?:state\s+)?|punjab\s+(?:state\s+)?)?((?:[a-z0-9]+\s+){0,4}?[a-z0-9]+)\s+(weekly|monthly|bumper|quarterly)\s+lottery\b(.*)$/i;

/**
 * Pages with several draws (Maharashtra weekly lotteries, Punjab weekly/monthly):
 * split on headings like "Vaibhavlaxmi Weekly Lottery (4:15 PM)" and parse each section.
 */
export function parseSections(text: string, kind: "maharashtra" | "punjab", dateISO?: string): ParsedDraw[] {
  const lines = text.split("\n");
  const starts: { i: number; base: string; kind: string; rest: string }[] = [];
  lines.forEach((line, i) => {
    if (line.length > 90) return;
    const m = SECTION_RE.exec(line);
    if (!m) return;
    const base = m[1].trim();
    if (/^(maharashtra|punjab|state|today|latest|all|the|previous|recent|dear lottery)$/i.test(base)) return;
    starts.push({ i, base, kind: m[2].toLowerCase(), rest: m[3] ?? "" });
  });
  const byKey = new Map<string, ParsedDraw>();
  starts.forEach((s, n) => {
    const body = lines.slice(s.i + 1, n + 1 < starts.length ? starts[n + 1].i : lines.length).join("\n");
    if (dateISO) {
      // a section that names another date (recent-results lists, "next draw on …") is not this draw
      const near = `${s.rest}\n${lines[s.i + 1] ?? ""}`;
      if (ANY_DATE.test(near) && !mentionsDate(near, dateISO)) return;
    }
    const tiers = parseTiers(body, kind);
    if (!tiers.length) return;
    const base = s.base.replace(/\b(mon|tues|wednes|thurs|fri|satur|sun)day\b/gi, "").replace(/\s+/g, " ").trim();
    const drawKind = s.kind === "weekly" ? "weekly" : s.kind === "bumper" ? "bumper" : "monthly";
    const key = slugify(drawKind === "weekly" ? base : `${base} ${drawKind}`);
    const name = `${titleCase(s.base)} ${titleCase(s.kind)}`;
    const draw: ParsedDraw = { key, name, time: findTime(s.rest) ?? findTime(body.slice(0, 200)), kind: drawKind, tiers };
    const prev = byKey.get(key);
    const score = (d: ParsedDraw) => d.tiers.reduce((a, t) => a + t.numbers.length, 0);
    if (!prev || score(draw) > score(prev)) byKey.set(key, draw);
  });
  return Array.from(byKey.values());
}

/** Punjab draw name → stable key: "Punjab State Dear 50 Jackal Saturday Weekly …" → "dear-50-jackal". */
export function punjabKey(name: string) {
  const s = name.toLowerCase().replace(/punjab|state|lottery|result|declared|live|today|weekly|\d{1,2}[:.]?\d{2}\s*[ap]m|\d+\s*[ap]m/g, " ");
  const noDay = s.replace(/\b(mon|tues|wednes|thurs|fri|satur|sun)day\b/g, " ").replace(/\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/g, " ");
  return slugify(noDay);
}

/** Tiers complete enough to stop fetching? */
export function isCompleteTiers(kind: LotteryKind, tiers: DrawTier[], hasImage: boolean) {
  const first = tiers.find((t) => t.label === "1st Prize");
  if (!first?.numbers.length) return kind === "punjab" ? false : false;
  const expectedOk = tiers.every((t) => !t.expected || t.numbers.length >= t.expected);
  if (kind === "kerala") return expectedOk && tiers.length >= 7;
  if (kind === "maharashtra") return expectedOk && tiers.length >= 5;
  if (kind === "punjab") return hasImage;
  return expectedOk && tiers.length >= 3;
}

/** First-prize ticket (without district) for lists and meta tags. */
export const firstPrizeOf = (tiers: DrawTier[]) => tiers.find((t) => t.label === "1st Prize")?.numbers[0]?.replace(/\s*\(.*\)$/, "") ?? null;
