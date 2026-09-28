import "server-only";
import { revalidatePath } from "next/cache";
import { LOCALES, lp } from "./i18n/config";
import { addDays, isoToDMY, monthKey, todayIST } from "./time";
import { OTHER, OTHER_IDS, type OtherId } from "./others/config";

/**
 * Cache clearing.
 *
 * Every rebuilt page costs Vercel "ISR Writes" (8 KB units – a result page is ~40–80 units in 4 languages each),
 * so we never clear the whole site after a result any more. Only the pages that actually show the new data are
 * cleared, and they rebuild lazily on their next visit. The whole-site purge is kept for admin changes that
 * affect every page (settings, ads, menu/footer pages) and the "Refresh website" button.
 */

function purge(paths: Iterable<string>) {
  const done = new Set<string>();
  for (const p of paths) {
    for (const l of LOCALES) {
      const url = lp(l, p);
      if (done.has(url)) continue;
      done.add(url);
      try {
        revalidatePath(url);
      } catch (e) {
        console.warn("[revalidate] failed", url, (e as Error).message);
      }
    }
  }
}

function purgeFiles(...files: string[]) {
  for (const f of files) {
    try {
      revalidatePath(f);
    } catch {}
  }
}

/** Everything (settings, ads, footer pages, "Refresh website"). */
export function revalidateSite() {
  try {
    revalidatePath("/", "layout");
    purgeFiles("/sitemap.xml", "/robots.txt", "/ads.txt");
  } catch (e) {
    console.warn("[revalidate] failed", (e as Error).message);
  }
}

/** Pages that show a Lottery Sambad date (1 / 6 / 8 PM). `newUrls` = a draw row was created (sitemap changes). */
export function revalidateDraw(date: string, opts: { newUrls?: boolean } = {}) {
  const today = todayIST();
  const dmy = isoToDMY(date);
  const paths = [
    `/result/${dmy}`,
    `/result/${dmy}/1pm`,
    `/result/${dmy}/6pm`,
    `/result/${dmy}/8pm`,
    `/west-bengal-state-lottery-result/${dmy}`,
    `/old-results/${monthKey(date)}`,
  ];
  if (date === today) {
    paths.push(
      "/",
      "/lottery-sambad-today",
      "/lottery-sambad-1pm-result",
      "/lottery-sambad-6pm-result",
      "/lottery-sambad-8pm-result",
      "/west-bengal-state-lottery-result",
    );
  }
  if (date === addDays(today, -1)) paths.push("/lottery-sambad-yesterday-result");
  purge(paths);
  if (opts.newUrls) purgeFiles("/sitemap.xml");
}

/** Pages of Kerala / Punjab / Maharashtra / West Bengal for a date. */
export function revalidateOther(id: OtherId, date: string, opts: { newUrls?: boolean } = {}) {
  const paths = [`${OTHER[id].path}/${isoToDMY(date)}`];
  if (date === todayIST()) paths.push(OTHER[id].path);
  purge(paths);
  if (opts.newUrls) purgeFiles("/sitemap.xml");
}

/** Once after midnight IST: pages whose content depends on "today" (dates, countdowns, 7/30-day lists). */
export function revalidateNewDay() {
  const today = todayIST();
  const y = isoToDMY(addDays(today, -1));
  purge([
    // yesterday's date pages were built while it was "today" (live boxes, countdowns)
    `/result/${y}`,
    `/result/${y}/1pm`,
    `/result/${y}/6pm`,
    `/result/${y}/8pm`,
    ...OTHER_IDS.map((id) => `${OTHER[id].path}/${y}`),
    "/",
    "/lottery-sambad-today",
    "/lottery-sambad-yesterday-result",
    "/lottery-sambad-1pm-result",
    "/lottery-sambad-6pm-result",
    "/lottery-sambad-8pm-result",
    "/lottery-sambad-chart",
    "/lottery-sambad-draw-schedule",
    "/check-ticket",
    "/indian-lotteries",
    "/old-results",
    `/old-results/${monthKey(today)}`,
    ...OTHER_IDS.map((id) => OTHER[id].path),
  ]);
  purgeFiles("/sitemap.xml");
}

/** Blog index + one article. */
export function revalidateBlog(slug?: string) {
  purgeFiles("/blog", ...(slug ? [`/blog/${slug}`] : []), "/sitemap.xml");
}
