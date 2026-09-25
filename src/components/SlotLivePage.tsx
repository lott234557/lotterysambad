import type { Metadata } from "next";
import { SLOT_META, drawNameFor, type Slot } from "@/lib/draws";
import { getResult } from "@/lib/results";
import { getSettings, siteUrl } from "@/lib/settings";
import { dotted, longDate, todayIST } from "@/lib/time";
import { ResultView } from "./ResultView";

export async function slotMetadata(slot: Slot): Promise<Metadata> {
  const today = todayIST();
  const [s, r] = await Promise.all([getSettings(), getResult(today, slot)]);
  const m = SLOT_META[slot];
  const name = r?.drawName || drawNameFor(slot, today, s.schedule);
  const title = `Lottery Sambad ${m.label} Result Today ${dotted(today)} – ${m.period === "Night" ? "Dear Night" : m.period === "Day" ? "Dear Day" : "Dear Morning"} Live`;
  const description = r?.firstPrize
    ? `Lottery Sambad ${m.label} result today ${longDate(today)} (${name}): 1st prize ${r.firstPrize}. Full 1st to 5th prize list, result image & ticket checker – updated instantly.`
    : `Lottery Sambad ${m.label} result today ${longDate(today)} (${name}) live. Result declared around ${m.expected} IST – full prize list and result image, updated automatically.`;
  return {
    title: { absolute: `${title} | ${s.siteName}` },
    description,
    alternates: { canonical: siteUrl() + m.path },
    openGraph: { title, description, url: siteUrl() + m.path, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function SlotLivePage({ slot }: { slot: Slot }) {
  const today = todayIST();
  const [s, r] = await Promise.all([getSettings(), getResult(today, slot)]);
  return <ResultView date={today} slot={slot} result={r} settings={s} live />;
}
