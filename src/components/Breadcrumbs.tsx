import Link from "@/components/SiteLink";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { siteUrl } from "@/lib/settings";
import { getDict, lp, type Locale } from "@/lib/i18n";

export function Breadcrumbs({ items, invert = true, lang = "en" }: { items: { name: string; href?: string }[]; invert?: boolean; lang?: Locale }) {
  const all = [{ name: getDict(lang).common.home, href: lp(lang, "/") }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className={`text-[0.78rem] ${invert ? "text-white/70" : "text-muted"}`}>
        <ol className="flex flex-wrap items-center gap-1">
          {all.map((it, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3.5 opacity-60" />}
              {it.href && i < all.length - 1 ? (
                <Link href={it.href} className={invert ? "hover:text-white" : "hover:text-ink"}>
                  {it.name}
                </Link>
              ) : (
                <span className={invert ? "text-white" : "text-ink"} aria-current="page">
                  {it.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((it, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: it.name,
            ...(it.href ? { item: siteUrl() + it.href } : {}),
          })),
        }}
      />
    </>
  );
}
