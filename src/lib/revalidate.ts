import "server-only";
import { revalidatePath } from "next/cache";

/** Invalidate every public page (+ sitemap/robots/ads.txt). Pages rebuild lazily on next visit. */
export function revalidateSite() {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/sitemap.xml");
    revalidatePath("/robots.txt");
    revalidatePath("/ads.txt");
  } catch (e) {
    console.warn("[revalidate] failed", (e as Error).message);
  }
}
