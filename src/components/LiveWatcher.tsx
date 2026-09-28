"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { istToEpoch, nowIST } from "@/lib/time";
import { SLOT_META, type Slot } from "@/lib/draws";
import { WINDOWS } from "@/lib/windows";

/**
 * Keeps "live" pages fresh without a manual reload:
 *  - During a draw's short auto-fetch window, while its result is not complete, polls the (CDN-cached)
 *    status API every 20 s.
 *    Each poll also wakes the server's built-in auto-fetch, so the result is fetched even without a cron job.
 *    As soon as the status changes the page refreshes itself.
 *  - After midnight (IST) a page rendered for yesterday asks the server to clear its cache and reloads
 *    itself with today's date.
 * `have` = slot -> fingerprint of what the page currently shows ("" when nothing).
 */
export function LiveWatcher({ date, have }: { date: string; have: Partial<Record<Slot, string>> }) {
  const router = useRouter();
  const haveRef = useRef(have);
  haveRef.current = have;
  const rollTries = useRef(0);

  // day roll-over
  useEffect(() => {
    const check = async () => {
      const today = nowIST().iso;
      if (date >= today || rollTries.current >= 3 || document.visibilityState !== "visible") return;
      rollTries.current++;
      try {
        await fetch(`/api/status?date=${today}`, { cache: "no-store" });
      } catch {}
      setTimeout(() => router.refresh(), 2500);
    };
    check();
    const t = setInterval(check, 30_000);
    return () => clearInterval(t);
  }, [date, router]);

  // live results
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    // only poll during a draw's auto-fetch window (+3 min to pick up the last save) – see src/lib/windows.ts
    const from = (s: Slot) => istToEpoch(date, Math.floor(WINDOWS[s].from / 60), WINDOWS[s].from % 60);
    const until = (s: Slot) => istToEpoch(date, Math.floor(WINDOWS[s].to / 60), WINDOWS[s].to % 60) + 4 * 60_000;
    const watched = (Object.keys(SLOT_META) as Slot[]).filter((s) => haveRef.current[s] !== "complete" && Date.now() < until(s));
    if (!watched.length) return;

    const tick = async () => {
      if (stopped) return;
      const now = Date.now();
      if (watched.every((s) => now >= until(s))) return; // all windows over – stop
      const due = watched.filter((s) => now >= from(s) && now < until(s) && haveRef.current[s] !== "complete");
      if (due.length && document.visibilityState === "visible") {
        try {
          const r = await fetch(`/api/status?date=${date}`, { cache: "no-store" });
          const j = (await r.json()) as { slots: Record<string, { first: string | null; image: boolean; complete: boolean }> };
          const changed = due.some((s) => {
            const st = j.slots?.[s];
            if (!st) return false;
            const fp = st.complete ? "complete" : `${st.first ?? ""}|${st.image ? 1 : 0}`;
            return fp !== haveRef.current[s];
          });
          if (changed) router.refresh();
        } catch {}
      }
      // poll every 20 s once a draw is due, otherwise check again in 30 s
      timer = setTimeout(tick, due.length ? 20_000 : 30_000);
    };
    timer = setTimeout(tick, 4_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timer);
        timer = setTimeout(tick, 500);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [date, router]);
  return null;
}
