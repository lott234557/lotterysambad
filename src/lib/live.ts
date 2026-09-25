import { SLOTS, SLOT_META } from "./draws";
import { addDays, istToEpoch, nowIST } from "./time";

const pad = (n: number) => String(n).padStart(2, "0");

export function nextDraw(now: number) {
  const t = nowIST(now);
  for (let i = 0; i < 2; i++) {
    const day = addDays(t.iso, i);
    for (const s of SLOTS) {
      const at = istToEpoch(day, SLOT_META[s].hour, SLOT_META[s].minute);
      if (at > now) return { slot: s, at };
    }
  }
  return null;
}

export function fmtCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export const fingerprint = (r: { firstPrize: string | null; imageKey: string | null; isComplete: boolean } | null | undefined) =>
  !r ? "" : r.isComplete ? "complete" : `${r.firstPrize ?? ""}|${r.imageKey ? 1 : 0}`;
