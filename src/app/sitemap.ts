import type { MetadataRoute } from "next";
import { getAllResultKeys } from "@/lib/results";
import { getAllPages, getPublishedPosts } from "@/lib/pages";
import { siteUrl } from "@/lib/settings";
import { isoToDMY, monthKey, todayIST } from "@/lib/time";
import { SLOT_META } from "@/lib/draws";
import { HREFLANG, LOCALES, lp } from "@/lib/i18n/config";
import { OTHER, OTHER_IDS, isOtherId } from "@/lib/others/config";
import { getOtherDateKeys } from "@/lib/others/data";

export const revalidate = 86400; // rebuilt on demand when content changes

type Entry = MetadataRoute.Sitemap[number];

/** lastmod for pages whose text only changes with a new release (guides, tools, comparison). */
const STATIC_PAGES_UPDATED = new Date("2026-09-28T00:00:00Z");

/**
 * Always a real Date, so every <lastmod> is written in W3C/ISO format (2026-09-27T10:35:44.668Z).
 * Raw database values like "2026-09-27 10:35:44.668+00" are not valid for Google.
 */
function toDate(v: unknown, fallback: Date): Date {
  if (v instanceof Date) return isNaN(v.getTime()) ? fallback : v;
  if (typeof v === "string" || typeof v === "number") {
    const s = typeof v === "string" ? v.trim().replace(" ", "T").replace(/([+-]\d\d)$/, "$1:00") : v;
    const d = new Date(s);
    return isNaN(d.getTime()) ? fallback : d;
  }
  return fallback;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  // No "new Date()" here: an unchanged sitemap must render byte-identical, otherwise every rebuild costs ISR writes.
  const now = STATIC_PAGES_UPDATED;
  const today = todayIST();
  const [results, pages, posts, otherKeys] = await Promise.all([getAllResultKeys(), getAllPages(), getPublishedPosts(1000), getOtherDateKeys()]);
  const latest = toDate(results[0]?.updatedAt, now);

  /** One entry per language, each listing all language versions (hreflang). */
  const localized = (path: string, e: Omit<Entry, "url">): Entry[] => {
    const languages = Object.fromEntries(LOCALES.map((l) => [HREFLANG[l], base + lp(l, path)]));
    return LOCALES.map((l) => ({ url: base + lp(l, path), ...e, alternates: { languages } }));
  };

  const live: MetadataRoute.Sitemap = [
    ...localized("/", { lastModified: latest, changeFrequency: "hourly", priority: 1 }),
    ...Object.values(SLOT_META).flatMap((m) => localized(m.path, { lastModified: latest, changeFrequency: "hourly", priority: 0.95 })),
    ...localized("/lottery-sambad-today", { lastModified: latest, changeFrequency: "hourly", priority: 0.9 }),
    ...localized("/lottery-sambad-yesterday-result", { lastModified: latest, changeFrequency: "daily", priority: 0.8 }),
    ...localized("/old-results", { lastModified: latest, changeFrequency: "daily", priority: 0.8 }),
    ...localized("/lottery-sambad-chart", { lastModified: latest, changeFrequency: "daily", priority: 0.7 }),
    ...localized("/indian-lotteries", { lastModified: now, changeFrequency: "weekly", priority: 0.7 }),
    ...localized("/check-ticket", { lastModified: now, changeFrequency: "weekly", priority: 0.7 }),
    ...localized("/lottery-sambad-draw-schedule", { lastModified: now, changeFrequency: "monthly", priority: 0.6 }),
    ...OTHER_IDS.flatMap((id) =>
      localized(OTHER[id].path, {
        lastModified: toDate(otherKeys.find((k) => k.lottery === id)?.updatedAt, id === "westbengal" ? latest : now),
        changeFrequency: "hourly",
        priority: 0.85,
      }),
    ),
    { url: `${base}/blog`, lastModified: toDate(posts[0]?.updatedAt, now), changeFrequency: "weekly", priority: 0.5 },
  ];
  const otherUrls = otherKeys
    .filter((k) => isOtherId(k.lottery))
    .flatMap((k) =>
      localized(`${OTHER[k.lottery as keyof typeof OTHER].path}/${isoToDMY(k.drawDate)}`, {
        lastModified: toDate(k.updatedAt, now),
        changeFrequency: k.drawDate === today ? "hourly" : "yearly",
        priority: 0.6,
      }),
    );

  // day pages + draw pages
  const days = new Map<string, Date>();
  const months = new Map<string, Date>();
  const draws: MetadataRoute.Sitemap = [];
  for (const r of results) {
    const u = toDate(r.updatedAt, now);
    if (!days.has(r.drawDate) || days.get(r.drawDate)! < u) days.set(r.drawDate, u);
    const mk = monthKey(r.drawDate);
    if (!months.has(mk) || months.get(mk)! < u) months.set(mk, u);
    draws.push(
      ...localized(`/result/${isoToDMY(r.drawDate)}/${r.slot}`, {
        lastModified: u,
        changeFrequency: r.drawDate === today ? "hourly" : "yearly",
        priority: 0.6,
      }),
    );
  }
  const dayUrls = Array.from(days.entries()).flatMap(([d, u]) =>
    localized(`/result/${isoToDMY(d)}`, { lastModified: u, changeFrequency: d === today ? "hourly" : "yearly", priority: 0.7 }),
  );
  const monthUrls = Array.from(months.entries()).flatMap(([m, u]) => localized(`/old-results/${m}`, { lastModified: u, changeFrequency: "daily", priority: 0.5 }));

  return [
    ...live,
    ...dayUrls,
    ...draws,
    ...monthUrls,
    ...otherUrls,
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: toDate(p.updatedAt, now), changeFrequency: "monthly" as const, priority: 0.5 })),
    ...pages.map((p) => ({ url: `${base}/${p.slug}`, lastModified: toDate(p.updatedAt, now), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
