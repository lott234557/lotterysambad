/** Shared chart pieces: legend and the accessible table-view twin. */
export const SERIES_BG = ["bg-chart-1", "bg-chart-2"] as const;

export function Legend({ items }: { items: { label: string; series: 0 | 1 }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-muted">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          <span className={`inline-block size-2.5 rounded-[3px] ${SERIES_BG[it.series]}`} aria-hidden />
          <span className="text-ink">{it.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function TableView({ summary, head, rows }: { summary: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="group mt-4 rounded-xl border border-line">
      <summary className="cursor-pointer list-none select-none px-4 py-2.5 text-xs font-bold text-brand-2 [&::-webkit-details-marker]:hidden">
        <span className="inline-block transition group-open:rotate-90">›</span> {summary}
      </summary>
      <div className="overflow-x-auto border-t border-line">
        <table className="table-x text-sm">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={i} className={i > 0 ? "text-right" : ""}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={j > 0 ? "text-right font-semibold tabular-nums" : ""}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
