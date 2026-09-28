import { ogImage, OG_SIZE } from "@/lib/og";
import { SLOT_META, drawNameFor } from "@/lib/draws";
import { getResult } from "@/lib/results";
import { longDate, todayIST } from "@/lib/time";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Lottery Sambad 6 PM result today";
export const revalidate = 86400; // safety net only – pages are rebuilt on demand when a result arrives and once after midnight (src/lib/revalidate.ts)

export default async function Image() {
  const d = todayIST();
  const r = await getResult(d, "6pm");
  return ogImage({ kicker: `Lottery Sambad ${SLOT_META["6pm"].label} Result Today`, title: longDate(d), sub: r?.drawName ?? drawNameFor("6pm", d), number: r?.firstPrize ?? null });
}
