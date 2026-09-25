"use client";
import { useState } from "react";
import { History, Loader2 } from "lucide-react";
import { backfillDateAction } from "@/app/admin/actions";

function* dates(from: string, to: string) {
  const d = new Date(from + "T00:00:00Z");
  const end = new Date(to + "T00:00:00Z");
  while (d <= end) {
    yield d.toISOString().slice(0, 10);
    d.setUTCDate(d.getUTCDate() + 1);
  }
}

export function Backfill({ today }: { today: string }) {
  const weekAgo = new Date(new Date(today + "T00:00:00Z").getTime() - 6 * 864e5).toISOString().slice(0, 10);
  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(today);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const run = async () => {
    setRunning(true);
    setLog([]);
    const list = Array.from(dates(from, to)).reverse();
    if (list.length > 120) {
      setLog(["Please choose at most 120 days per run."]);
      setRunning(false);
      return;
    }
    for (const d of list) {
      try {
        const r = await backfillDateAction(d);
        setLog((l) => [`${d}: ${r.outcomes.map((o) => `${o.slot} ${o.status}`).join(" · ")}`, ...l]);
      } catch (e) {
        setLog((l) => [`${d}: error ${(e as Error).message}`, ...l]);
      }
    }
    setRunning(false);
  };
  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-bold">
          From
          <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="mt-1 block rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-bold">
          To
          <input type="date" value={to} max={today} onChange={(e) => setTo(e.target.value)} className="mt-1 block rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm" />
        </label>
        <button onClick={run} disabled={running} className="btn btn-gold !py-2">
          {running ? <Loader2 className="size-4 animate-spin" /> : <History className="size-4" />} {running ? "Importing…" : "Import missing results"}
        </button>
      </div>
      {log.length > 0 && (
        <pre className="num mt-4 max-h-64 overflow-auto rounded-xl border border-line bg-surface-2 p-3 text-[0.72rem] leading-relaxed">{log.join("\n")}</pre>
      )}
    </div>
  );
}
