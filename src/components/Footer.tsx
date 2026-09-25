import Link from "next/link";
import { Logo } from "./Logo";
import { getFooterPages } from "@/lib/pages";
import type { SiteSettings } from "@/lib/settings";
import { Send, MessageCircle, ShieldCheck } from "lucide-react";
import { FacebookIcon as Facebook, YoutubeIcon as Youtube } from "./BrandIcons";

const RESULTS = [
  { href: "/lottery-sambad-1pm-result", label: "Lottery Sambad 1 PM" },
  { href: "/lottery-sambad-6pm-result", label: "Lottery Sambad 6 PM" },
  { href: "/lottery-sambad-8pm-result", label: "Lottery Sambad 8 PM" },
  { href: "/lottery-sambad-today", label: "Lottery Sambad Today" },
  { href: "/lottery-sambad-yesterday-result", label: "Yesterday Result" },
];
const TOOLS = [
  { href: "/old-results", label: "Old Results Archive" },
  { href: "/lottery-sambad-chart", label: "Result Chart" },
  { href: "/check-ticket", label: "Ticket Checker" },
  { href: "/lottery-sambad-draw-schedule", label: "Draw Schedule & Prizes" },
  { href: "/blog", label: "Guides & Updates" },
];

export async function Footer({ s }: { s: SiteSettings }) {
  const pages = await getFooterPages();
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
          <Logo siteName={s.siteName} logoUrl={s.logoUrl} invert />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">{s.footerAbout}</p>
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
        <FooterCol title="Results" links={RESULTS} />
        <FooterCol title="Archive & Tools" links={TOOLS} />
        <FooterCol title="Legal" links={pages.map((p) => ({ href: `/${p.slug}`, label: p.title }))} />
      </div>
      <div className="border-t border-white/10">
        <div className="wrap pb-24 pt-6 lg:pb-6">
          <p className="flex gap-2 text-[0.72rem] leading-relaxed text-white/55">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold/80" />
            <span>{s.footerDisclaimer}</span>
          </p>
          <div className="mt-4 flex flex-col gap-2 text-[0.75rem] text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <span>© {year} {s.siteName}. All rights reserved.</span>
            <span>18+ only · For information & educational purposes only</span>
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
