import type { Metadata } from "next";
import Link from "next/link";
import { getLastNDays } from "@/lib/results";
import { getSettings, siteUrl } from "@/lib/settings";
import { todayIST } from "@/lib/time";
import { SLOTS, SLOT_META } from "@/lib/draws";
import { PageHero } from "@/components/PageHero";
import { DaysTable } from "@/components/DaysTable";
import { Ad } from "@/components/Ad";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = "Lottery Sambad Chart – Last 30 Days 1 PM, 6 PM, 8 PM Results";
  const description = "Lottery Sambad result chart of the last 30 days: first-prize winning numbers of every 1 PM, 6 PM and 8 PM Dear Lottery draw in one table.";
  return { title: { absolute: `${title} | ${s.siteName}` }, description, alternates: { canonical: siteUrl() + "/lottery-sambad-chart" }, openGraph: { title, description } };
}

export default async function Page() {
  const days = await getLastNDays(todayIST(), 30);
  // series frequency (letter) over the period
  const freq = new Map<string, number>();
  for (const d of days) for (const s of SLOTS) {
    const f = d.draws[s]?.firstPrize;
    if (f) {
      const letter = f.split(" ")[0].slice(-1);
      freq.set(letter, (freq.get(letter) ?? 0) + 1);
    }
  }
  const letters = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
  const max = letters[0]?.[1] ?? 1;
  return (
    <>
      <PageHero
        crumbs={[{ name: "Result Chart" }]}
        eyebrow="30-day chart"
        title="Lottery Sambad Result Chart – Last 30 Days"
        subtitle="First-prize numbers of all Lottery Sambad draws for the last 30 days. Tap any number for the complete prize list."
      />
      <div className="wrap mt-8 space-y-10">
        <DaysTable days={days} />
        <Ad slot="inContent" />
        {letters.length > 0 && (
          <section>
            <h2 className="section-title">1st prize series letter frequency (30 days)</h2>
            <p className="mt-2 text-sm text-muted">How often each series letter appeared in the first prize. For information only – lottery draws are random.</p>
            <div className="card mt-5 space-y-2.5 p-5">
              {letters.map(([l, c]) => (
                <div key={l} className="flex items-center gap-3">
                  <span className="num grid size-8 shrink-0 place-items-center rounded-lg bg-navy text-sm font-extrabold text-gold">{l}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-2 to-brand" style={{ width: `${(c / max) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right text-sm font-bold">{c}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="prose-x">
          <h2>How to read the Lottery Sambad chart</h2>
          <p>
            Each row is one day and each column one draw – <Link href={SLOT_META["1pm"].path}>1 PM</Link>, <Link href={SLOT_META["6pm"].path}>6 PM</Link> and{" "}
            <Link href={SLOT_META["8pm"].path}>8 PM</Link>. The number shown is the first prize (series + 5 digits). Open a date for the consolation, 2nd, 3rd, 4th and
            5th prize numbers, or visit the <Link href="/old-results">old results archive</Link> for older months.
          </p>
        </section>
      </div>
    </>
  );
}
