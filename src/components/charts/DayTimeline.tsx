import Link from "next/link";
import { ChartTips } from "./ChartTips";
import { Legend, SERIES_BG, TableView } from "./parts";

export type TimelineEvent = { minute: number; label: string; time: string; series: 0 | 1; href?: string };

/**
 * Vertical "day rail": draw times placed proportionally between two hours, labels to the right
 * (no collisions on phones), hour ticks on the left, legend + table view.
 */
export function DayTimeline({
  events,
  from = 12,
  to = 21,
  hourLabel,
  legend,
  table,
  label,
  pxPerHour = 38,
}: {
  events: TimelineEvent[];
  from?: number;
  to?: number;
  hourLabel: (h: number) => string;
  legend: { label: string; series: 0 | 1 }[];
  table: { summary: string; head: [string, string] };
  label: string;
  pxPerHour?: number;
}) {
  const hours = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const y = (min: number) => ((min - from * 60) / 60) * pxPerHour;
  return (
    <div>
      <div className="mb-4">
        <Legend items={legend} />
      </div>
      <ChartTips className="relative">
        <div className="relative" style={{ height: (to - from) * pxPerHour + 8 }}>
          {hours.map((h) => (
            <div key={h} aria-hidden className="absolute inset-x-0 flex items-center gap-2" style={{ top: y(h * 60) - 7 }}>
              <span className="w-12 shrink-0 whitespace-nowrap text-right text-[0.65rem] font-semibold tabular-nums text-muted">{hourLabel(h)}</span>
              <span className="h-px flex-1 bg-line" />
            </div>
          ))}
          {/* rail */}
          <span aria-hidden className="absolute bottom-1 top-0 w-0.5 rounded bg-line" style={{ left: "4.1rem" }} />
          <ul role="list" aria-label={label}>
            {events.map((e) => {
              const inner = (
                <>
                  <span className={`size-3 shrink-0 rounded-full ring-2 ring-surface ${SERIES_BG[e.series]}`} />
                  <span className="min-w-0 truncate rounded-md bg-surface px-1.5 text-[0.8rem] font-bold text-ink">
                    {e.label} <span className="font-semibold tabular-nums text-muted">· {e.time}</span>
                  </span>
                </>
              );
              return (
                <li
                  key={e.label}
                  tabIndex={e.href ? undefined : 0}
                  data-tip={`${e.label} – ${e.time} IST`}
                  className="absolute right-0 flex items-center outline-none focus-visible:ring-2 focus-visible:ring-brand-2"
                  style={{ top: y(e.minute) - 11, left: "3.75rem", height: 22 }}
                >
                  {e.href ? (
                    <Link href={e.href} className="flex min-w-0 items-center gap-2 hover:underline">
                      {inner}
                    </Link>
                  ) : (
                    <span className="flex min-w-0 items-center gap-2">{inner}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </ChartTips>
      <TableView summary={table.summary} head={table.head} rows={events.map((e) => [e.label, e.time])} />
    </div>
  );
}
