import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ensureSetup } from "@/lib/setup";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin | Lottery Sambad Plus", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  let setupError: string | null = null;
  try {
    await ensureSetup();
  } catch (e) {
    setupError = (e as Error).message;
  }
  return (
    <div className="min-h-dvh bg-bg">
      <AdminNav user={user} />
      <div className="lg:pl-64">
        <div className="hidden h-14 items-center justify-end gap-2 border-b border-line bg-surface px-6 lg:flex">
          <span className="text-xs text-muted">Signed in as <b className="text-ink">{user}</b></span>
          <ThemeToggle />
        </div>
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          {setupError ? (
            <div className="card border-live/40 p-6">
              <h1 className="text-lg font-extrabold text-live">Database problem</h1>
              <p className="mt-2 text-sm">The site cannot reach or prepare its database:</p>
              <pre className="num mt-3 whitespace-pre-wrap rounded-xl bg-surface-2 p-3 text-xs">{setupError}</pre>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
                <li>Vercel → Project → Settings → Environment Variables: <b>DATABASE_URL</b> must be set (Neon pooled connection string) for Production.</li>
                <li>After adding or changing it, open Deployments → ⋯ → <b>Redeploy</b>.</li>
              </ul>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
