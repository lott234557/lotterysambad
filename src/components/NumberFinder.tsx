"use client";
import { useEffect, useState } from "react";
import { Search, PartyPopper, XCircle } from "lucide-react";
import { checkTicket, type DrawData, type TierKey } from "@/lib/draws";

export function NumberFinder({ data, prizes }: { data: DrawData; prizes: Record<TierKey, string> }) {
  const [q, setQ] = useState("");
  const clean = q.toUpperCase().replace(/[^0-9A-Z]/g, "");
  const digits = clean.replace(/\D/g, "");
  const ready = digits.length >= 4;
  const matches = ready ? checkTicket(clean, data) : [];

  useEffect(() => {
    const chips = document.querySelectorAll<HTMLElement>("#prizes [data-n]");
    chips.forEach((c) => c.classList.remove("hit"));
    if (!ready) return;
    const hits = new Set(matches.map((m) => `${m.tier.key}:${m.number}`));
    let first: HTMLElement | null = null;
    chips.forEach((c) => {
      if (hits.has(`${c.dataset.tier}:${c.dataset.n}`)) {
        c.classList.add("hit");
        first ??= c;
      }
    });
    (first as HTMLElement | null)?.scrollIntoView({ block: "center", behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clean]);

  return (
    <div className="card p-4 sm:p-5">
      <label htmlFor="finder" className="text-sm font-extrabold">
        Check your ticket in this draw
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 focus-within:border-brand-2">
        <Search className="size-4 text-muted" />
        <input
          id="finder"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          inputMode="text"
          autoComplete="off"
          placeholder="e.g. 84L 10051 or last 4–5 digits"
          className="num h-12 w-full bg-transparent text-base font-bold uppercase outline-none placeholder:font-sans placeholder:font-normal placeholder:normal-case placeholder:text-muted"
          maxLength={12}
        />
      </div>
      {ready && (
        <div aria-live="polite" className="mt-3">
          {matches.length ? (
            <div className="flex items-start gap-3 rounded-xl bg-ok/10 p-3 text-sm">
              <PartyPopper className="mt-0.5 size-5 shrink-0 text-ok" />
              <div>
                <b className="text-ok">Match found!</b>{" "}
                {matches.map((m) => `${m.tier.label} (${prizes[m.tier.key]}) – ${m.number}`).join(", ")}
                <div className="mt-1 text-xs text-muted">Please verify with the official Government Gazette before claiming.</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 text-sm text-muted">
              <XCircle className="size-5 shrink-0" /> No match in this draw. Better luck next time.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
