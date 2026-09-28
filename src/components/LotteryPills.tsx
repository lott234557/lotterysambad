import Link from "@/components/SiteLink";
import { SLOTS, SLOT_META } from "@/lib/draws";
import { fmt, getDict, lp, type Locale } from "@/lib/i18n";
import { otherText } from "@/lib/i18n/others";
import { OTHER, OTHER_IDS, type OtherId } from "@/lib/others/config";

/** Same look as the "1 PM Result / 6 PM Result / 8 PM Result" buttons in the page heroes. */
export const HERO_PILL =
  "rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-gold hover:text-[#1c1400]";

/**
 * Row of hero buttons for the other state lotteries (Kerala, Punjab, Maharashtra, West Bengal).
 * Shown below the Lottery Sambad buttons on the home / day / result pages. These pages are
 * deliberately not in the header menu – the buttons are how visitors (and search engines) find them.
 *
 * On a state lottery page pass `current` (hides that lottery) and `sambad` (adds the 1 / 6 / 8 PM buttons first).
 */
export function LotteryPills({
  lang,
  current,
  sambad = false,
  className = "mt-2",
}: {
  lang: Locale;
  current?: OtherId;
  sambad?: boolean;
  className?: string;
}) {
  const t = getDict(lang);
  const o = otherText(lang);
  const ids = OTHER_IDS.filter((id) => id !== current);
  const slots = sambad ? SLOTS : [];
  return (
    <nav aria-label={o.ui.moreLotteries} className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="w-full text-[0.7rem] font-bold uppercase tracking-[0.14em] text-white/55 sm:mr-1 sm:w-auto">{o.ui.moreLotteries}</span>
      {slots.map((x) => (
        <Link key={x} href={lp(lang, SLOT_META[x].path)} className={HERO_PILL}>
          {fmt(t.home.slotBtn, { slot: t.slots[x].label })}
        </Link>
      ))}
      {ids.map((id) => (
        <Link key={id} href={lp(lang, OTHER[id].path)} className={HERO_PILL} title={o.lotteries[id].name}>
          {o.lotteries[id].btn}
        </Link>
      ))}
    </nav>
  );
}
