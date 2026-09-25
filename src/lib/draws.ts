import { weekdayOf, WEEKDAYS } from "./time";

export const SLOTS = ["1pm", "6pm", "8pm"] as const;
export type Slot = (typeof SLOTS)[number];

export const isSlot = (s: string): s is Slot => (SLOTS as readonly string[]).includes(s);

export type SlotMeta = {
  slot: Slot;
  label: string; // "1 PM"
  time: string; // "1:00 PM"
  hour: number;
  minute: number;
  period: string; // Morning / Day / Night
  state: string;
  path: string; // live page
  expected: string; // expected publish window text
};

export const SLOT_META: Record<Slot, SlotMeta> = {
  "1pm": {
    slot: "1pm",
    label: "1 PM",
    time: "1:00 PM",
    hour: 13,
    minute: 0,
    period: "Morning",
    state: "Nagaland",
    path: "/lottery-sambad-1pm-result",
    expected: "1:05 PM – 1:15 PM",
  },
  "6pm": {
    slot: "6pm",
    label: "6 PM",
    time: "6:00 PM",
    hour: 18,
    minute: 0,
    period: "Day",
    state: "Sikkim",
    path: "/lottery-sambad-6pm-result",
    expected: "6:05 PM – 6:15 PM",
  },
  "8pm": {
    slot: "8pm",
    label: "8 PM",
    time: "8:00 PM",
    hour: 20,
    minute: 0,
    period: "Night",
    state: "Nagaland",
    path: "/lottery-sambad-8pm-result",
    expected: "8:05 PM – 8:15 PM",
  },
};

/** Default weekly draw names (index 0 = Sunday). Editable in Admin → Settings. */
export const DEFAULT_SCHEDULE: Record<Slot, string[]> = {
  "1pm": ["Wish", "Rise", "Shine", "Spark", "Star", "Victory", "Vision"],
  "6pm": ["Empire", "Legend", "Prestige", "Regal", "Supreme", "Crown", "Elite"],
  "8pm": ["Magic", "Clover", "Destiny", "Dream", "Fame", "Horizon", "Lucky"],
};

export function drawNameFor(slot: Slot, iso: string, schedule: Record<Slot, string[]> = DEFAULT_SCHEDULE) {
  const wd = weekdayOf(iso);
  const name = schedule[slot]?.[wd] || DEFAULT_SCHEDULE[slot][wd];
  return `Dear ${name} ${WEEKDAYS[wd]}`;
}

/** "DEAR VICTORY FRIDAY" -> "Dear Victory Friday" */
export function titleCaseDraw(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export type TierKey = "first" | "cons" | "second" | "third" | "fourth" | "fifth";

export type Tier = {
  key: TierKey;
  label: string;
  short: string;
  digits: number; // digits matched from the end of the ticket
  expected: number; // expected count of winning numbers
};

export const TIERS: Tier[] = [
  { key: "first", label: "1st Prize", short: "1st", digits: 0, expected: 1 },
  { key: "cons", label: "Consolation Prize", short: "Cons.", digits: 5, expected: 1 },
  { key: "second", label: "2nd Prize", short: "2nd", digits: 5, expected: 10 },
  { key: "third", label: "3rd Prize", short: "3rd", digits: 4, expected: 10 },
  { key: "fourth", label: "4th Prize", short: "4th", digits: 4, expected: 10 },
  { key: "fifth", label: "5th Prize", short: "5th", digits: 4, expected: 100 },
];

export const DEFAULT_PRIZES: Record<TierKey, string> = {
  first: "₹1 Crore",
  cons: "₹1,000",
  second: "₹9,000",
  third: "₹500",
  fourth: "₹250",
  fifth: "₹120",
};

export type DrawData = {
  firstPrize: string | null;
  consPrize: string | null;
  secondPrize: string[];
  thirdPrize: string[];
  fourthPrize: string[];
  fifthPrize: string[];
};

export function tierNumbers(r: DrawData, key: TierKey): string[] {
  switch (key) {
    case "first":
      return r.firstPrize ? [r.firstPrize] : [];
    case "cons":
      return r.consPrize ? [r.consPrize] : [];
    case "second":
      return r.secondPrize ?? [];
    case "third":
      return r.thirdPrize ?? [];
    case "fourth":
      return r.fourthPrize ?? [];
    case "fifth":
      return r.fifthPrize ?? [];
  }
}

/** Normalise a first-prize ticket, e.g. "84 l10051" -> "84L 10051" */
export function normalizeTicket(s: string | null | undefined): string | null {
  if (!s) return null;
  const m = /(\d{2})\s*([A-Z])\s*(\d{5})/i.exec(s);
  if (!m) return null;
  return `${m[1]}${m[2].toUpperCase()} ${m[3]}`;
}

export type TicketMatch = { tier: Tier; number: string };

/** Check a ticket (e.g. "84L 10051" or "10051") against a draw. */
export function checkTicket(input: string, r: DrawData): TicketMatch[] {
  const clean = input.toUpperCase().replace(/[^0-9A-Z]/g, "");
  const digits = clean.replace(/\D/g, "");
  const full = normalizeTicket(clean);
  const last5 = digits.slice(-5);
  const last4 = digits.slice(-4);
  const out: TicketMatch[] = [];
  const tier = (k: TierKey) => TIERS.find((t) => t.key === k)!;
  const first = normalizeTicket(r.firstPrize);
  if (first && full && first === full) out.push({ tier: tier("first"), number: first });
  else if (first && last5.length === 5 && first.endsWith(last5)) {
    // same 5 digits in another series -> consolation prize
    out.push({ tier: tier("cons"), number: last5 });
  }
  if (last5.length === 5 && r.secondPrize?.includes(last5)) out.push({ tier: tier("second"), number: last5 });
  if (last4.length === 4) {
    for (const k of ["third", "fourth", "fifth"] as const) {
      if (tierNumbers(r, k).includes(last4)) out.push({ tier: tier(k), number: last4 });
    }
  }
  return out;
}
