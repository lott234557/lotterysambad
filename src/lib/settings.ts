import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db, safeRead } from "./db";
import { settings } from "./db/schema";
import { DEFAULT_PRIZES, DEFAULT_SCHEDULE, type Slot, type TierKey } from "./draws";

export type AdSlotKey = "headerBelow" | "resultTop" | "resultMiddle" | "resultBottom" | "inContent" | "sidebar" | "footerAbove";

export const AD_SLOTS: { key: AdSlotKey; label: string; hint: string }[] = [
  { key: "headerBelow", label: "Below header", hint: "Shown on every page right under the menu." },
  { key: "resultTop", label: "Result – above prizes", hint: "On result pages, above the prize list." },
  { key: "resultMiddle", label: "Result – after 3rd prize", hint: "Between the prize tiers." },
  { key: "resultBottom", label: "Result – after image", hint: "Below the result image." },
  { key: "inContent", label: "In article content", hint: "Inside long text sections, articles & guides." },
  { key: "sidebar", label: "Sidebar (desktop)", hint: "Right sidebar on large screens." },
  { key: "footerAbove", label: "Above footer", hint: "Shown on every page above the footer." },
];

export type SiteSettings = {
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  contactEmail: string;
  footerAbout: string;
  footerDisclaimer: string;
  social: { telegram: string; whatsapp: string; facebook: string; youtube: string; x: string };
  // analytics / seo
  gaId: string;
  gscVerification: string;
  bingVerification: string;
  robotsExtra: string;
  indexNowKey: string;
  bodyEndCode: string;
  // ads
  adsenseClient: string;
  adsTxt: string;
  adSlots: Record<AdSlotKey, string>;
  // results
  prizes: Record<TierKey, string>;
  schedule: Record<Slot, string[]>;
  scraperEnabled: boolean;
  showImageCredit: boolean;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Lottery Sambad Plus",
  siteTagline: "Fastest Lottery Sambad Result Today – 1 PM, 6 PM & 8 PM",
  logoUrl: "",
  contactEmail: "contact@lotterysambad.plus",
  footerAbout:
    "Lottery Sambad Plus publishes Dear Lottery Sambad results of 1 PM, 6 PM and 8 PM draws as soon as they are declared, with a complete old result archive, charts and a free ticket checker.",
  footerDisclaimer:
    "Disclaimer: lotterysambad.plus is an independent informational website created for educational purposes and result display only. We are not associated with any state government or lottery department. We do not sell, promote, advertise or distribute lottery tickets and we do not encourage gambling in any form. Results are collected from publicly available sources — always verify with the official Government Gazette before claiming any prize. Lottery may be addictive; play responsibly and only where it is legal.",
  social: { telegram: "", whatsapp: "", facebook: "", youtube: "", x: "" },
  gaId: "",
  gscVerification: "",
  bingVerification: "",
  robotsExtra: "",
  indexNowKey: "",
  bodyEndCode: "",
  adsenseClient: "",
  adsTxt: "",
  adSlots: {
    headerBelow: "",
    resultTop: "",
    resultMiddle: "",
    resultBottom: "",
    inContent: "",
    sidebar: "",
    footerAbove: "",
  },
  prizes: { ...DEFAULT_PRIZES },
  schedule: DEFAULT_SCHEDULE,
  scraperEnabled: true,
  showImageCredit: false,
};

const KEY = "site";

function merge(v: Partial<SiteSettings> | null | undefined): SiteSettings {
  const s = v ?? {};
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    social: { ...DEFAULT_SETTINGS.social, ...(s.social ?? {}) },
    adSlots: { ...DEFAULT_SETTINGS.adSlots, ...(s.adSlots ?? {}) },
    prizes: { ...DEFAULT_SETTINGS.prizes, ...(s.prizes ?? {}) },
    schedule: { ...DEFAULT_SETTINGS.schedule, ...(s.schedule ?? {}) },
  };
}

async function loadRaw(): Promise<Partial<SiteSettings> | null> {
  const rows = await db.select().from(settings).where(eq(settings.key, KEY)).limit(1);
  return (rows[0]?.value as Partial<SiteSettings>) ?? null;
}

/** Cached per request. */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  return merge(await safeRead(loadRaw, null));
});

/** Uncached (for admin / scraper). */
export async function getSettingsFresh(): Promise<SiteSettings> {
  return merge(await loadRaw());
}

export async function saveSettings(patch: Partial<SiteSettings>) {
  const current = await getSettingsFresh();
  const next = merge({ ...current, ...patch });
  await db
    .insert(settings)
    .values({ key: KEY, value: next, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value: next, updatedAt: new Date() } });
  return next;
}

export const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || "https://lotterysambad.plus").replace(/\/+$/, "");
