import { TIERS, tierNumbers, type TierKey } from "@/lib/draws";
import type { Result } from "@/lib/db/schema";
import { FirstPrize } from "./FirstPrize";

const GRID: Record<TierKey, string> = {
  first: "",
  cons: "grid-cols-2 sm:grid-cols-5",
  second: "grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-5",
  third: "grid-cols-3 min-[400px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-10",
  fourth: "grid-cols-3 min-[400px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-10",
  fifth: "grid-cols-4 min-[400px]:grid-cols-5 sm:grid-cols-8 md:grid-cols-10",
};

export function PrizeTiers({
  result,
  prizes,
  middle,
  id = "prizes",
}: {
  result: Result;
  prizes: Record<TierKey, string>;
  middle?: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="space-y-4">
      <div className="card p-4 sm:p-6">
        <div className="mx-auto max-w-xl">
          <FirstPrize number={result.firstPrize} amount={prizes.first} size="lg" />
        </div>
      </div>
      {TIERS.filter((t) => t.key !== "first").map((t) => {
        const nums = tierNumbers(result, t.key);
        return (
          <div key={t.key}>
            <section className="card overflow-hidden" aria-label={t.label}>
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2 px-4 py-3 sm:px-5">
                <h3 className="flex items-center gap-2 text-[0.98rem] font-extrabold">
                  <span className="grid h-7 min-w-7 place-items-center rounded-lg bg-navy px-1.5 text-[0.7rem] font-extrabold text-gold">{t.short.replace(".", "")}</span>
                  {t.label}
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="pill bg-gold-soft text-ink">{prizes[t.key]}</span>
                  <span className="text-muted">{nums.length ? `${nums.length} number${nums.length > 1 ? "s" : ""}` : "updating"}</span>
                </div>
              </header>
              <div className="p-3 sm:p-4">
                {nums.length ? (
                  <ul className={`grid gap-2 ${GRID[t.key]}`}>
                    {nums.map((n) => (
                      <li key={n} className="chip" data-n={n} data-tier={t.key}>
                        {n}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-3 text-center text-sm text-muted">Numbers will be updated shortly.</p>
                )}
              </div>
            </section>
            {t.key === "third" && middle}
          </div>
        );
      })}
    </div>
  );
}
