import { lp, type Locale } from "./i18n/config";
import type { Dict } from "./i18n/dict/en";

export type NavItem = { href: string; label: string; desc?: string };

export function mainNav(lang: Locale, t: Dict): NavItem[] {
  return [
    { href: lp(lang, "/"), label: t.nav.home },
    { href: lp(lang, "/lottery-sambad-1pm-result"), label: t.nav.r1 },
    { href: lp(lang, "/lottery-sambad-6pm-result"), label: t.nav.r6 },
    { href: lp(lang, "/lottery-sambad-8pm-result"), label: t.nav.r8 },
    { href: lp(lang, "/lottery-sambad-today"), label: t.nav.today },
    { href: lp(lang, "/old-results"), label: t.nav.old },
  ];
}

export function moreNav(lang: Locale, t: Dict): NavItem[] {
  return [
    { href: lp(lang, "/check-ticket"), label: t.nav.check, desc: t.navDesc.check },
    { href: lp(lang, "/indian-lotteries"), label: t.nav.lotteries, desc: t.navDesc.lotteries },
    { href: lp(lang, "/lottery-sambad-yesterday-result"), label: t.nav.yesterday, desc: t.navDesc.yesterday },
    { href: lp(lang, "/lottery-sambad-chart"), label: t.nav.chart, desc: t.navDesc.chart },
    { href: lp(lang, "/lottery-sambad-draw-schedule"), label: t.nav.schedule, desc: t.navDesc.schedule },
    { href: "/blog", label: t.nav.guides, desc: t.navDesc.guides },
  ];
}

export function bottomNav(lang: Locale, t: Dict) {
  return [
    { href: lp(lang, "/"), label: t.bottom.home, icon: "home" as const },
    { href: lp(lang, "/lottery-sambad-1pm-result"), label: t.bottom.r1, icon: "sun" as const },
    { href: lp(lang, "/lottery-sambad-6pm-result"), label: t.bottom.r6, icon: "sunset" as const },
    { href: lp(lang, "/lottery-sambad-8pm-result"), label: t.bottom.r8, icon: "moon" as const },
    { href: lp(lang, "/old-results"), label: t.bottom.old, icon: "calendar" as const },
  ];
}

/** Is `href` the active item for the current pathname? */
export function isActive(pathname: string, href: string, homeHref: string) {
  if (href === homeHref) return pathname === homeHref;
  return pathname === href || pathname.startsWith(href + "/");
}
