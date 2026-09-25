import "server-only";
import { siteUrl } from "./settings";

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
      urlList: paths.map((p) => (p.startsWith("http") ? p : base + p)),
    }),
    signal: AbortSignal.timeout(8000),
  });
}
