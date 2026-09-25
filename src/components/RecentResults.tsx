import Link from "next/link";
import type { Result } from "@/lib/db/schema";
import { SLOT_META, type Slot } from "@/lib/draws";
import { isoToDMY, shortDate, weekdayName } from "@/lib/time";

export function RecentResults({ rows, title, showSlot = false }: { rows: Result[]; title: string; showSlot?: boolean }) {
  if (!rows.length) return null;
  return (
    <section className="mt-12">
      <h2 className="section-title">{title}</h2>
      <div className="card mt-5 overflow-x-auto">
        <table className="table-x min-w-[520px]">
          <thead>
            <tr>
              <th>Date</th>
              {showSlot && <th>Draw</th>}
              <th>Draw Name</th>
              <th>1st Prize</th>
              <th className="text-right">Result</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap">
                  <b>{shortDate(r.drawDate)}</b>
                  <div className="text-xs text-muted">{weekdayName(r.drawDate)}</div>
                </td>
                {showSlot && <td className="font-semibold">{SLOT_META[r.slot as Slot].label}</td>}
                <td className="text-muted">{r.drawName}</td>
                <td>
                  <span className="num rounded-lg bg-gold-soft px-2 py-1 font-extrabold">{r.firstPrize ?? "—"}</span>
                </td>
                <td className="text-right">
                  <Link href={`/result/${isoToDMY(r.drawDate)}/${r.slot}`} className="font-bold text-brand-2 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
