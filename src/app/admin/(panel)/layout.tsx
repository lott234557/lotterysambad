import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin | Lottery Sambad Plus", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-dvh bg-bg">
      <AdminNav user={user} />
      <div className="lg:pl-64">
        <div className="hidden h-14 items-center justify-end gap-2 border-b border-line bg-surface px-6 lg:flex">
          <span className="text-xs text-muted">Signed in as <b className="text-ink">{user}</b></span>
          <ThemeToggle />
        </div>
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
