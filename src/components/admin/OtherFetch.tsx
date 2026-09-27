"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CalendarSearch } from "lucide-react";
import { scrapeOtherAction } from "@/app/admin/others-actions";

/** "Fetch now" (today) + fetch any date, for one lottery. */
export function OtherFetch({ lottery, today, compact = false }: { lottery: string; today: string; compact?: boolean }) {
  const [pending, start] = useTransition();
  const [date, setDate] = useState(today);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const run = (d: string) =>
    start(async () => {
      setMsg(null);
      const r = await scrapeOtherAction(lottery, d);
      setMsg("error" in r ? r.error : `${r.status}: ${r.message}`);
      router.refresh();
    });
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={pending} onClick={() => run(today)} className={`btn btn-ghost ${compact ? "!px-2.5 !py-1.5 text-xs" : "!py-2 text-sm"}`}>
          <RefreshCw className={`size-3.5 ${pending ? "animate-spin" : ""}`} /> {pending ? "Fetching…" : "Fetch now"}
        </button>
        {!compact && (
          <span className="flex items-center gap-1.5">
            <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="h-9 rounded-xl border border-line bg-surface-2 px-2 text-sm" />
            <button type="button" disabled={pending} onClick={() => run(date)} className="btn btn-ghost !py-2 text-sm">
              <CalendarSearch className="size-3.5" /> Fetch date
            </button>
          </span>
        )}
      </div>
      {msg && <span className="max-w-xl text-[0.72rem] text-muted">{msg}</span>}
    </div>
  );
}
