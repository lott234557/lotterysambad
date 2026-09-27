import { Clock3, Hash, CheckCircle2, ImageIcon } from "lucide-react";
import type { LotteryDraw } from "@/lib/db/schema";
import { getDict, longDateL, type Locale } from "@/lib/i18n";
import { otherText, tierLabel } from "@/lib/i18n/others";
import { renderMarkdown } from "@/lib/markdown";
import { FirstPrize } from "../FirstPrize";
import { ResultImage } from "../ResultImage";

const district = (n: string) => /\(([^)]+)\)\s*$/.exec(n)?.[1] ?? null;
const ticket = (n: string) => n.replace(/\s*\([^)]*\)\s*$/, "");
const isFull = (n: string) => /[A-Z]/.test(n);

/** One complete draw of an "other" lottery: first prize ticket, every prize tier as chips, result image. */
export function OtherDrawView({ draw, lang, heading = true }: { draw: LotteryDraw; lang: Locale; heading?: boolean }) {
  const t = getDict(lang);
  const o = otherText(lang);
  const tiers = draw.tiers ?? [];
  const first = tiers.find((x) => x.label === "1st Prize");
  const rest = tiers.filter((x) => x !== first);
  const firstNo = first?.numbers[0] ?? draw.firstPrize;
  const firstDistrict = firstNo ? district(firstNo) : null;
  const drawLabel = draw.drawName;

  return (
    <section id={`draw-${draw.drawKey}`} className="scroll-mt-24 space-y-4">
      {heading && (
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="section-title">{draw.drawName}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-muted">
              <span>{longDateL(t, draw.drawDate)}</span>
              {draw.drawTime && (
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="size-3.5" /> {draw.drawTime}
                </span>
              )}
              {draw.drawCode && (
                <span className="inline-flex items-center gap-1">
                  <Hash className="size-3.5" /> {draw.drawCode}
                </span>
              )}
              {draw.isComplete && (
                <span className="inline-flex items-center gap-1 text-ok">
                  <CheckCircle2 className="size-3.5" /> {t.card.declared}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {firstNo && (
        <div className="card p-4 sm:p-6">
          <div className="mx-auto max-w-xl">
            <FirstPrize number={ticket(firstNo)} amount={first?.amount ?? draw.firstAmount ?? ""} size="lg" label={tierLabel(lang, "1st Prize")} awaiting={t.prize.awaiting} />
            {firstDistrict && <p className="mt-2 text-center text-xs font-bold uppercase tracking-wider text-muted">{firstDistrict}</p>}
          </div>
          {/* hidden chip so the finder also matches the first prize */}
          <span className="hidden" data-n={ticket(firstNo)} data-kind="full" data-tier={tierLabel(lang, "1st Prize")} data-amount={first?.amount ?? ""} data-draw={drawLabel} />
        </div>
      )}

      {rest.map((tier) => {
        const full = tier.numbers.some(isFull);
        const label = tierLabel(lang, tier.label);
        const grid = full
          ? "grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3"
          : tier.numbers.length > 40
            ? "grid-cols-4 min-[400px]:grid-cols-5 sm:grid-cols-8 md:grid-cols-10"
            : "grid-cols-3 min-[400px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-8";
        return (
          <section key={tier.label} className="card overflow-hidden" aria-label={label}>
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2 px-4 py-3 sm:px-5">
              <h3 className="text-[0.98rem] font-extrabold">{label}</h3>
              <div className="flex items-center gap-2 text-xs">
                {tier.amount && <span className="pill bg-gold-soft text-ink">{tier.amount}</span>}
                <span className="text-muted">{tier.numbers.length > 1 ? t.prize.numbers.replace("{n}", String(tier.numbers.length)) : t.prize.number}</span>
              </div>
            </header>
            <ul className={`grid gap-2 p-3 sm:p-4 ${grid}`}>
              {tier.numbers.map((n) => (
                <li key={n} className="chip flex-col !gap-0" data-n={ticket(n)} data-kind={isFull(n) ? "full" : "short"} data-tier={label} data-amount={tier.amount ?? ""} data-draw={drawLabel}>
                  <span>{ticket(n)}</span>
                  {district(n) && <span className="font-sans text-[0.62rem] font-semibold uppercase tracking-wide text-muted">{district(n)}</span>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {draw.imageKey && (
        <>
          {!rest.length && <p className="flex items-center gap-2 text-sm font-semibold text-muted"><ImageIcon className="size-4 text-gold-2" /> {o.ui.imageNote}</p>}
          <ResultImage result={draw} alt={`${draw.drawName} – ${longDateL(t, draw.drawDate)}`} lang={lang} priority={!rest.length} />
        </>
      )}

      {draw.notes && <div className="prose-x card p-5" dangerouslySetInnerHTML={{ __html: renderMarkdown(draw.notes) }} />}
    </section>
  );
}
