import { notFound } from "next/navigation";
import { isPrefixed, type Locale } from "./config";

export type LocaleParams = Promise<{ slug: string }>;

/** For pages under /[slug]/…: returns the locale or 404s when the first segment is not hi/bn/ml. */
export async function localeFrom(params: LocaleParams): Promise<Exclude<Locale, "en">> {
  const { slug } = await params;
  if (!isPrefixed(slug)) notFound();
  return slug;
}
