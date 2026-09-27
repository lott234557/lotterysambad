/** Locale configuration shared by server, client and proxy code (no heavy imports here). */

export const LOCALES = ["en", "hi", "bn", "ml"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
/** Locales that live under a URL prefix (/hi, /bn, /ml). English is served from the root. */
export const PREFIXED = ["hi", "bn", "ml"] as const;

export const isLocale = (s: string | null | undefined): s is Locale => !!s && (LOCALES as readonly string[]).includes(s);
export const isPrefixed = (s: string | null | undefined): s is Exclude<Locale, "en"> =>
  !!s && (PREFIXED as readonly string[]).includes(s);

export const LOCALE_NAMES: Record<Locale, { native: string; english: string; short: string }> = {
  en: { native: "English", english: "English", short: "EN" },
  hi: { native: "हिन्दी", english: "Hindi", short: "हि" },
  bn: { native: "বাংলা", english: "Bengali", short: "বা" },
  ml: { native: "മലയാളം", english: "Malayalam", short: "മ" },
};

/** BCP-47 tags for <html lang> and hreflang */
export const HREFLANG: Record<Locale, string> = { en: "en-IN", hi: "hi-IN", bn: "bn-IN", ml: "ml-IN" };

/** Paths that exist in every language (prefix match for dynamic ones). */
const LOCALIZABLE = [
  /^\/$/,
  /^\/lottery-sambad-(1pm|6pm|8pm)-result$/,
  /^\/lottery-sambad-today$/,
  /^\/lottery-sambad-yesterday-result$/,
  /^\/result\/[^/]+(\/[^/]+)?$/,
  /^\/old-results(\/[^/]+)?$/,
  /^\/lottery-sambad-chart$/,
  /^\/lottery-sambad-draw-schedule$/,
  /^\/check-ticket$/,
  /^\/indian-lotteries$/,
  /^\/(kerala-lottery-result|punjab-state-lottery-result|maharashtra-lottery-result|west-bengal-state-lottery-result)(\/[^/]+)?$/,
];

export const isLocalizablePath = (path: string) => LOCALIZABLE.some((r) => r.test(path || "/"));

/** Build a link for a language: lp('hi','/check-ticket') -> '/hi/check-ticket'. Non-localizable paths stay English. */
export function lp(lang: Locale, path: string): string {
  if (lang === "en" || !path.startsWith("/")) return path;
  const [p, hash = ""] = path.split("#");
  if (!isLocalizablePath(p)) return path;
  return `/${lang}${p === "/" ? "" : p}${hash ? `#${hash}` : ""}`;
}

/** '/hi/check-ticket' -> { lang: 'hi', path: '/check-ticket' } */
export function splitLocale(pathname: string): { lang: Locale; path: string } {
  const m = /^\/(hi|bn|ml)(\/.*)?$/.exec(pathname);
  if (m) return { lang: m[1] as Locale, path: m[2] || "/" };
  return { lang: "en", path: pathname || "/" };
}

/** Pick the best supported language from an Accept-Language header. */
export function pickLocale(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const items = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.slice(2)) || 0 : 1 };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of items) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return null;
}

export const LANG_COOKIE = "lang";
