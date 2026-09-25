import { ogImage, OG_SIZE } from "@/lib/og";
import { SLOT_META, drawNameFor } from "@/lib/draws";
import { getResult } from "@/lib/results";
import { longDate, todayIST } from "@/lib/time";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Lottery Sambad 1 PM result today";
export const revalidate = 1800;

export default async function Image() {
  const d = todayIST();
  const r = await getResult(d, "1pm");
  return ogImage({ kicker: `Lottery Sambad ${SLOT_META["1pm"].label} Result Today`, title: longDate(d), sub: r?.drawName ?? drawNameFor("1pm", d), number: r?.firstPrize ?? null });
}
