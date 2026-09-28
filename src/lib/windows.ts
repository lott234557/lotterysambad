/**
 * Auto-fetch windows for Lottery Sambad (shared by server, pages and the admin dashboard). IST.
 *
 * Kept short on purpose: every fetch that finds something new rebuilds pages, and page rebuilds are what
 * Vercel counts as "ISR Writes". Outside these windows nothing is fetched automatically; a draw that is
 * still incomplete afterwards is filled by the nightly catch-up or by "Fetch now" in the dashboard.
 * Kerala / Maharashtra / Punjab windows are in src/lib/others/config.ts.
 */
import { SLOTS, type Slot } from "./draws";

const hm = (h: number, m = 0) => h * 60 + m;

/** [from, to] minutes after midnight IST, both inclusive. */
export const WINDOWS: Record<Slot, { from: number; to: number }> = {
  "1pm": { from: hm(13, 5), to: hm(13, 13) }, // 1:05–1:13 PM
  "6pm": { from: hm(18, 5), to: hm(18, 13) }, // 6:05–6:13 PM
  "8pm": { from: hm(20, 0), to: hm(20, 12) }, // 8:00–8:12 PM
};

/** Seconds between two fetches of the same draw inside its window. */
export const FAST_GAP_S = 25;

export type DueSlot = { slot: Slot; gap: number; phase: "fast" };

/** Draws whose window is open at `minuteOfDay` (IST). */
export function dueSlots(minuteOfDay: number): DueSlot[] {
  return SLOTS.filter((s) => minuteOfDay >= WINDOWS[s].from && minuteOfDay <= WINDOWS[s].to).map((slot) => ({ slot, gap: FAST_GAP_S, phase: "fast" as const }));
}

/** Next window start after `minuteOfDay` today, or null after the last one. */
export function nextWindow(minuteOfDay: number): { slot: Slot; startsAtMinute: number } | null {
  for (const slot of SLOTS) if (WINDOWS[slot].from > minuteOfDay) return { slot, startsAtMinute: WINDOWS[slot].from };
  return null;
}

const clock = (x: number) => `${Math.floor(x / 60) % 12 || 12}:${String(x % 60).padStart(2, "0")}`;

/** "1:05–1:13 PM" */
export function windowLabel(slot: Slot) {
  const w = WINDOWS[slot];
  return `${clock(w.from)}–${clock(w.to)} ${Math.floor(w.from / 60) < 12 ? "AM" : "PM"}`;
}
