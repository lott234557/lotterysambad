"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarSearch } from "lucide-react";

export function DateJump({ max, defaultValue }: { max: string; defaultValue?: string }) {
  const router = useRouter();
  const [v, setV] = useState(defaultValue ?? max);
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
    const [y, m, d] = v.split("-");
    router.push(`/result/${d}-${m}-${y}`);
  };
  return (
    <form onSubmit={go} className="flex gap-2">
      <label className="sr-only" htmlFor="jump">Choose date</label>
      <input
        id="jump"
        type="date"
        value={v}
        max={max}
        min="2020-01-01"
        onChange={(e) => setV(e.target.value)}
        className="h-11 w-full min-w-0 rounded-xl border border-line bg-surface-2 px-3 text-sm font-semibold outline-none focus:border-brand-2"
      />
      <button className="btn btn-blue !px-3.5" aria-label="Show results">
        <CalendarSearch className="size-4" />
      </button>
    </form>
  );
}
