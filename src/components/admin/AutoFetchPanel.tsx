"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap, ZapOff, Radio, Clock3, CheckCircle2 } from "lucide-react";
import { autoFetchTickAction, setAutoFetchAction } from "@/app/admin/actions";
import { SLOTS, SLOT_META, type Slot } from "@/lib/draws";
import { dueSlots, nextWindow, windowLabel, FAST_GAP_S, SLOW_GAP_S } from "@/lib/windows";
import { nowIST } from "@/lib/time";
import { useNow } from "@/lib/useNow";
import { OTHER, OTHER_IDS, clockLabel, windowPhase, type OtherId } from "@/lib/others/config";

const ONAME: Record<OtherId, string> = { kerala: "Kerala", punjab: "Punjab", maharashtra: "Maharashtra", westbengal: "West Bengal" };

const TICK_MS = 20_000;

function hm(ms: number) {
  const m = Math.max(0, Math.round(ms / 60_000));
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
}

/**
 * Dashboard auto-fetch control: on/off switch, live status, and – while this page is open – runs the
 * auto-fetch every 20 s during the draw windows and refreshes the dashboard when a result arrives.
 */
export function AutoFetchPanel({
  enabled,
  complete,
  others,
}: {
  enabled: boolean;
  complete: Record<Slot, boolean>;
  /** other lotteries: auto-fetch on/off and whether today's draws are complete */
  others: Record<OtherId, { enabled: boolean; done: boolean }>;
}) {
  const router = useRouter();
  const now = useNow(1000);
  const [on, setOn] = useState(enabled);
  const [pending, start] = useTransition();
  const [log, setLog] = useState<{ t: string; text: string }[]>([]);
  const busy = useRef(false);
  const ticks = useRef(0);
  const completeRef = useRef(complete);
  completeRef.current = complete;
  const othersRef = useRef(others);
  othersRef.current = others;
  const dueOthers = (minute: number, o = others) =>
    OTHER_IDS.map((id) => ({ id, phase: windowPhase(OTHER[id], minute) })).filter(
      (x): x is { id: OtherId; phase: "fast" | "slow" } => !!x.phase && o[x.id].enabled && !(o[x.id].done && (!OTHER[x.id].multi || x.phase === "slow")),
    );

  useEffect(() => setOn(enabled), [enabled]);

  // background runner (only while ON, visible and inside a window with an unfinished draw)
  useEffect(() => {
    if (!on) return;
    const run = async () => {
      if (busy.current || document.visibilityState !== "visible") return;
      const n = nowIST();
      const due = dueSlots(n.minuteOfDay).filter((d) => !completeRef.current[d.slot]);
      if (!due.length && !dueOthers(n.minuteOfDay, othersRef.current).length) return;
      busy.current = true;
      try {
        const r = await autoFetchTickAction();
        const t = `${n.hours % 12 || 12}:${String(n.minutes).padStart(2, "0")}:${String(n.seconds).padStart(2, "0")}`;
        const lines = "error" in r ? [`Error: ${r.error}`] : r.lines.length ? r.lines : ["checked"];
        setLog((l) => [...lines.map((text) => ({ t, text })), ...l].slice(0, 8));
        ticks.current++;
        // refresh the dashboard when something changed, and every minute anyway (visitors may have fetched it)
        if (("changed" in r && r.changed) || ticks.current % 3 === 0) router.refresh();
      } finally {
        busy.current = false;
      }
    };
    run();
    const id = setInterval(run, TICK_MS);
    return () => clearInterval(id);
  }, [on, router]);

  const toggle = () =>
    start(async () => {
      const next = !on;
      setOn(next);
      await setAutoFetchAction(next);
      router.refresh();
    });

  const n = now ? nowIST(now) : null;
  const due = n ? dueSlots(n.minuteOfDay).filter((d) => !complete[d.slot]) : [];
  const dueO = n ? dueOthers(n.minuteOfDay) : [];
  const nw = n ? nextWindow(n.minuteOfDay) : null;
  const allDone = SLOTS.every((s) => complete[s]);

  let status: React.ReactNode = <span className="text-muted">…</span>;
  if (n) {
    if (!on) status = <span className="text-live">Off – results are fetched only when you press “Fetch now”.</span>;
    else if (due.length || dueO.length)
      status = (
        <span className="flex flex-wrap items-center gap-2">
          <span className="live-dot" />
          <b>Fetching now:</b>
          {due.map((d) => (
            <span key={d.slot} className="pill bg-live/10 text-live">
              {SLOT_META[d.slot].label} · every {d.phase === "fast" ? `${FAST_GAP_S}s` : `${SLOW_GAP_S / 60} min`}
            </span>
          ))}
          {dueO.map((d) => (
            <span key={d.id} className="pill bg-live/10 text-live">
              {ONAME[d.id]} · every {d.phase === "fast" ? `${OTHER[d.id].window!.fastGap}s` : `${Math.round(OTHER[d.id].window!.slowGap / 60)} min`}
            </span>
          ))}
        </span>
      );
    else if (allDone) status = <span className="flex items-center gap-1.5 text-ok"><CheckCircle2 className="size-4" /> All 3 draws of today are complete.</span>;
    else if (nw) {
      const startsIn = (nw.startsAtMinute - n.minuteOfDay) * 60_000 - n.seconds * 1000;
      status = (
        <span className="flex items-center gap-1.5">
          <Clock3 className="size-4 text-brand-2" /> Next: <b>{SLOT_META[nw.slot].label}</b> – starts automatically in {hm(startsIn)}
        </span>
      );
    } else status = <span className="text-muted">No more draws today. Catch-up runs at ~10:10 PM IST.</span>;
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`grid size-11 place-items-center rounded-xl ${on ? "bg-ok/10 text-ok" : "bg-live/10 text-live"}`}>
            {on ? <Zap className="size-5" /> : <ZapOff className="size-5" />}
          </span>
          <div>
            <h2 className="font-extrabold">Auto-fetch results</h2>
            <p className="text-xs text-muted">Automatic fetch, page refresh &amp; cache clearing after every new result</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          disabled={pending}
          onClick={toggle}
          className={`relative h-7 w-14 shrink-0 rounded-full transition ${on ? "bg-ok" : "bg-line"}`}
          title={on ? "Turn auto-fetch off" : "Turn auto-fetch on"}
        >
          <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${on ? "left-8" : "left-1"}`} />
          <span className="sr-only">Auto-fetch</span>
        </button>
      </div>

      <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">{status}</div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {SLOTS.map((s) => (
          <span key={s} className={`pill ${complete[s] ? "bg-ok/10 text-ok" : "bg-surface-2 text-muted"}`}>
            {complete[s] ? <CheckCircle2 className="size-3.5" /> : <Radio className="size-3.5" />} {windowLabel(s)}
          </span>
        ))}
        <span className="pill bg-surface-2 text-muted">then every 2 min until complete</span>
        {OTHER_IDS.filter((id) => OTHER[id].window).map((id) => (
          <span key={id} className={`pill ${others[id].done ? "bg-ok/10 text-ok" : others[id].enabled ? "bg-surface-2 text-muted" : "bg-live/10 text-live line-through"}`}>
            {others[id].done ? <CheckCircle2 className="size-3.5" /> : <Radio className="size-3.5" />} {ONAME[id]} {clockLabel(OTHER[id].window!.from)}–{clockLabel(OTHER[id].window!.to)}
          </span>
        ))}
      </div>

      {log.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-line pt-3 text-[0.72rem] text-muted">
          {log.map((l, i) => (
            <li key={i}>
              <span className="num">{l.t}</span> · {l.text}
            </li>
          ))}
        </ul>
      )}

      <ul className="mt-3 space-y-1 border-t border-line pt-3 text-[0.72rem] text-muted">
        <li>• Runs by itself whenever visitors are waiting on the site, and every 20 s while this dashboard is open.</li>
        <li>• After each new result the website cache is cleared and open pages refresh automatically.</li>
        <li>• For fetching even when nobody is online, add the cron URL below at cron-job.org (free).</li>
      </ul>
    </div>
  );
}
