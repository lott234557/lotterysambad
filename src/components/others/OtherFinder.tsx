"use client";
import { useEffect, useState } from "react";
import { Search, PartyPopper, XCircle } from "lucide-react";

type Labels = { title: string; placeholder: string; match: string; none: string; verify: string };
type Hit = { draw: string; tier: string; amount: string; number: string };

const alnum = (s: string) => s.toUpperCase().replace(/[^0-9A-Z]/g, "");

/**
 * Ticket finder for Kerala / Punjab / Maharashtra results. Works on the chips rendered in `#containerId`:
 * full tickets (data-kind="full") must match exactly, short numbers (last 4/5 digits) must match the end.
 */
export function OtherFinder({ containerId, t }: { containerId: string; t: Labels }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);

  useEffect(() => {
    const root = document.getElementById(containerId);
    if (!root) return;
    const chips = root.querySelectorAll<HTMLElement>("[data-n]");
    chips.forEach((c) => c.classList.remove("hit"));
    const input = alnum(q);
    const digits = input.replace(/\D/g, "");
    if (digits.length < 4) {
      setHits(null);
      return;
    }
    const found: Hit[] = [];
    let first: HTMLElement | null = null;
    chips.forEach((c) => {
      const n = c.dataset.n ?? "";
      const full = c.dataset.kind === "full";
      const ok = full ? alnum(n) === input || (input.length === digits.length && digits.length >= 5 && alnum(n).endsWith(digits) && alnum(n).replace(/\D/g, "") === digits) : digits.endsWith(n.replace(/\D/g, ""));
      if (ok) {
        c.classList.add("hit");
        first ??= c;
        found.push({ draw: c.dataset.draw ?? "", tier: c.dataset.tier ?? "", amount: c.dataset.amount ?? "", number: n });
      }
    });
    (first as HTMLElement | null)?.scrollIntoView({ block: "center", behavior: "smooth" });
    setHits(found);
  }, [q, containerId]);

  return (
    <div className="card p-4 sm:p-5">
      <label htmlFor="other-finder" className="text-sm font-extrabold">
        {t.title}
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 focus-within:border-brand-2">
        <Search className="size-4 text-muted" />
        <input
          id="other-finder"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
          placeholder={t.placeholder}
          maxLength={16}
          className="num h-12 w-full bg-transparent text-base font-bold uppercase outline-none placeholder:font-sans placeholder:font-normal placeholder:normal-case placeholder:text-muted"
        />
      </div>
      {hits && (
        <div aria-live="polite" className="mt-3">
          {hits.length ? (
            <div className="flex items-start gap-3 rounded-xl bg-ok/10 p-3 text-sm">
              <PartyPopper className="mt-0.5 size-5 shrink-0 text-ok" />
              <div>
                <b className="text-ok">{t.match}</b>
                <ul className="mt-1 space-y-0.5">
                  {hits.slice(0, 6).map((h, i) => (
                    <li key={i}>
                      {h.draw && <span className="text-muted">{h.draw} · </span>}
                      <b>{h.tier}</b>
                      {h.amount && ` (${h.amount})`} – <span className="num">{h.number}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-1 text-xs text-muted">{t.verify}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 text-sm text-muted">
              <XCircle className="size-5 shrink-0" /> {t.none}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
