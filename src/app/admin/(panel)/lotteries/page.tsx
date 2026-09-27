import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { Plus, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { lotteryDraws } from "@/lib/db/schema";
import { getSettingsFresh } from "@/lib/settings";
import { OTHER, OTHER_IDS, clockLabel, isOtherId, type OtherId } from "@/lib/others/config";
import { mediaUrl } from "@/lib/storage";
import { formatIST, isoToDMY, shortDate, todayIST } from "@/lib/time";
import { ensureSetup } from "@/lib/setup";
import { PageHeader, Panel, Badge, Toggle, Field, Textarea } from "@/components/admin/ui";
import { ActionForm } from "@/components/admin/forms";
import { OtherFetch } from "@/components/admin/OtherFetch";
import { saveOtherSettingsAction } from "@/app/admin/others-actions";

const NAMES: Record<OtherId, string> = { kerala: "Kerala", punjab: "Punjab", maharashtra: "Maharashtra", westbengal: "West Bengal" };
const PER = 40;

export default async function LotteriesAdmin({ searchParams }: { searchParams: Promise<{ l?: string; page?: string }> }) {
  await ensureSetup().catch(() => {});
  const sp = await searchParams;
  const id: OtherId = isOtherId(sp.l) ? sp.l : "kerala";
  const page = Math.max(1, Number(sp.page) || 1);
  const today = todayIST();
  const def = OTHER[id];
  const where = eq(lotteryDraws.lottery, id);
  const [rows, total, todayRows, s, counts] = await Promise.all([
    db.select().from(lotteryDraws).where(where).orderBy(desc(lotteryDraws.drawDate), desc(lotteryDraws.updatedAt)).limit(PER).offset((page - 1) * PER),
    db.$count(lotteryDraws, where),
    db.select().from(lotteryDraws).where(and(where, eq(lotteryDraws.drawDate, today))),
    getSettingsFresh(),
    db.select({ lottery: lotteryDraws.lottery, n: sql<number>`count(*)::int` }).from(lotteryDraws).groupBy(lotteryDraws.lottery),
  ]);
  const cfg = s.others[id];
  const pages = Math.max(1, Math.ceil(total / PER));
  const count = (x: OtherId) => counts.find((c) => c.lottery === x)?.n ?? 0;

  return (
    <>
      <PageHeader
        title="Other lotteries"
        desc="Kerala, Punjab, Maharashtra and West Bengal result pages (not in the menu – linked from the comparison pages). Results are fetched automatically in their draw windows."
        actions={
          <>
            <Link href={`/admin/lotteries/new?l=${id}`} className="btn btn-gold !py-2 text-sm">
              <Plus className="size-4" /> Add result
            </Link>
            <a href={def.path} target="_blank" className="btn btn-ghost !py-2 text-sm">
              <ExternalLink className="size-4" /> View page
            </a>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {OTHER_IDS.map((x) => (
          <Link key={x} href={`/admin/lotteries?l=${x}`} className={`rounded-full border px-4 py-2 text-sm font-bold ${x === id ? "border-gold bg-gold text-[#1c1400]" : "border-line bg-surface hover:border-brand-2"}`}>
            {NAMES[x]} <span className="ml-1 text-xs opacity-70">{count(x)}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title={`Today · ${NAMES[id]}`}
          desc={
            def.window ? (
              <>
                Auto-fetch window: {clockLabel(def.window.from)} – {clockLabel(def.window.to)} IST (every {def.window.fastGap}s until {clockLabel(def.window.fastTo)}, then every {Math.round(def.window.slowGap / 60)} min).
                {!s.scraperEnabled && <b className="text-live"> Auto-fetch is switched off on the dashboard.</b>}
              </>
            ) : (
              <>The West Bengal page shows the Dear 1 PM / 6 PM / 8 PM results automatically. Official West Bengal draws can be added here manually (or via an extra source below).</>
            )
          }
        >
          {todayRows.length ? (
            <ul className="space-y-2 text-sm">
              {todayRows.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-3 py-2">
                  <span>
                    <b>{r.drawName}</b> <span className="text-xs text-muted">{r.drawTime}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="num font-extrabold">{r.firstPrize ?? "—"}</span>
                    {r.isComplete ? <Badge tone="ok">Complete</Badge> : <Badge tone="warn">Partial</Badge>}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No result for today yet.</p>
          )}
          <div className="mt-4">
            <OtherFetch lottery={id} today={today} />
          </div>
        </Panel>

        <Panel title="Auto-fetch & sources">
          <ActionForm action={saveOtherSettingsAction} submitLabel="Save">
            <input type="hidden" name="lottery" value={id} />
            <Toggle name="enabled" defaultChecked={cfg.enabled} label={`Auto-fetch ${NAMES[id]} results`} hint="Uses the built-in sources in the draw window. Turn off to add results only manually." />
            <Field label="Extra source URLs (optional, max 5)" hint="Any page that shows the result as text. Placeholders: {dd} {mm} {yyyy} {yy} {date}=25-09-2026 {iso}=2026-09-25">
              <Textarea name="extraSources" defaultValue={cfg.extraSources} className="min-h-20 text-xs" placeholder="https://example.com/kerala-lottery-result-{date}.html" />
            </Field>
          </ActionForm>
        </Panel>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="table-x min-w-[860px] text-sm">
          <thead>
            <tr>
              <th>Image</th>
              <th>Date</th>
              <th>Draw</th>
              <th>1st Prize</th>
              <th>Tiers</th>
              <th>Status</th>
              <th>Source</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-muted">
                  No {NAMES[id]} results yet. Use “Fetch date” above or add one manually.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.imageKey ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(r.imageKey)!} alt="" className="h-12 w-10 rounded-md border border-line object-cover object-top" loading="lazy" />
                  ) : (
                    <div className="grid h-12 w-10 place-items-center rounded-md border border-dashed border-line text-[10px] text-muted">none</div>
                  )}
                </td>
                <td className="whitespace-nowrap">
                  <b>{shortDate(r.drawDate)}</b>
                  <div className="text-xs text-muted">upd. {formatIST(r.updatedAt).split(", ")[1]}</div>
                </td>
                <td>
                  {r.drawName}
                  <div className="text-xs text-muted">
                    {r.drawTime} {r.kind !== "daily" && `· ${r.kind}`}
                  </div>
                </td>
                <td className="num font-extrabold">{r.firstPrize ?? "—"}</td>
                <td className="text-xs text-muted">
                  {r.tiers.length} / {r.tiers.reduce((a, t) => a + t.numbers.length, 0)} nos.
                </td>
                <td>
                  {r.status === "draft" ? <Badge>Draft</Badge> : r.isComplete ? <Badge tone="ok">Complete</Badge> : <Badge tone="warn">Partial</Badge>}
                </td>
                <td className="text-xs">{r.source === "manual" ? <Badge tone="blue">locked</Badge> : r.source}</td>
                <td className="whitespace-nowrap text-right">
                  <Link href={`/admin/lotteries/${r.id}`} className="font-bold text-brand-2 hover:underline">
                    Edit
                  </Link>
                  <a href={`${def.path}/${isoToDMY(r.drawDate)}`} target="_blank" className="ml-3 text-muted hover:text-ink">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          {page > 1 && (
            <Link href={`/admin/lotteries?l=${id}&page=${page - 1}`} className="btn btn-ghost !py-2">
              ← Newer
            </Link>
          )}
          <span className="px-2 py-2 text-muted">
            Page {page} / {pages}
          </span>
          {page < pages && (
            <Link href={`/admin/lotteries?l=${id}&page=${page + 1}`} className="btn btn-ghost !py-2">
              Older →
            </Link>
          )}
        </div>
      )}
    </>
  );
}
