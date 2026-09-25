import type { MetadataRoute } from "next";
import { getSettings, siteUrl } from "@/lib/settings";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSettings();
  const extraDisallow = s.robotsExtra
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^disallow:/i.test(l))
    .map((l) => l.replace(/^disallow:\s*/i, ""));
  const extraAllow = s.robotsExtra
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^allow:/i.test(l))
    .map((l) => l.replace(/^allow:\s*/i, ""));
  return {
    rules: [{ userAgent: "*", allow: ["/", ...extraAllow], disallow: ["/admin", "/api/", ...extraDisallow] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
