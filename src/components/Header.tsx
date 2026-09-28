import Link from "@/components/SiteLink";
import { Ticket } from "lucide-react";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { TopBar } from "./TopBar";
import { LangSwitcher } from "./LangSwitcher";
import { getDict, lp, type Locale } from "@/lib/i18n";
import { mainNav, moreNav } from "@/lib/nav";
import { SLOTS } from "@/lib/draws";

const SLOT_PATH = { "1pm": "/lottery-sambad-1pm-result", "6pm": "/lottery-sambad-6pm-result", "8pm": "/lottery-sambad-8pm-result" } as const;

export function Header({ lang, siteName, logoUrl }: { lang: Locale; siteName: string; logoUrl?: string }) {
  const t = getDict(lang);
  const main = mainNav(lang, t);
  const more = moreNav(lang, t);
  const slots = Object.fromEntries(SLOTS.map((s) => [s, { label: t.slots[s].label, href: lp(lang, SLOT_PATH[s]) }]));
  return (
    <>
      <TopBar t={{ monthsShort: t.monthsShort, weekdays: t.weekdays, am: t.am, pm: t.pm, next: t.top.next, ist: t.top.ist, slots }} />
      <header className="sticky top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/75">
        <div className="wrap flex h-16 items-center justify-between gap-3">
          <Logo siteName={siteName} logoUrl={logoUrl} href={lp(lang, "/")} live={t.brand.live} />
          <NavLinks items={main} more={more} moreLabel={t.nav.more} />
          <div className="flex items-center gap-2">
            <Link href={lp(lang, "/check-ticket")} className="btn btn-gold hidden !py-2 2xl:inline-flex">
              <Ticket className="size-4" /> {t.nav.check}
            </Link>
            <LangSwitcher lang={lang} label={t.nav.language} />
            <ThemeToggle label={t.nav.darkMode} />
            <MobileMenu items={[...main, ...more]} labels={{ menu: t.nav.menu, open: t.nav.openMenu, close: t.nav.close }} />
          </div>
        </div>
      </header>
    </>
  );
}
