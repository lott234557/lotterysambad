import { ogImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Lottery Sambad Result Today – 1 PM, 6 PM, 8 PM";

export default function Image() {
  return ogImage({ kicker: "Dear Lottery Sambad", title: "Lottery Sambad Result Today", sub: "Fastest 1 PM, 6 PM & 8 PM results with full prize list & images" });
}
