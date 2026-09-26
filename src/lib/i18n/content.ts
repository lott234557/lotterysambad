/** Data-driven, localised text blocks (result summary, FAQs). */
import { SLOT_META, type Slot } from "../draws";
import type { Result } from "../db/schema";
import type { QA } from "@/components/FAQ";
import { fmt, getDict, longDateL, type Locale } from "./index";

/** "a, b and c" */
export function joinList(items: string[], and: string) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

export function resultSummary(lang: Locale, r: Result, firstAmount: string): string {
  const t = getDict(lang);
  const slot = r.slot as Slot;
  const stateEn = r.state ?? SLOT_META[slot].state;
  const parts = [
    fmt(t.result.summary1, {
      slot: t.slots[slot].label,
      date: longDateL(t, r.drawDate),
      name: r.drawName ?? "Dear Lottery",
      state: t.states[stateEn] ?? stateEn,
    }),
  ];
  if (r.firstPrize) {
    parts.push(fmt(t.result.summary2, { amount: firstAmount, ticket: r.firstPrize, digits: r.firstPrize.split(" ")[1] ?? "" }));
  }
  const c = t.result.counts;
  const counts = [
    r.secondPrize.length ? fmt(c.second, { n: r.secondPrize.length }) : "",
    r.thirdPrize.length ? fmt(c.third, { n: r.thirdPrize.length }) : "",
    r.fourthPrize.length ? fmt(c.fourth, { n: r.fourthPrize.length }) : "",
    r.fifthPrize.length ? fmt(c.fifth, { n: r.fifthPrize.length }) : "",
  ].filter(Boolean);
  if (counts.length) parts.push(fmt(t.result.summary3, { counts: joinList(counts, t.result.and) }));
  return parts.join(" ");
}

export function slotFaqs(lang: Locale, slot: Slot, prizes: Record<string, string>): QA[] {
  const t = getDict(lang);
  const s = t.slots[slot];
  const vars = { slot: s.label, time: s.time, expected: s.expected, ...prizes };
  return t.slotFaq.map((x) => ({ q: fmt(x.q, vars), a: fmt(x.a, vars) }));
}

/** Prize-amount variables for {first}, {cons}, … placeholders. */
export const prizeVars = (p: Record<string, string>) => ({ first: p.first, cons: p.cons, second: p.second, third: p.third, fourth: p.fourth, fifth: p.fifth });
