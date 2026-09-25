import { ogImage, OG_SIZE } from "@/lib/og";
import { SLOT_META, drawNameFor } from "@/lib/draws";
import { getResult } from "@/lib/results";
import { longDate, todayIST } from "@/lib/time";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Lottery Sambad 8 PM result today";
export const revalidate = 1800;

export default async function Image() {
  const d = todayIST();
  const r = await getResult(d, "8pm");
  return ogImage({ kicker: `Lottery Sambad ${SLOT_META["8pm"].label} Result Today`, title: longDate(d), sub: r?.drawName ?? drawNameFor("8pm", d), number: r?.firstPrize ?? null });
}
