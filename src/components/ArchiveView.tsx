import Link from "next/link";
import { getArchiveMonths, getMonth } from "@/lib/results";
import { monthLabel, todayIST } from "@/lib/time";
import { PageHero } from "./PageHero";
import { MonthCalendar } from "./MonthCalendar";
import { DaysTable } from "./DaysTable";
import { DateJump } from "./DateJump";
import { Ad } from "./Ad";

export async function ArchiveView({ month, isIndex }: { month: string; isIndex: boolean }) {
  const today = todayIST();
  const [days, months] = await Promise.all([getMonth(month), getArchiveMonths()]);
  const label = monthLabel(month);
  return (
    <>
      <PageHero
        crumbs={isIndex ? [{ name: "Old Results" }] : [{ name: "Old Results", href: "/old-results" }, { name: label }]}
        eyebrow="Result archive"
        title={isIndex ? "Lottery Sambad Old Result – Full Archive" : `Lottery Sambad Old Result ${label}`}
        subtitle={
          isIndex
            ? "Browse every Lottery Sambad 1 PM, 6 PM and 8 PM result by date. Pick a day on the calendar, jump to any date or open a month."
            : `All Lottery Sambad 1 PM, 6 PM and 8 PM results of ${label} with first-prize numbers. Tap a date to see the full prize list and result images.`
        }
      />
      <div className="wrap mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          <MonthCalendar month={month} days={days} today={today} />
          <Ad slot="inContent" />
          <section>
            <h2 className="section-title">{label} – day-wise results</h2>
            <div className="mt-5">
              <DaysTable days={days} empty={`No results stored for ${label} yet.`} />
            </div>
          </section>
        </div>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-4">
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-muted">Go to date</h2>
            <DateJump max={today} />
          </div>
          <div className="card p-4">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-muted">Months</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {months.length === 0 && <li className="col-span-2 text-muted">No archive yet.</li>}
              {months.map((m) => (
                <li key={m.key}>
                  <Link href={`/old-results/${m.key}`} className={`block rounded-lg border px-3 py-2 font-semibold hover:border-brand-2 ${m.key === month ? "border-gold bg-gold-soft" : "border-line"}`}>
                    {monthLabel(m.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Ad slot="sidebar" />
        </aside>
      </div>
    </>
  );
}
