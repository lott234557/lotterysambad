import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { scrapeLogs } from "@/lib/db/schema";
import { formatIST } from "@/lib/time";
import { PageHeader, Badge } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/forms";
import { clearLogsAction } from "@/app/admin/actions";

export default async function Logs({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const rows = await db.select().from(scrapeLogs).where(status ? eq(scrapeLogs.status, status) : undefined).orderBy(desc(scrapeLogs.runAt)).limit(300);
  return (
    <>
      <PageHeader
        title="Scraper logs"
        desc="Latest 300 runs. “waiting” = the source has not published yet (normal right after draw time)."
        actions={
          <form action={clearLogsAction}>
            <ConfirmButton message="Delete all logs?" className="btn btn-ghost !py-2 text-sm">Clear logs</ConfirmButton>
          </form>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {["", "success", "partial", "waiting", "error"].map((s) => (
          <Link key={s} href={s ? `/admin/logs?status=${s}` : "/admin/logs"} className={`rounded-full border px-3 py-1 font-semibold ${status === s || (!status && !s) ? "border-gold bg-gold-soft" : "border-line"}`}>
            {s || "all"}
          </Link>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="table-x min-w-[760px] text-xs">
          <thead><tr><th>Time (IST)</th><th>Draw</th><th>Status</th><th>ms</th><th>Details</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-muted">No logs.</td></tr>}
            {rows.map((l) => (
              <tr key={l.id} className="align-top">
                <td className="whitespace-nowrap">{formatIST(l.runAt)}</td>
                <td className="whitespace-nowrap font-semibold">{l.drawDate} {l.slot}</td>
                <td><Badge tone={l.status === "success" ? "ok" : l.status === "partial" ? "warn" : l.status === "error" ? "live" : "muted"}>{l.status}</Badge></td>
                <td>{l.durationMs}</td>
                <td className="max-w-xl break-words text-muted">{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
