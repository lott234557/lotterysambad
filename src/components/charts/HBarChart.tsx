import { ChartTips } from "./ChartTips";
import { Legend, SERIES_BG, TableView } from "./parts";

export type HBarRow = { label: string; value: number; display: string; series: 0 | 1 };

/**
 * Horizontal bar chart (HTML): thin bars (14px) anchored to a shared baseline with a 4px rounded data end,
 * the value printed at the tip, hairline grid on wide screens, per-row hover tooltip and a table-view twin.
 */
export function HBarChart({
  rows,
  ticks,
  tickLabel,
  legend,
  table,
  label,
}: {
  rows: HBarRow[];
  ticks: number[];
  tickLabel: (n: number) => string;
  legend?: { label: string; series: 0 | 1 }[];
  table: { summary: string; head: [string, string] };
  label: string;
}) {
  const max = Math.max(ticks[ticks.length - 1] ?? 0, ...rows.map((r) => r.value)) || 1;
  const VALUE_W = "4.75rem"; // room reserved for the value label at the longest bar
  return (
    <div>
      {legend && legend.length > 1 && (
        <div className="mb-4">
          <Legend items={legend} />
        </div>
      )}
      <ChartTips className="group/chart relative">
        {/* hairline grid (wide screens: labels sit in their own column) */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[13.75rem] hidden sm:block" style={{ right: VALUE_W }}>
          {ticks.map((tk) => (
            <span key={tk} className="absolute inset-y-0 w-px bg-line dark:bg-white/10" style={{ left: `${(tk / max) * 100}%` }} />
          ))}
        </div>
        <ul role="list" aria-label={label} className="relative space-y-2.5 sm:space-y-1.5">
          {rows.map((r) => (
            <li
              key={r.label}
              tabIndex={0}
              data-tip={`${r.label}: ${r.display}`}
              className="grid grid-cols-1 items-center gap-x-3 gap-y-1 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-2 sm:grid-cols-[13rem_minmax(0,1fr)] sm:py-1"
            >
              <span className="text-[0.8rem] font-semibold leading-snug text-ink sm:line-clamp-2 sm:text-right">{r.label}</span>
              <span className="flex items-center gap-2">
                <span
                  className={`block h-3.5 rounded-r-[4px] transition-opacity group-hover/chart:opacity-50 [li:hover_&]:!opacity-100 ${SERIES_BG[r.series]}`}
                  style={{ width: `calc((100% - ${VALUE_W}) * ${r.value / max})`, minWidth: 3 }}
                />
                <span className="whitespace-nowrap text-xs font-bold tabular-nums text-ink">{r.display}</span>
              </span>
            </li>
          ))}
        </ul>
        {/* axis */}
        <div aria-hidden className="relative mt-2 hidden h-4 text-[0.68rem] font-semibold text-muted sm:block" style={{ marginLeft: "13.75rem", marginRight: VALUE_W }}>
          {ticks.map((tk) => (
            <span key={tk} className="absolute -translate-x-1/2 whitespace-nowrap tabular-nums" style={{ left: `${(tk / max) * 100}%` }}>
              {tickLabel(tk)}
            </span>
          ))}
        </div>
      </ChartTips>
      <TableView summary={table.summary} head={table.head} rows={rows.map((r) => [r.label, r.display])} />
    </div>
  );
}
