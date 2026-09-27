"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { nowIST } from "@/lib/time";

/**
 * Refreshes a lottery page when today's results change. Polls the CDN-cached status API every 20 s
 * inside the result window (which also wakes the server's auto-fetch). After midnight it reloads the
 * page for the new day.
 */
export function OtherLiveWatcher({ lottery, date, fp, from, to, complete }: { lottery: string; date: string; fp: string; from: number; to: number; complete: boolean }) {
  const router = useRouter();
  const fpRef = useRef(fp);
  fpRef.current = fp;
  const rollTries = useRef(0);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (stopped) return;
      const n = nowIST();
      if (n.iso > date) {
        // new day: ask the server to clear its cache once, then reload
        if (rollTries.current < 3 && document.visibilityState === "visible") {
          rollTries.current++;
          try {
            await fetch(`/api/status?lottery=${lottery}&date=${n.iso}`, { cache: "no-store" });
          } catch {}
          setTimeout(() => router.refresh(), 2500);
        }
        timer = setTimeout(tick, 30_000);
        return;
      }
      const inWindow = n.minuteOfDay >= from - 1 && n.minuteOfDay <= to;
      if (inWindow && !complete && document.visibilityState === "visible") {
        try {
          const r = await fetch(`/api/status?lottery=${lottery}&date=${date}`, { cache: "no-store" });
          const j = (await r.json()) as { fp?: string };
          if (typeof j.fp === "string" && j.fp !== fpRef.current) router.refresh();
        } catch {}
      }
      timer = setTimeout(tick, inWindow ? 20_000 : 60_000);
    };
    timer = setTimeout(tick, 4_000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [lottery, date, from, to, complete, router]);
  return null;
}
