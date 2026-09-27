"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Trophy, Globe2, FileText, Files, Megaphone, Search, Settings, ScrollText, Image as ImageIcon, Menu, X, ExternalLink, LogOut } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logoutAction } from "@/app/admin/actions";

const ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/results", label: "Results", Icon: Trophy },
  { href: "/admin/lotteries", label: "Other lotteries", Icon: Globe2 },
  { href: "/admin/articles", label: "Articles", Icon: FileText },
  { href: "/admin/pages", label: "Pages", Icon: Files },
  { href: "/admin/media", label: "Media", Icon: ImageIcon },
  { href: "/admin/ads", label: "Ads & ads.txt", Icon: Megaphone },
  { href: "/admin/seo", label: "SEO & Analytics", Icon: Search },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
  { href: "/admin/logs", label: "Scraper Logs", Icon: ScrollText },
];

export function AdminNav({ user }: { user: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (h: string) => (h === "/admin" ? path === "/admin" : path.startsWith(h));
  const nav = (
    <nav className="space-y-1">
      {ITEMS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            active(href) ? "bg-gold text-[#1c1400]" : "text-white/75 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icon className="size-[18px]" /> {label}
        </Link>
      ))}
    </nav>
  );
  const footer = (
    <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
      <a href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-white/75 hover:bg-white/10 hover:text-white">
        <ExternalLink className="size-4" /> View website
      </a>
      <form action={logoutAction}>
        <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-white/75 hover:bg-white/10 hover:text-white">
          <LogOut className="size-4" /> Logout <span className="ml-auto text-xs text-white/40">{user}</span>
        </button>
      </form>
    </div>
  );
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-6 bg-navy p-4 lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-2 pt-1 text-white">
          <LogoMark className="size-9" />
          <span className="leading-tight">
            <b className="block">Sambad Plus</b>
            <span className="text-xs text-white/50">Admin dashboard</span>
          </span>
        </Link>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        {footer}
      </aside>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-extrabold">
          <LogoMark className="size-8" /> Admin
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl border border-line" aria-label="Menu">
            <Menu className="size-5" />
          </button>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col gap-6 bg-navy p-4">
            <button onClick={() => setOpen(false)} className="ml-auto grid size-9 place-items-center rounded-lg text-white" aria-label="Close">
              <X className="size-5" />
            </button>
            <div className="flex-1 overflow-y-auto">{nav}</div>
            {footer}
          </div>
        </div>
      )}
    </>
  );
}
