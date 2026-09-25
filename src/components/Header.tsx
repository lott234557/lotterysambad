import Link from "next/link";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { TopBar } from "./TopBar";
import { Ticket } from "lucide-react";

export function Header({ siteName, logoUrl }: { siteName: string; logoUrl?: string }) {
  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/75">
        <div className="wrap flex h-16 items-center justify-between gap-3">
          <Logo siteName={siteName} logoUrl={logoUrl} />
          <NavLinks />
          <div className="flex items-center gap-2">
            <Link href="/check-ticket" className="btn btn-gold hidden !py-2 sm:inline-flex lg:hidden xl:inline-flex">
              <Ticket className="size-4" /> Check Ticket
            </Link>
            <ThemeToggle />
            <MobileMenu />
          </div>
        </div>
      </header>
    </>
  );
}
