import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { results } from "@/lib/db/schema";
import { SLOTS, SLOT_META, isSlot, type Slot } from "@/lib/draws";
import { mediaUrl } from "@/lib/storage";
import { formatIST, isoToDMY, shortDate } from "@/lib/time";
import { PageHeader, Badge } from "@/components/admin/ui";
import { ScrapeButton } from "@/components/admin/ScrapeButton";
import { Plus } from "lucide-react";

const PER = 30;

export default async function ResultsAdmin({ searchParams }: { searchParams: Promise<{ page?: string; slot?: string; month?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const slot = sp.slot && isSlot(sp.slot) ? sp.slot : null;
  const month = sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : null;
  const where = and(slot ? eq(results.slot, slot) : undefined, month ? sql`to_char(${results.drawDate}, 'YYYY-MM') = ${month}` : undefined);
  const [rows, total] = await Promise.all([
    db.select().from(results).where(where).orderBy(desc(results.drawDate), desc(results.slot)).limit(PER).offset((page - 1) * PER),
    db.$count(results, where),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER));
  const q = (p: number) => `/admin/results?${new URLSearchParams({ ...(slot ? { slot } : {}), ...(month ? { month } : {}), page: String(p) })}`;
  return (
    <>
      <PageHeader
        title="Results"
        desc={`${total} results stored. Scraped results are filled automatically; you can edit or add any draw manually.`}
        actions={<Link href="/admin/results/new" className="btn btn-gold !py-2 text-sm"><Plus className="size-4" /> Add result</Link>}
      />
      <form className="mb-4 flex flex-wrap items-end gap-2">
        <select name="slot" defaultValue={slot ?? ""} className="rounded-xl border border-line bg-surface px-3 py-2 text-sm">
          <option value="">All draws</option>
          {SLOTS.map((s) => <option key={s} value={s}>{SLOT_META[s].label}</option>)}
        </select>
        <input type="month" name="month" defaultValue={month ?? ""} className="rounded-xl border border-line bg-surface px-3 py-2 text-sm" />
        <button className="btn btn-ghost !py-2 text-sm">Filter</button>
        {(slot || month) && <Link href="/admin/results" className="px-2 text-sm text-brand-2">Clear</Link>}
      </form>
      <div className="card overflow-x-auto">
        <table className="table-x min-w-[860px] text-sm">
          <thead>
            <tr><th>Image</th><th>Date</th><th>Draw</th><th>1st Prize</th><th>Tiers</th><th>Status</th><th>Source</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-muted">No results yet. Use “Import old results” on the dashboard or add one manually.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.imageKey ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(r.imageKey)!} alt="" className="h-12 w-10 rounded-md border border-line object-cover object-top" loading="lazy" />
                  ) : <div className="grid h-12 w-10 place-items-center rounded-md border border-dashed border-line text-[10px] text-muted">none</div>}
                </td>
                <td className="whitespace-nowrap"><b>{shortDate(r.drawDate)}</b><div className="text-xs text-muted">upd. {formatIST(r.updatedAt).split(", ")[1]}</div></td>
                <td className="whitespace-nowrap">{SLOT_META[r.slot as Slot]?.label}<div className="text-xs text-muted">{r.drawName}</div></td>
                <td className="num font-extrabold">{r.firstPrize ?? "—"}</td>
                <td className="text-xs text-muted">{r.secondPrize.length}/{r.thirdPrize.length}/{r.fourthPrize.length}/{r.fifthPrize.length}</td>
                <td className="space-x-1 whitespace-nowrap">
                  {r.isComplete ? <Badge tone="ok">complete</Badge> : <Badge tone="warn">partial</Badge>}
                  {r.status === "draft" && <Badge>draft</Badge>}
                </td>
                <td className="text-xs">{r.source === "manual" ? <Badge tone="blue">locked</Badge> : r.source}</td>
                <td>
                  <div className="flex items-start justify-end gap-1.5">
                    <Link href={`/admin/results/${r.id}`} className="btn btn-ghost !px-2.5 !py-1.5 text-xs">Edit</Link>
                    <a href={`/result/${isoToDMY(r.drawDate)}/${r.slot}`} target="_blank" className="btn btn-ghost !px-2.5 !py-1.5 text-xs">View</a>
                    <ScrapeButton date={r.drawDate} slot={r.slot} label="Re-fetch" small />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={q(page - 1)} className="btn btn-ghost !py-2">← Newer</Link> : <span />}
          <span className="text-muted">Page {page} of {pages}</span>
          {page < pages ? <Link href={q(page + 1)} className="btn btn-ghost !py-2">Older →</Link> : <span />}
        </div>
      )}
    </>
  );
}
