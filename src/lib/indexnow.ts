import "server-only";
import { siteUrl } from "./settings";
import { LOCALES, lp } from "./i18n/config";

/** Notify Bing/Yandex (IndexNow) about new or updated URLs. */
export async function pingIndexNow(key: string, paths: string[]) {
  const base = siteUrl();
  const host = new URL(base).host;
  if (host.startsWith("localhost")) return;
  await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `${base}/indexnow-key.txt`,
      // every language version of each page
      urlList: Array.from(new Set(paths.flatMap((p) => (p.startsWith("http") ? [p] : LOCALES.map((l) => base + lp(l, p)))))),
    }),
    signal: AbortSignal.timeout(8000),
  });
}
