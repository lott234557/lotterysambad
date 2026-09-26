/** Auto-fetch windows (shared by server and the admin dashboard). Minutes are relative to the draw time. */
import { SLOTS, SLOT_META, type Slot } from "./draws";

export const FAST_FROM = 1; // 1:01 PM, 6:01 PM, 8:01 PM
export const FAST_TO = 20; // … until 1:20 / 6:20 / 8:20 – one fetch every 25 s
export const SLOW_TO = 150; // then every 2 min while still incomplete, up to 2.5 h after the draw
export const FAST_GAP_S = 25;
export const SLOW_GAP_S = 120;

export type DueSlot = { slot: Slot; gap: number; phase: "fast" | "slow" };

const drawMinute = (slot: Slot) => SLOT_META[slot].hour * 60 + SLOT_META[slot].minute;

/** Draws that are inside a fetch window at `minuteOfDay` (IST). */
export function dueSlots(minuteOfDay: number): DueSlot[] {
  const out: DueSlot[] = [];
  for (const slot of SLOTS) {
    const d = minuteOfDay - drawMinute(slot);
    if (d >= FAST_FROM && d <= FAST_TO) out.push({ slot, gap: FAST_GAP_S, phase: "fast" });
    else if (d > FAST_TO && d <= SLOW_TO) out.push({ slot, gap: SLOW_GAP_S, phase: "slow" });
  }
  return out;
}

/** Next window start after `minuteOfDay` today, or null after the last draw. */
export function nextWindow(minuteOfDay: number): { slot: Slot; startsAtMinute: number } | null {
  for (const slot of SLOTS) {
    const start = drawMinute(slot) + FAST_FROM;
    if (start > minuteOfDay) return { slot, startsAtMinute: start };
  }
  return null;
}

/** "1:01–1:20 PM" */
export function windowLabel(slot: Slot) {
  const m = drawMinute(slot);
  const f = (x: number) => `${Math.floor(x / 60) % 12 || 12}:${String(x % 60).padStart(2, "0")}`;
  return `${f(m + FAST_FROM)}–${f(m + FAST_TO)} ${Math.floor(m / 60) < 12 ? "AM" : "PM"}`;
}
