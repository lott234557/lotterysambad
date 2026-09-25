import Link from "next/link";
import { SLOTS, SLOT_META } from "@/lib/draws";
import type { DayRow } from "@/lib/results";
import { isoToDMY, shortDate, weekdayName } from "@/lib/time";

export function DaysTable({ days, empty = "No results in this period yet." }: { days: DayRow[]; empty?: string }) {
  return (
    <div className="card overflow-x-auto">
      <table className="table-x min-w-[600px]">
        <thead>
          <tr>
            <th>Date</th>
            {SLOTS.map((x) => (
              <th key={x}>{SLOT_META[x].label} · 1st Prize</th>
            ))}
            <th className="text-right">Full</th>
          </tr>
        </thead>
        <tbody>
          {days.length === 0 && (
            <tr>
              <td colSpan={5} className="py-10 text-center text-muted">{empty}</td>
            </tr>
          )}
          {days.map((d) => (
            <tr key={d.date}>
              <td className="whitespace-nowrap">
                <b>{shortDate(d.date)}</b>
                <div className="text-xs text-muted">{weekdayName(d.date)}</div>
              </td>
              {SLOTS.map((x) => (
                <td key={x}>
                  {d.draws[x]?.firstPrize ? (
                    <Link href={`/result/${isoToDMY(d.date)}/${x}`} className="num rounded-lg bg-gold-soft px-2 py-1 font-extrabold hover:bg-gold hover:text-[#1c1400]">
                      {d.draws[x]!.firstPrize}
                    </Link>
                  ) : d.draws[x] ? (
                    <Link href={`/result/${isoToDMY(d.date)}/${x}`} className="text-xs font-semibold text-brand-2">Image</Link>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              ))}
              <td className="text-right">
                <Link href={`/result/${isoToDMY(d.date)}`} className="font-bold text-brand-2 hover:underline">View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
