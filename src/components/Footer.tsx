import Link from "next/link";
import { Send, MessageCircle, ShieldCheck } from "lucide-react";
import { FacebookIcon as Facebook, YoutubeIcon as Youtube } from "./BrandIcons";
import { Logo } from "./Logo";
import { getFooterPages } from "@/lib/pages";
import type { SiteSettings } from "@/lib/settings";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { getDict, lp, type Locale } from "@/lib/i18n";

export async function Footer({ s, lang }: { s: SiteSettings; lang: Locale }) {
  const t = getDict(lang);
  const pages = await getFooterPages();
  const f = t.footer;
  const results = [
    { href: lp(lang, "/lottery-sambad-1pm-result"), label: f.s1 },
    { href: lp(lang, "/lottery-sambad-6pm-result"), label: f.s6 },
    { href: lp(lang, "/lottery-sambad-8pm-result"), label: f.s8 },
    { href: lp(lang, "/lottery-sambad-today"), label: f.today },
    { href: lp(lang, "/lottery-sambad-yesterday-result"), label: f.yesterday },
  ];
  const tools = [
    { href: lp(lang, "/old-results"), label: f.old },
    { href: lp(lang, "/lottery-sambad-chart"), label: f.chart },
    { href: lp(lang, "/check-ticket"), label: f.checker },
    { href: lp(lang, "/lottery-sambad-draw-schedule"), label: f.schedule },
    { href: lp(lang, "/indian-lotteries"), label: f.lotteries },
    { href: "/blog", label: f.guides },
  ];
  // Admin-edited texts are English; other languages use the translated defaults
  // unless the admin changed the English text (then the custom text is shown).
  const about = lang === "en" || s.footerAbout !== DEFAULT_SETTINGS.footerAbout ? s.footerAbout : f.about;
  const disclaimer = lang === "en" || s.footerDisclaimer !== DEFAULT_SETTINGS.footerDisclaimer ? s.footerDisclaimer : f.disclaimer;
  const social = [
    { href: s.social.telegram, label: "Telegram", Icon: Send },
    { href: s.social.whatsapp, label: "WhatsApp", Icon: MessageCircle },
    { href: s.social.facebook, label: "Facebook", Icon: Facebook },
    { href: s.social.youtube, label: "YouTube", Icon: Youtube },
  ].filter((x) => x.href);
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 bg-navy text-white/80">
      <div className="h-1 bg-gradient-to-r from-gold via-gold-2 to-gold" />
      <div className="wrap grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo siteName={s.siteName} logoUrl={s.logoUrl} invert href={lp(lang, "/")} live={t.brand.live} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">{about}</p>
          {social.length > 0 && (
            <div className="mt-5 flex gap-2">
              {social.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener nofollow" aria-label={label} className="grid size-10 place-items-center rounded-xl bg-white/10 transition hover:bg-gold hover:text-[#1c1400]">
                  <Icon className="size-[18px]" />
                </a>
              ))}
            </div>
          )}
        </div>
        <FooterCol title={f.results} links={results} />
        <FooterCol title={f.tools} links={tools} />
        <FooterCol title={f.legal} links={pages.map((p) => ({ href: `/${p.slug}`, label: p.title }))} />
      </div>
      <div className="border-t border-white/10">
        <div className="wrap pb-24 pt-6 lg:pb-6">
          <p className="flex gap-2 text-[0.72rem] leading-relaxed text-white/55">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold/80" />
            <span>{disclaimer}</span>
          </p>
          <div className="mt-4 flex flex-col gap-2 text-[0.75rem] text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {year} {s.siteName}. {f.rights}
            </span>
            <span>{f.adult}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gold">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-white/70 transition hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
