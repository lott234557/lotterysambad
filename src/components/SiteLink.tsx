import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * next/link without automatic prefetching.
 *
 * By default every link that scrolls into view is prefetched, and on Vercel a prefetch of a page that is not
 * in the cache yet (or was just cleared after a new result) builds that page – one ISR write of 40–80 units
 * per page and language. A single visit to the home page could rebuild dozens of result pages that nobody
 * opens. Pages load on click instead (still fast – they are served from the CDN).
 */
export default function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
