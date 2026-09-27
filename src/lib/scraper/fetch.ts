const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";

const SOURCE_HOSTS = /^https?:\/\/(?:www\.)?([a-z0-9.-]+\.[a-z]{2,})(?=\/|$|\?)/i;

/** Dev/test only: route source-site requests to a local mock server (SCRAPER_MOCK_ORIGIN). */
function route(url: string) {
  const mock = process.env.SCRAPER_MOCK_ORIGIN;
  return mock ? url.replace(SOURCE_HOSTS, `${mock}/$1`) : url;
}

export async function fetchHtml(url: string, timeoutMs = 12_000) {
  const mocked = route(url) !== url;
  const res = await fetch(route(url), {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-IN,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, url: mocked ? url : res.url || url, text };
}

export async function fetchImage(url: string, timeoutMs = 15_000) {
  const res = await fetch(route(url), {
    headers: { "User-Agent": UA, Accept: "image/avif,image/webp,image/*,*/*;q=0.8", Referer: new URL(url).origin + "/" },
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const type = res.headers.get("content-type") || "";
  if (!res.ok || !type.startsWith("image/")) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 12_000) return null; // placeholders / "coming soon" graphics are tiny
  return { data: buf, contentType: type };
}
