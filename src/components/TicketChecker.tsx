"use client";
import { useState } from "react";
import { Search, PartyPopper, XCircle, Loader2 } from "lucide-react";
import { SLOTS, SLOT_META, checkTicket, type DrawData, type Slot, type TierKey } from "@/lib/draws";

type Res = DrawData & { drawDate: string; slot: string; drawName: string | null };

export function TicketChecker({ today, prizes }: { today: string; prizes: Record<TierKey, string> }) {
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState<Slot>("8pm");
  const [ticket, setTicket] = useState("");
  const [state, setState] = useState<{ loading?: boolean; error?: string; result?: Res | null; checked?: string }>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = ticket.toUpperCase().replace(/[^0-9A-Z]/g, "");
    if (clean.replace(/\D/g, "").length < 4) return setState({ error: "Enter at least the last 4 digits of your ticket." });
    setState({ loading: true });
    try {
      const r = await fetch(`/api/result?date=${date}&slot=${slot}`);
      const j = (await r.json()) as { result: Res | null };
      if (!j.result) return setState({ error: "Result for this date and draw is not available yet." });
      setState({ result: j.result, checked: clean });
    } catch {
      setState({ error: "Could not load the result. Please try again." });
    }
  };

  const matches = state.result && state.checked ? checkTicket(state.checked, state.result) : [];

  return (
    <div className="card p-5 sm:p-7">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold">Draw date</span>
          <input type="date" value={date} max={today} min="2020-01-01" onChange={(e) => setDate(e.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-line bg-surface-2 px-3 font-semibold outline-none focus:border-brand-2" />
        </label>
        <div>
          <span className="text-sm font-bold">Draw time</span>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {SLOTS.map((x) => (
              <button type="button" key={x} onClick={() => setSlot(x)} className={`h-12 rounded-xl border font-bold transition ${slot === x ? "border-gold bg-gold text-[#1c1400]" : "border-line bg-surface-2 hover:border-brand-2"}`}>
                {SLOT_META[x].label}
              </button>
            ))}
          </div>
        </div>
        <label className="block sm:col-span-2">
          <span className="text-sm font-bold">Ticket number</span>
          <input value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="e.g. 84L 10051" maxLength={12} className="num mt-1.5 h-14 w-full rounded-xl border border-line bg-surface-2 px-4 text-xl font-extrabold uppercase tracking-wider outline-none placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:normal-case placeholder:tracking-normal focus:border-brand-2" />
        </label>
        <button className="btn btn-gold h-12 sm:col-span-2" disabled={state.loading}>
          {state.loading ? <Loader2 className="size-5 animate-spin" /> : <Search className="size-5" />} Check Result
        </button>
      </form>
      <div aria-live="polite">
        {state.error && <p className="mt-5 rounded-xl bg-live/10 p-4 text-sm font-semibold text-live">{state.error}</p>}
        {state.result && (
          <div className="mt-5">
            {matches.length ? (
              <div className="rounded-2xl bg-ok/10 p-5">
                <div className="flex items-center gap-2 text-lg font-extrabold text-ok">
                  <PartyPopper className="size-6" /> Congratulations!
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {matches.map((m) => (
                    <li key={m.tier.key}>
                      <b>{m.tier.label}</b> – {prizes[m.tier.key]} (matched <span className="num font-bold">{m.number}</span>)
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted">Please verify with the official Government Gazette before claiming.</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-5 text-sm">
                <XCircle className="size-6 shrink-0 text-muted" />
                <span>
                  No prize for <b className="num">{state.checked}</b> in the {SLOT_META[state.result.slot as Slot].label} draw ({state.result.drawName}). 1st prize was{" "}
                  <b className="num">{state.result.firstPrize}</b>.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
