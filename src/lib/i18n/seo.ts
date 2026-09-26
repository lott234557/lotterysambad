import type { Metadata } from "next";
import { siteUrl } from "../settings";
import { HREFLANG, LOCALES, lp, type Locale } from "./config";

/** canonical + hreflang alternates for a localisable English path ("/", "/check-ticket", ...). */
export function alternates(lang: Locale, path: string): NonNullable<Metadata["alternates"]> {
  const base = siteUrl();
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[HREFLANG[l]] = base + lp(l, path);
  languages["x-default"] = base + path;
  return { canonical: base + lp(lang, path), languages };
}

/** Full URL of a localisable path in a language. */
export const urlFor = (lang: Locale, path: string) => siteUrl() + lp(lang, path);

/** OpenGraph locale tag, e.g. "hi_IN". */
export const ogLocale = (lang: Locale) => HREFLANG[lang].replace("-", "_");
