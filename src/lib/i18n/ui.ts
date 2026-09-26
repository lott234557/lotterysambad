/** Builders for the small string bundles passed to client components (keeps client JS free of dictionaries). */
import type { Slot, TierKey } from "../draws";
import { fmt, getDict, lp, type Locale } from "./index";
import type { StatusText } from "@/components/DrawStatus";

export const statusText = (lang: Locale, slot: Slot): StatusText => {
  const t = getDict(lang);
  return { ...t.status, expected: fmt(t.status.expected, { x: t.slots[slot].expected }) };
};

export const tierLabels = (lang: Locale): Record<TierKey, string> => {
  const t = getDict(lang).tiers;
  return { first: t.first, cons: t.cons, second: t.second, third: t.third, fourth: t.fourth, fifth: t.fifth };
};

export const finderText = (lang: Locale) => ({ ...getDict(lang).finder, tiers: tierLabels(lang) });
export type FinderText = ReturnType<typeof finderText>;

export const shareText = (lang: Locale) => getDict(lang).share;
export type ShareText = ReturnType<typeof shareText>;

export const dateJumpText = (lang: Locale) => {
  const t = getDict(lang);
  return { choose: t.common.chooseDate, show: t.common.showResults, prefix: lp(lang, "/result/x").replace(/\/x$/, "") };
};
export type DateJumpText = ReturnType<typeof dateJumpText>;

export const checkerText = (lang: Locale) => {
  const t = getDict(lang);
  const c = t.checker;
  return {
    date: c.date,
    time: c.time,
    ticket: c.ticket,
    placeholder: c.placeholder,
    button: c.button,
    errDigits: c.errDigits,
    errNA: c.errNA,
    errLoad: c.errLoad,
    congrats: c.congrats,
    matched: c.matched,
    verify: c.verify,
    noPrize: c.noPrize,
    tiers: tierLabels(lang),
    slots: { "1pm": t.slots["1pm"].label, "6pm": t.slots["6pm"].label, "8pm": t.slots["8pm"].label } as Record<Slot, string>,
  };
};
export type CheckerText = ReturnType<typeof checkerText>;
