import { getSettings, type AdSlotKey } from "@/lib/settings";
import { AdSlot } from "./AdSlot";

/** Server wrapper: renders the ad code configured in Admin → Ads for a slot. */
export async function Ad({ slot, className = "" }: { slot: AdSlotKey; className?: string }) {
  const s = await getSettings();
  const code = s.adSlots[slot]?.trim();
  if (!code) return null;
  return <AdSlot code={code} className={className} />;
}
