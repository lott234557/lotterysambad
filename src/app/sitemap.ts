import type { MetadataRoute } from "next";
import { getAllResultKeys } from "@/lib/results";
import { getAllPages, getPublishedPosts } from "@/lib/pages";
import { siteUrl } from "@/lib/settings";
import { isoToDMY, monthKey, todayIST } from "@/lib/time";
import { SLOT_META } from "@/lib/draws";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const [results, pages, posts] = await Promise.all([getAllResultKeys(), getAllPages(), getPublishedPosts(1000)]);
  const latest = results[0]?.updatedAt ?? now;

  const live: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: latest, changeFrequency: "hourly", priority: 1 },
    ...Object.values(SLOT_META).map((m) => ({ url: base + m.path, lastModified: latest, changeFrequency: "hourly" as const, priority: 0.95 })),
    { url: `${base}/lottery-sambad-today`, lastModified: latest, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/lottery-sambad-yesterday-result`, lastModified: latest, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/old-results`, lastModified: latest, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/lottery-sambad-chart`, lastModified: latest, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/check-ticket`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/lottery-sambad-draw-schedule`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog`, lastModified: posts[0]?.updatedAt ?? now, changeFrequency: "weekly", priority: 0.5 },
  ];

  // day pages + draw pages
  const days = new Map<string, Date>();
  const months = new Map<string, Date>();
  const draws: MetadataRoute.Sitemap = [];
  for (const r of results) {
    const u = new Date(r.updatedAt);
    if (!days.has(r.drawDate) || days.get(r.drawDate)! < u) days.set(r.drawDate, u);
    const mk = monthKey(r.drawDate);
    if (!months.has(mk) || months.get(mk)! < u) months.set(mk, u);
    draws.push({ url: `${base}/result/${isoToDMY(r.drawDate)}/${r.slot}`, lastModified: u, changeFrequency: r.drawDate === todayIST() ? "hourly" : "yearly", priority: 0.6 });
  }
  const dayUrls: MetadataRoute.Sitemap = Array.from(days.entries()).map(([d, u]) => ({
    url: `${base}/result/${isoToDMY(d)}`,
    lastModified: u,
    changeFrequency: d === todayIST() ? "hourly" : "yearly",
    priority: 0.7,
  }));
  const monthUrls: MetadataRoute.Sitemap = Array.from(months.entries()).map(([m, u]) => ({
    url: `${base}/old-results/${m}`,
    lastModified: u,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  return [
    ...live,
    ...dayUrls,
    ...draws,
    ...monthUrls,
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...pages.map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
