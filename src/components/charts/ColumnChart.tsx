import { ChartTips } from "./ChartTips";
import { TableView } from "./parts";

export type Column = { label: string; value: number; tip: string };

/** Single-series vertical column chart (HTML) – value on top of each column, hover tooltip, table-view twin. */
export function ColumnChart({ cols, label, table, height = 170 }: { cols: Column[]; label: string; table: { summary: string; head: [string, string] }; height?: number }) {
  const max = Math.max(1, ...cols.map((c) => c.value));
  const step = max <= 5 ? 1 : max <= 10 ? 2 : Math.ceil(max / 5);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  return (
    <div>
      <ChartTips className="group/chart relative">
        <div className="relative" style={{ height }}>
          {/* horizontal hairlines – same plot height as the bars (room for the value label on top) */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 top-5">
            {ticks.map((tk) => (
              <div key={tk} className="absolute inset-x-0 flex translate-y-1/2 items-center gap-2" style={{ bottom: `${(tk / top) * 100}%` }}>
                <span className="w-5 text-right text-[0.65rem] tabular-nums text-muted">{tk}</span>
                <span className={`h-px flex-1 ${tk === 0 ? "bg-muted/60" : "bg-line"}`} />
              </div>
            ))}
          </div>
          <ul role="list" aria-label={label} className="absolute inset-y-0 left-7 right-0 flex items-end justify-around gap-1">
            {cols.map((c) => (
              <li
                key={c.label}
                tabIndex={0}
                data-tip={c.tip}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end outline-none focus-visible:ring-2 focus-visible:ring-brand-2"
              >
                <span className="mb-1 h-4 text-[0.7rem] font-bold leading-4 tabular-nums text-ink">{c.value}</span>
                <span
                  className="block w-full max-w-6 rounded-t-[4px] bg-chart-1 transition-opacity group-hover/chart:opacity-50 [li:hover_&]:!opacity-100"
                  style={{ height: `calc((100% - 1.25rem) * ${c.value / top})`, minHeight: 2 }}
                />
              </li>
            ))}
          </ul>
        </div>
        <ul aria-hidden className="ml-7 mt-2 flex justify-around gap-1">
          {cols.map((c) => (
            <li key={c.label} className="num flex-1 text-center text-xs font-extrabold text-ink">
              {c.label}
            </li>
          ))}
        </ul>
      </ChartTips>
      <TableView summary={table.summary} head={table.head} rows={cols.map((c) => [c.label, c.value])} />
    </div>
  );
}
