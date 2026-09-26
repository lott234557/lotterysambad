import { ogImage, OG_SIZE } from "@/lib/og";
import { SLOT_META, drawNameFor, isSlot } from "@/lib/draws";
import { getResult } from "@/lib/results";
import { dmyToISO, longDate } from "@/lib/time";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Lottery Sambad result";
export const revalidate = 3600;
export const generateStaticParams = () => [];

export default async function Image({ params }: { params: Promise<{ date: string; slot: string }> }) {
  const { date, slot } = await params;
  const iso = dmyToISO(date);
  if (!iso || !isSlot(slot)) return ogImage({ kicker: "Lottery Sambad", title: "Lottery Sambad Result Today" });
  const r = await getResult(iso, slot);
  return ogImage({
    kicker: `Lottery Sambad ${SLOT_META[slot].label} Result`,
    title: longDate(iso),
    sub: r?.drawName ?? drawNameFor(slot, iso),
    number: r?.firstPrize ?? null,
  });
}
