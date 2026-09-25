import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, LineChart, Ticket, CalendarClock, Sparkles } from "lucide-react";
import { SLOTS, SLOT_META, drawNameFor } from "@/lib/draws";
import { getLastNDays, getResultsForDate } from "@/lib/results";
import { getSettings, siteUrl } from "@/lib/settings";
import { dotted, fullDate, isoToDMY, longDate, shortDate, todayIST, weekdayName } from "@/lib/time";
import { HOME_FAQS } from "@/lib/content";
import { fingerprint } from "@/lib/live";
import { mediaUrl } from "@/lib/storage";
import { DrawCard } from "@/components/DrawCard";
import { LiveWatcher } from "@/components/LiveWatcher";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/JsonLd";
import { Ad } from "@/components/Ad";

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const today = todayIST();
  const title = `Lottery Sambad Result Today ${dotted(today)} – 1 PM, 6 PM, 8 PM Live`;
  const description = `Lottery Sambad result today ${longDate(today)} live – Dear Lottery 1 PM, 6 PM and 8 PM results with full prize list, result images, old results and ticket checker. Fast, accurate & updated instantly.`;
  return {
    title: { absolute: `${title} | ${s.siteName}` },
    description,
    alternates: { canonical: siteUrl() + "/" },
    openGraph: { title, description, url: siteUrl() + "/" },
  };
}

export default async function Home() {
  const today = todayIST();
  const [s, draws, week] = await Promise.all([getSettings(), getResultsForDate(today), getLastNDays(today, 7)]);
  const images = SLOTS.filter((x) => draws[x]?.imageKey);

  return (
    <>
      <section className="hero">
        <div className="wrap pb-10 pt-8 md:pb-14 md:pt-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold backdrop-blur">
            <span className="live-dot" /> Live · Auto-updating
          </div>
          <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-[3.4rem]">
            Lottery Sambad <span className="bg-gradient-to-r from-[#ffe27d] to-gold bg-clip-text text-transparent">Result Today</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-white/75 md:text-lg">
            Dear Lottery Sambad <b className="text-white">1 PM, 6 PM & 8 PM</b> results for <b className="text-white">{fullDate(today)}</b> – with the complete prize list,
            result images and a free ticket checker.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {SLOTS.map((x) => (
              <Link key={x} href={SLOT_META[x].path} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-gold hover:text-[#1c1400]">
                {SLOT_META[x].label} Result
              </Link>
            ))}
            <Link href="/old-results" className="rounded-full px-4 py-2 text-sm font-bold text-white/80 hover:text-white">
              Old results →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {SLOTS.map((x) => (
              <DrawCard key={x} slot={x} date={today} result={draws[x]} isToday schedule={s.schedule} firstAmount={s.prizes.first} />
            ))}
          </div>
        </div>
      </section>

      <div className="wrap">
        <Ad slot="inContent" className="pt-8" />

        {images.length > 0 && (
          <section className="mt-12">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="eyebrow">Result images</div>
                <h2 className="section-title mt-1">Today&apos;s Lottery Sambad result images</h2>
              </div>
              <Link href="/lottery-sambad-today" className="hidden text-sm font-bold text-brand-2 sm:block">All of today →</Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {images.map((x) => (
                <Link key={x} href={`/result/${isoToDMY(today)}/${x}#result-image`} className="card group overflow-hidden">
                  <div className="aspect-[4/5] overflow-hidden bg-surface-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(draws[x]!.imageKey)!} alt={`Lottery Sambad ${SLOT_META[x].label} result ${longDate(today)}`} loading="lazy" decoding="async" className="h-full w-full bg-white object-contain object-top transition duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <div className="flex items-center justify-between p-3 text-sm font-bold">
                    {SLOT_META[x].time} · {shortDate(today)} <ArrowRight className="size-4 text-brand-2" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="eyebrow">Last 7 days</div>
              <h2 className="section-title mt-1">Lottery Sambad weekly result</h2>
            </div>
            <Link href="/lottery-sambad-chart" className="text-sm font-bold text-brand-2">Full chart →</Link>
          </div>
          <div className="card mt-5 overflow-x-auto">
            <table className="table-x min-w-[560px]">
              <thead>
                <tr>
                  <th>Date</th>
                  {SLOTS.map((x) => (
                    <th key={x}>{SLOT_META[x].label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {week.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted">Results will appear here after the first draw is published.</td>
                  </tr>
                )}
                {week.map((d) => (
                  <tr key={d.date}>
                    <td className="whitespace-nowrap">
                      <Link href={`/result/${isoToDMY(d.date)}`} className="font-bold hover:text-brand-2">{shortDate(d.date)}</Link>
                      <div className="text-xs text-muted">{weekdayName(d.date)}</div>
                    </td>
                    {SLOTS.map((x) => (
                      <td key={x}>
                        {d.draws[x]?.firstPrize ? (
                          <Link href={`/result/${isoToDMY(d.date)}/${x}`} className="num rounded-lg bg-gold-soft px-2 py-1 font-extrabold hover:bg-gold hover:text-[#1c1400]">
                            {d.draws[x]!.firstPrize}
                          </Link>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/check-ticket", t: "Ticket Checker", d: "Check any ticket for any date in seconds.", Icon: Ticket },
            { href: "/old-results", t: "Old Results", d: "Full archive by date and month.", Icon: CalendarDays },
            { href: "/lottery-sambad-chart", t: "Result Chart", d: "30-day 1st prize chart of all draws.", Icon: LineChart },
            { href: "/lottery-sambad-draw-schedule", t: "Draw Schedule", d: "Draw names, timings & prize list.", Icon: CalendarClock },
          ].map(({ href, t, d, Icon }) => (
            <Link key={href} href={href} className="card group p-5 transition hover:-translate-y-0.5 hover:border-brand-2">
              <span className="grid size-11 place-items-center rounded-2xl bg-navy text-gold transition group-hover:bg-gold group-hover:text-navy">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-extrabold">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </Link>
          ))}
        </section>

        <section className="mt-12">
          <div className="eyebrow">Timings</div>
          <h2 className="section-title mt-1">Lottery Sambad draw timings today</h2>
          <div className="card mt-5 overflow-x-auto">
            <table className="table-x min-w-[560px]">
              <thead>
                <tr>
                  <th>Draw</th>
                  <th>Draw name ({weekdayName(today)})</th>
                  <th>Draw time</th>
                  <th>Result time</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {SLOTS.map((x) => (
                  <tr key={x}>
                    <td>
                      <Link href={SLOT_META[x].path} className="font-bold text-brand-2 hover:underline">Lottery Sambad {SLOT_META[x].label}</Link>
                    </td>
                    <td>{draws[x]?.drawName ?? drawNameFor(x, today, s.schedule)}</td>
                    <td className="font-semibold">{SLOT_META[x].time}</td>
                    <td className="text-muted">{SLOT_META[x].expected}</td>
                    <td>{SLOT_META[x].state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="prose-x mt-12 max-w-none">
          <h2>Lottery Sambad – today&apos;s results, fast and accurate</h2>
          <p>
            <strong>Lottery Sambad</strong> is the most searched name for the daily <strong>Dear Lottery results</strong> of the Nagaland and Sikkim State Lotteries. Three
            draws are held every day – <Link href="/lottery-sambad-1pm-result">1 PM</Link> (Morning), <Link href="/lottery-sambad-6pm-result">6 PM</Link> (Day) and{" "}
            <Link href="/lottery-sambad-8pm-result">8 PM</Link> (Night). {s.siteName} publishes each result within moments of the official declaration, in clean text
            that is easy to read on any phone, together with the result image.
          </p>
          <h3>Why readers prefer {s.siteName}</h3>
          <ul>
            <li><strong>Automatic live updates</strong> – pages refresh by themselves when a result is declared.</li>
            <li><strong>Text + image</strong> – every prize tier in searchable text, plus the full result sheet image to download.</li>
            <li><strong>Complete archive</strong> – <Link href="/old-results">old Lottery Sambad results</Link> by date and month, and a <Link href="/lottery-sambad-chart">30-day chart</Link>.</li>
            <li><strong>Free ticket checker</strong> – find out instantly whether your ticket won any prize.</li>
            <li><strong>Fast & light</strong> – built for slow mobile networks, with a comfortable dark mode.</li>
          </ul>
          <blockquote>
            {s.siteName} is an independent website for information and education only. We do not sell or promote lottery tickets. Always verify results with the official Government Gazette.
          </blockquote>
        </section>

        <FAQ items={HOME_FAQS} />

        <div className="mt-12 flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-br from-navy to-navy-2 p-8 text-center text-white">
          <Sparkles className="size-7 text-gold" />
          <h2 className="text-xl font-extrabold">Never miss a result</h2>
          <p className="max-w-md text-sm text-white/70">Bookmark this page – it updates itself at 1 PM, 6 PM and 8 PM every day.</p>
          <Link href="/lottery-sambad-today" className="btn btn-gold mt-2">See today&apos;s full result <ArrowRight className="size-4" /></Link>
        </div>
      </div>

      <LiveWatcher date={today} have={{ "1pm": fingerprint(draws["1pm"]), "6pm": fingerprint(draws["6pm"]), "8pm": fingerprint(draws["8pm"]) }} />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: s.siteName,
            alternateName: "Lottery Sambad Plus",
            url: siteUrl() + "/",
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: s.siteName,
            url: siteUrl() + "/",
            logo: siteUrl() + "/icon-512.png",
            email: s.contactEmail,
            sameAs: Object.values(s.social).filter(Boolean),
          },
        ]}
      />
    </>
  );
}
