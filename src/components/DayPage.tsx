import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SLOTS } from "@/lib/draws";
import { getNeighbours, getResultsForDate } from "@/lib/results";
import { getSettings } from "@/lib/settings";
import { fingerprint } from "@/lib/live";
import { isoToDMY, todayIST } from "@/lib/time";
import { fmt, fullDateL, getDict, lp, shortDateL, type Locale } from "@/lib/i18n";
import { dateJumpText } from "@/lib/i18n/ui";
import { PageHero } from "./PageHero";
import { DayFull } from "./DayFull";
import { DrawCard } from "./DrawCard";
import { LiveWatcher } from "./LiveWatcher";
import { FAQ } from "./FAQ";
import { DateJump } from "./DateJump";
import { LotteryPills } from "./LotteryPills";

export async function DayPage({
  date,
  title,
  eyebrow,
  crumbs,
  lang = "en",
}: {
  date: string;
  title: string;
  eyebrow: string;
  crumbs: { name: string; href?: string }[];
  lang?: Locale;
}) {
  const t = getDict(lang);
  const today = todayIST();
  const isToday = date === today;
  const [s, draws, nb] = await Promise.all([getSettings(), getResultsForDate(date), getNeighbours(date)]);
  return (
    <>
      <PageHero
        lang={lang}
        crumbs={crumbs}
        eyebrow={
          isToday ? (
            <>
              <span className="live-dot" /> {eyebrow}
            </>
          ) : (
            eyebrow
          )
        }
        title={title}
        subtitle={fmt(t.day.subtitle, { date: fullDateL(t, date) })}
      >
        <div className="mt-6 flex flex-wrap gap-2">
          {SLOTS.map((x) => (
            <a
              key={x}
              href={`#${x}`}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-gold hover:text-[#1c1400]"
            >
              {t.slots[x].label} {draws[x]?.firstPrize ? <span className="num ml-1 text-gold">{draws[x]!.firstPrize}</span> : null}
            </a>
          ))}
        </div>
        <LotteryPills lang={lang} className="mt-3" />
      </PageHero>
      <div className="wrap mt-8">
        <div className="grid gap-4 md:grid-cols-3">
          {SLOTS.map((x) => (
            <DrawCard key={x} slot={x} date={date} result={draws[x]} isToday={isToday} schedule={s.schedule} firstAmount={s.prizes.first} lang={lang} />
          ))}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_1.2fr]">
          {nb.prev ? (
            <Link href={lp(lang, `/result/${isoToDMY(nb.prev)}`)} className="card flex items-center gap-2 p-4 text-sm font-bold hover:border-brand-2">
              <ChevronLeft className="size-4" /> {shortDateL(t, nb.prev)}
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          {nb.next ? (
            <Link
              href={lp(lang, nb.next === today ? "/lottery-sambad-today" : `/result/${isoToDMY(nb.next)}`)}
              className="card flex items-center justify-end gap-2 p-4 text-sm font-bold hover:border-brand-2"
            >
              {shortDateL(t, nb.next)} <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          <div className="card p-3">
            <DateJump max={today} defaultValue={date} t={dateJumpText(lang)} />
          </div>
        </div>
        <div className="mt-12">
          <DayFull date={date} draws={draws} isToday={isToday} s={s} lang={lang} />
        </div>
        <FAQ items={[0, 1, 3, 4].map((i) => t.home.faq[i])} title={t.common.faq} />
      </div>
      {isToday && <LiveWatcher date={date} have={{ "1pm": fingerprint(draws["1pm"]), "6pm": fingerprint(draws["6pm"]), "8pm": fingerprint(draws["8pm"]) }} />}
    </>
  );
}
