/** Other state lotteries with result pages (not in the menu). Client-safe – no server imports. */

export const OTHER_IDS = ["kerala", "punjab", "maharashtra", "westbengal"] as const;
export type OtherId = (typeof OTHER_IDS)[number];
export const isOtherId = (s: string | null | undefined): s is OtherId => !!s && (OTHER_IDS as readonly string[]).includes(s);

export type OtherWindow = {
  /** minutes after midnight IST */
  from: number;
  fastTo: number;
  to: number;
  /** seconds between fetches */
  fastGap: number;
  slowGap: number;
};

export type OtherDef = {
  id: OtherId;
  path: string;
  state: string;
  /** main daily draw (for countdown + "expected" text), minutes after midnight IST */
  drawMinute: number;
  /** several draws per day (Maharashtra, Punjab) */
  multi: boolean;
  /**
   * Auto-fetch window (short on purpose – every fetch that finds something new rebuilds pages, which costs
   * Vercel ISR writes). Anything still missing afterwards is filled by the nightly catch-up or "Fetch now".
   * null = no scraper (West Bengal mirrors the Dear draws).
   */
  window: OtherWindow | null;
};

const hm = (h: number, m = 0) => h * 60 + m;

export const OTHER: Record<OtherId, OtherDef> = {
  kerala: {
    id: "kerala",
    path: "/kerala-lottery-result",
    state: "Kerala",
    drawMinute: hm(15),
    multi: false,
    window: { from: hm(15, 5), fastTo: hm(15, 13), to: hm(15, 13), fastGap: 60, slowGap: 60 }, // 3:05–3:13 PM
  },
  punjab: {
    id: "punjab",
    path: "/punjab-state-lottery-result",
    state: "Punjab",
    drawMinute: hm(18, 30),
    multi: true,
    window: { from: hm(18, 35), fastTo: hm(18, 43), to: hm(18, 43), fastGap: 60, slowGap: 60 }, // 6:35–6:43 PM
  },
  maharashtra: {
    id: "maharashtra",
    path: "/maharashtra-lottery-result",
    state: "Maharashtra",
    drawMinute: hm(16, 15),
    multi: true,
    window: { from: hm(16, 20), fastTo: hm(16, 28), to: hm(16, 28), fastGap: 60, slowGap: 60 }, // 4:20–4:28 PM
  },
  westbengal: {
    id: "westbengal",
    path: "/west-bengal-state-lottery-result",
    state: "West Bengal",
    drawMinute: hm(13),
    multi: true,
    window: null,
  },
};

export const OTHER_PATHS = OTHER_IDS.map((id) => OTHER[id].path);

export const otherByPath = (path: string): OtherDef | null => OTHER_IDS.map((id) => OTHER[id]).find((d) => d.path === path) ?? null;

/** Where a fetch window stands at `minuteOfDay` (IST). */
export function windowPhase(def: OtherDef, minuteOfDay: number): "fast" | "slow" | null {
  const w = def.window;
  if (!w) return null;
  if (minuteOfDay >= w.from && minuteOfDay <= w.fastTo) return "fast";
  if (minuteOfDay > w.fastTo && minuteOfDay <= w.to) return "slow";
  return null;
}

export const clockLabel = (minute: number) => {
  const h = Math.floor(minute / 60);
  return `${h % 12 || 12}:${String(minute % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
