"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { istToEpoch } from "@/lib/time";
import { SLOT_META, type Slot } from "@/lib/draws";

/**
 * While a draw of `date` is due but not yet shown on the page, poll the (CDN-cached)
 * status API and refresh the page as soon as the result is published.
 * `have` = slot -> fingerprint of what the page currently shows ("" when nothing).
 */
export function LiveWatcher({ date, have }: { date: string; have: Partial<Record<Slot, string>> }) {
  const router = useRouter();
  const haveRef = useRef(have);
  haveRef.current = have;

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const watched = (Object.keys(SLOT_META) as Slot[]).filter((s) => {
      const at = istToEpoch(date, SLOT_META[s].hour, SLOT_META[s].minute);
      return haveRef.current[s] !== "complete" && Date.now() < at + 3 * 3600_000;
    });
    if (!watched.length) return;

    const tick = async () => {
      if (stopped) return;
      const now = Date.now();
      const due = watched.filter((s) => now >= istToEpoch(date, SLOT_META[s].hour, SLOT_META[s].minute) + 60_000);
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
      // poll every 20s once a draw is due, otherwise check again in 30s
      timer = setTimeout(tick, due.length ? 20_000 : 30_000);
    };
    timer = setTimeout(tick, 5_000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [date, router]);
  return null;
}
