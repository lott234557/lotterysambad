import type { Slot } from "../draws";
import { MONTHS, isoToDMY, todayIST } from "../time";
import { fetchHtml } from "./fetch";
import { parsePage, textMentionsDate, tierScore, type ImageRef, type ParsedDraw } from "./parse";

export type Candidate = {
  source: string;
  url: string;
  draw: ParsedDraw | null;
  confirmed: boolean;
  images: ImageRef[];
  pdfs: ImageRef[];
  note: string;
};

type SourceDef = {
  id: string;
  /** URL to fetch for a date/slot, or null when this source can't serve it */
  url: (dateISO: string, slot: Slot) => string | null;
  /** true when the page holds several draws (1, 6 and 8 PM) */
  multi: boolean;
};

const slotNum = (s: Slot) => s.replace("pm", "");

export const SOURCES: SourceDef[] = [
  {
    id: "sambad.com/today",
    url: (d, s) => (d === todayIST() ? `https://sambad.com/today-${s}` : null),
    multi: false,
  },
  {
    id: "lottery.sambad.com/today",
    url: (d, s) => (d === todayIST() ? `https://lottery.sambad.com/today/${slotNum(s)}-pm/` : null),
    multi: false,
  },
  {
    id: "sambad.com/date",
    url: (d) => `https://sambad.com/${isoToDMY(d)}`,
    multi: true,
  },
];

/** Deterministic result-image URLs published by the source sites (best quality first). */
export function imageProbeUrls(dateISO: string, slot: Slot): string[] {
  const dmy = isoToDMY(dateISO);
  const [y, m, d] = dateISO.split("-");
  const month = MONTHS[Number(m) - 1].toLowerCase();
  const wp = (day: string) =>
    `https://lotterysambadresult.in/wp-content/uploads/${y}/${m}/dear-lottery-sambad-${slotNum(slot)}-pm-${day}-${month}-${y}-winner-list.webp`;
  return [
    `https://lottery.sambad.com/images/lottery-sambad-${slot}-${dmy}.jpg`,
    `https://sambad.com/images/lottery-sambad-${slot}-${dmy}.webp`,
    `https://lottery.sambad.com/images/mobile/lottery-sambad-${slot}-${dmy}.webp`,
    wp(d),
    ...(d.startsWith("0") ? [wp(String(Number(d)))] : []),
  ];
}

export function pdfProbeUrl(dateISO: string, slot: Slot) {
  return `https://lottery.sambad.com/pdf/lottery-sambad-${slot}-${isoToDMY(dateISO)}.pdf`;
}

const SLOT_ORDER: Slot[] = ["1pm", "6pm", "8pm"];

/** Decide whether a parsed page really shows the requested date (not yesterday's result). */
export function confirmDate(
  page: { images: ImageRef[]; text: string },
  dateISO: string,
  slot: Slot,
  multi: boolean,
): { ok: boolean; why: string } {
  const forSlot = page.images.filter((i) => i.slot === slot && i.dateISO);
  if (forSlot.some((i) => i.dateISO === dateISO)) return { ok: true, why: "image date matches" };
  if (forSlot.length && !multi) return { ok: false, why: `page shows image for ${forSlot[0].dateISO}` };
  const head = multi ? page.text : page.text.slice(0, 5000);
  if (textMentionsDate(head, dateISO)) return { ok: true, why: "date found in page text" };
  return { ok: false, why: "requested date not found on page" };
}

export function pickDraw(draws: ParsedDraw[], slot: Slot, multi: boolean): ParsedDraw | null {
  if (!draws.length) return null;
  const exact = draws.filter((d) => d.slot === slot).sort((a, b) => tierScore(b) - tierScore(a));
  if (exact.length) return exact[0];
  if (multi) {
    // Three result tables without detectable headings -> assume page order 1, 6, 8 PM.
    if (draws.length === 3 && draws.every((d) => !d.slot)) return draws[SLOT_ORDER.indexOf(slot)];
    return null;
  }
  // Single-draw page: take the strongest table without a conflicting slot.
  const free = draws.filter((d) => !d.slot).sort((a, b) => tierScore(b) - tierScore(a));
  return free[0] ?? null;
}

export async function runSource(src: SourceDef, dateISO: string, slot: Slot): Promise<Candidate | null> {
  const url = src.url(dateISO, slot);
  if (!url) return null;
  const base: Candidate = { source: src.id, url, draw: null, confirmed: false, images: [], pdfs: [], note: "" };
  try {
    const res = await fetchHtml(url);
    if (!res.ok) return { ...base, note: `HTTP ${res.status}` };
    const page = parsePage(res.text, res.url);
    const conf = confirmDate(page, dateISO, slot, src.multi);
    const draw = pickDraw(page.draws, slot, src.multi);
    return {
      ...base,
      draw,
      confirmed: conf.ok,
      images: page.images.filter((i) => i.slot === slot && i.dateISO === dateISO),
      pdfs: page.pdfs.filter((i) => i.slot === slot && i.dateISO === dateISO),
      note: `${conf.why}; ${draw ? `first=${draw.first ?? "-"} tiers=${draw.second.length}/${draw.third.length}/${draw.fourth.length}/${draw.fifth.length}` : "no result table"}`,
    };
  } catch (e) {
    return { ...base, note: `fetch error: ${(e as Error).message}` };
  }
}
