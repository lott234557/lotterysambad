/** Fingerprint of a lottery's draws for one date – the live watcher refreshes the page when it changes. */
export type FpDraw = { drawKey: string; firstPrize: string | null; imageKey: string | null; isComplete: boolean; tiers: { numbers: string[] }[] };

export const drawsFingerprint = (draws: FpDraw[]) =>
  draws
    .map((d) => `${d.drawKey}:${d.firstPrize ?? ""}|${d.imageKey ? 1 : 0}|${d.tiers.reduce((a, t) => a + t.numbers.length, 0)}|${d.isComplete ? 1 : 0}`)
    .sort()
    .join(",");
