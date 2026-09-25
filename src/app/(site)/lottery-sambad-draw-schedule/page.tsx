import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, siteUrl } from "@/lib/settings";
import { SLOTS, SLOT_META, TIERS } from "@/lib/draws";
import { WEEKDAYS, todayIST, weekdayOf } from "@/lib/time";
import { PageHero } from "@/components/PageHero";
import { FAQ } from "@/components/FAQ";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = "Lottery Sambad Draw Schedule, Timings & Prize List";
  const description = "Dear Lottery Sambad weekly draw schedule with draw names for 1 PM, 6 PM and 8 PM, result timings, participating states and the full prize structure.";
  return { title: { absolute: `${title} | ${s.siteName}` }, description, alternates: { canonical: siteUrl() + "/lottery-sambad-draw-schedule" }, openGraph: { title, description } };
}

export default async function Page() {
  const s = await getSettings();
  const wd = weekdayOf(todayIST());
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <>
      <PageHero
        crumbs={[{ name: "Draw Schedule & Prizes" }]}
        eyebrow="Schedule"
        title="Lottery Sambad Draw Schedule, Timings & Prize List"
        subtitle="Weekly draw names of the 1 PM, 6 PM and 8 PM Dear Lottery draws, result timings and the prize structure – all in one place."
      />
      <div className="wrap mt-8 space-y-12">
        <section>
          <h2 className="section-title">Weekly draw names</h2>
          <div className="card mt-5 overflow-x-auto">
            <table className="table-x min-w-[560px]">
              <thead>
                <tr>
                  <th>Day</th>
                  {SLOTS.map((x) => (
                    <th key={x}>{SLOT_META[x].time}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.map((d) => (
                  <tr key={d} className={d === wd ? "[&>td]:bg-gold-soft" : ""}>
                    <td className="font-bold">
                      {WEEKDAYS[d]} {d === wd && <span className="pill ml-1 bg-gold text-[#1c1400]">Today</span>}
                    </td>
                    {SLOTS.map((x) => (
                      <td key={x}>Dear {s.schedule[x][d]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="section-title">Draw & result timings</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {SLOTS.map((x) => (
              <Link key={x} href={SLOT_META[x].path} className="card p-5 hover:border-brand-2">
                <div className="eyebrow">{SLOT_META[x].period} draw</div>
                <div className="mt-1 text-2xl font-extrabold">{SLOT_META[x].time}</div>
                <div className="mt-2 text-sm text-muted">Result: {SLOT_META[x].expected} IST</div>
                <div className="text-sm text-muted">State: {SLOT_META[x].state}</div>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="section-title">Prize structure</h2>
          <div className="card mt-5 overflow-x-auto">
            <table className="table-x min-w-[480px]">
              <thead>
                <tr><th>Prize</th><th>Amount</th><th>Winning numbers</th><th>How to match</th></tr>
              </thead>
              <tbody>
                {TIERS.map((t) => (
                  <tr key={t.key}>
                    <td className="font-bold">{t.label}</td>
                    <td><span className="pill bg-gold-soft text-ink">{s.prizes[t.key]}</span></td>
                    <td>{t.expected}</td>
                    <td className="text-muted">{t.key === "first" ? "Full ticket (series + 5 digits)" : t.key === "cons" ? "Same 5 digits, other series" : `Last ${t.digits} digits`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">Prize amounts are indicative and may change as per the official state lottery notification.</p>
        </section>
        <FAQ
          items={[
            { q: "How many Lottery Sambad draws are held every day?", a: "Three draws are held every day – at 1 PM, 6 PM and 8 PM IST – including Sundays and most holidays." },
            { q: "Why does the draw name change every day?", a: "Each weekday has its own draw name (for example Dear Victory on Friday at 1 PM). The table above lists all names for the week." },
            { q: "How long do I have to claim a prize?", a: "Claims are generally accepted within 30 days of the draw with the original ticket. Check the official rules of the respective state lottery department." },
          ]}
        />
      </div>
    </>
  );
}
