"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap, ZapOff, Radio, Clock3, CheckCircle2, AlertTriangle, Users, Timer, ShieldCheck } from "lucide-react";
import { autoFetchTickAction, setAutoFetchAction } from "@/app/admin/actions";
import { SLOTS, SLOT_META, type Slot } from "@/lib/draws";
import { dueSlots, nextWindow, windowLabel, FAST_GAP_S } from "@/lib/windows";
import { nowIST } from "@/lib/time";
import { useNow } from "@/lib/useNow";
import { OTHER, OTHER_IDS, clockLabel, windowPhase, type OtherId } from "@/lib/others/config";

const ONAME: Record<OtherId, string> = { kerala: "Kerala", punjab: "Punjab", maharashtra: "Maharashtra", westbengal: "West Bengal" };

const TICK_MS = 20_000;

export type TriggerHealth = {
  /** last call of the every-minute cron (cron-job.org) seen during a draw window */
  cron: string | null;
  /** last run of the nightly Vercel catch-up */
  vercel: string | null;
  /** most recent automatic fetch: which draw, when, and who triggered it (visitor / admin / cron) */
  last: { what: string; at: string; by: string } | null;
};

const WHAT: Record<string, string> = { "1pm": "1 PM draw", "6pm": "6 PM draw", "8pm": "8 PM draw", ...ONAME };
const BY: Record<string, string> = { visitor: "a visitor", admin: "this dashboard", cron: "the every-minute cron" };

/** "6:13 PM" (today) or "6:13 PM, 26 Sep" (IST) */
function istTime(iso: string, today: string) {
  const n = nowIST(new Date(iso).getTime());
  const t = `${n.hours % 12 || 12}:${String(n.minutes).padStart(2, "0")} ${n.hours < 12 ? "AM" : "PM"}`;
  if (n.iso === today) return t;
  const [, m, d] = n.iso.split("-");
  return `${t}, ${Number(d)} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m) - 1]}`;
}

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
  health,
}: {
  enabled: boolean;
  complete: Record<Slot, boolean>;
  /** other lotteries: auto-fetch on/off and whether today's draws are complete */
  others: Record<OtherId, { enabled: boolean; done: boolean }>;
  health?: TriggerHealth;
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
              {SLOT_META[d.slot].label} · every {FAST_GAP_S}s
            </span>
          ))}
          {dueO.map((d) => (
            <span key={d.id} className="pill bg-live/10 text-live">
              {ONAME[d.id]} · every {OTHER[d.id].window!.fastGap}s
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
    } else status = <span className="text-muted">No more draws today. The nightly catch-up fills anything missing.</span>;
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
        {OTHER_IDS.filter((id) => OTHER[id].window).map((id) => (
          <span key={id} className={`pill ${others[id].done ? "bg-ok/10 text-ok" : others[id].enabled ? "bg-surface-2 text-muted" : "bg-live/10 text-live line-through"}`}>
            {others[id].done ? <CheckCircle2 className="size-3.5" /> : <Radio className="size-3.5" />} {ONAME[id]} {clockLabel(OTHER[id].window!.from)}–{clockLabel(OTHER[id].window!.to)}
          </span>
        ))}
      </div>

      {n && health && <Triggers health={health} nowMs={now!} today={n.iso} inWindow={due.length > 0 || dueO.length > 0} />}

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
        <li>• After each new result the website cache is cleared and open pages refresh automatically.</li>
        <li>• “Fetch now” buttons below always work too (they re-fetch even a finished draw).</li>
      </ul>
    </div>
  );
}

/** The three things that start an automatic fetch, and whether each one is working. */
function Triggers({ health, nowMs, today, inWindow }: { health: TriggerHealth; nowMs: number; today: string; inWindow: boolean }) {
  const ago = (iso: string) => Math.round((nowMs - new Date(iso).getTime()) / 60_000);
  const rows: { Icon: typeof Users; name: string; tone: "ok" | "warn" | "bad" | "muted"; text: React.ReactNode }[] = [];

  const last = health.last;
  rows.push({
    Icon: Users,
    name: "Last automatic fetch",
    tone: last ? "ok" : "muted",
    text: last ? (
      <>
        <b>{WHAT[last.what] ?? last.what}</b> at {istTime(last.at, today)} – started by {BY[last.by] ?? last.by}
      </>
    ) : (
      "none recorded yet."
    ),
  });

  if (!health.cron)
    rows.push({
      Icon: Timer,
      name: "Every-minute cron",
      tone: "bad",
      text: (
        <>
          <b>Not set up</b> – when nobody is on the site, results wait for the nightly catch-up.{" "}
          <a href="#cron" className="font-bold text-brand-2 underline">Set it up (2 min)</a>
        </>
      ),
    });
  else if (inWindow && ago(health.cron) > 3)
    rows.push({
      Icon: Timer,
      name: "Every-minute cron",
      tone: "warn",
      text: (
        <>
          <b>No call for {ago(health.cron)} min</b> – open cron-job.org and check that the job is enabled (last call {istTime(health.cron, today)}).
        </>
      ),
    });
  else rows.push({ Icon: Timer, name: "Every-minute cron", tone: "ok", text: <>Working · last call {istTime(health.cron, today)}</> });

  rows.push({
    Icon: ShieldCheck,
    name: "Nightly catch-up",
    tone: health.vercel ? "ok" : "muted",
    text: health.vercel ? <>Built in · last run {istTime(health.vercel, today)}</> : <>Built in · runs once a night (~12:10–1:10 AM IST) and fills anything still missing</>,
  });

  const toneCls = { ok: "text-ok", warn: "text-gold-2", bad: "text-live", muted: "text-muted" };
  return (
    <div className="mt-3 rounded-xl border border-line p-3">
      <div className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-muted">What starts an automatic fetch</div>
      <ul className="space-y-2 text-[0.8rem]">
        {rows.map(({ Icon, name, tone, text }) => (
          <li key={name} className="flex items-start gap-2">
            <span className={`mt-0.5 shrink-0 ${toneCls[tone]}`}>
              {tone === "ok" ? <CheckCircle2 className="size-4" /> : tone === "muted" ? <Icon className="size-4" /> : <AlertTriangle className="size-4" />}
            </span>
            <span>
              <b className="font-extrabold">{name}:</b> <span className="text-muted">{text}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[0.72rem] text-muted">Visitors waiting for a result and this dashboard (while open) also start fetches.</p>
    </div>
  );
}
