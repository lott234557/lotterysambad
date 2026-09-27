import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { lotteryDraws, scrapeLogs, type DrawTier, type LotteryDraw } from "../db/schema";
import { fetchHtml, fetchImage } from "../scraper/fetch";
import { toWebp } from "../image";
import { saveMedia } from "../storage";
import { getSettingsFresh } from "../settings";
import { OTHER, type OtherId } from "./config";
import {
  firstPrizeOf,
  htmlToText,
  isCompleteTiers,
  mentionsDate,
  pageImages,
  pageLinks,
  pageTitle,
  parseKerala,
  parseSections,
  parseTiers,
  punjabKey,
  slugify,
  type ParsedDraw,
} from "./parse";

/* ---------------- candidates ---------------- */

type Candidate = ParsedDraw & { source: string; url: string; image?: string };
type Found = { cands: Candidate[]; notes: string[] };

const parts = (iso: string) => {
  const [yyyy, mm, dd] = iso.split("-");
  return { yyyy, mm, dd, yy: yyyy.slice(2), dmy: `${dd}-${mm}-${yyyy}` };
};

const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};

async function page(url: string) {
  const r = await fetchHtml(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text;
}

const titleCase = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

/** Kerala: Blogger-style result sites – find the post for the date on the home page (or the month archive). */
async function keralaBlog(siteHost: string, dateISO: string, out: Found) {
  const { yyyy, mm, dmy } = parts(dateISO);
  const indexes = [`https://www.${siteHost}/`, `https://www.${siteHost}/${yyyy}/${mm}/`];
  const seen = new Set<string>();
  for (const idx of indexes) {
    let html: string;
    try {
      html = await page(idx);
    } catch (e) {
      out.notes.push(`[${siteHost}] index ${(e as Error).message}`);
      continue;
    }
    const links = pageLinks(html, idx).filter((l) => /kerala-lottery-results?/i.test(l.href) && l.href.includes(dmy) && !seen.has(l.href));
    for (const l of links.slice(0, 2)) {
      seen.add(l.href);
      try {
        const post = await page(l.href);
        const text = htmlToText(post);
        if (!mentionsDate(text, dateISO)) {
          out.notes.push(`[${siteHost}] post without date`);
          continue;
        }
        const d = parseKerala(text, pageTitle(post));
        if (d) out.cands.push({ ...d, source: siteHost, url: l.href });
        else out.notes.push(`[${siteHost}] no numbers yet`);
      } catch (e) {
        out.notes.push(`[${siteHost}] post ${(e as Error).message}`);
      }
    }
    if (seen.size) break;
  }
  if (!seen.size) out.notes.push(`[${siteHost}] no post for ${dmy} yet`);
}

/** goodreturns.in date pages (Maharashtra weekly/monthly/bumper, Punjab weekly/monthly/bumper). */
async function goodreturns(state: "maharashtra" | "punjab", kinds: string[], dateISO: string, out: Found) {
  for (const kind of kinds) {
    const url = `https://www.goodreturns.in/${state}-${kind}-lottery-results.html?dt=${dateISO}`;
    try {
      const text = htmlToText(await page(url));
      if (!mentionsDate(text, dateISO)) continue;
      const draws = parseSections(text, state, dateISO);
      for (const d of draws) out.cands.push({ ...d, key: state === "punjab" ? normPunjab(d.key) : d.key, source: "goodreturns.in", url });
      if (!draws.length) out.notes.push(`[goodreturns ${kind}] nothing for this date`);
    } catch (e) {
      out.notes.push(`[goodreturns ${kind}] ${(e as Error).message}`);
    }
  }
}

const normPunjab = (key: string) => (key.endsWith("-bumper") ? key.replace(/^dear-/, "") : key);

/** Punjab: WordPress sites that post the official result sheet image per draw (date in the URL). */
async function punjabPosts(siteHost: string, dateISO: string, linkMatch: (href: string) => boolean, out: Found) {
  const idx = `https://www.${siteHost}/`;
  let html: string;
  try {
    html = await page(idx);
  } catch (e) {
    out.notes.push(`[${siteHost}] index ${(e as Error).message}`);
    return;
  }
  const links = Array.from(new Map(pageLinks(html, idx).filter((l) => linkMatch(l.href)).map((l) => [l.href, l])).values()).slice(0, 6);
  if (!links.length) out.notes.push(`[${siteHost}] no posts for this date yet`);
  for (const l of links) {
    try {
      const post = await page(l.href);
      const slug = new URL(l.href).pathname.replace(/\/+$/, "").split("/").pop() ?? "";
      const title = pageTitle(post) || l.text || slug.replace(/-/g, " ");
      const key = normPunjab(punjabKey(title.includes("Punjab") ? title : slug.replace(/-/g, " ")));
      if (!key) continue;
      const t = /(\d{1,2})(\d{2})\s*([ap])m/i.exec(slug) ?? /(\d{1,2})[:.](\d{2})\s*([ap])\.?m/i.exec(title);
      const kind = /bumper/i.test(title) ? "bumper" : /monthly/i.test(title) ? "monthly" : /quarterly/i.test(title) ? "monthly" : "weekly";
      const name = titleCase(
        title
          .replace(/lottery result.*$/i, "")
          .replace(/punjab state/i, "")
          .replace(/\s+/g, " ")
          .trim(),
      );
      const images = pageImages(post, l.href).filter((u) => /wp-content\/uploads/i.test(u));
      const tiers = parseTiers(htmlToText(post), "punjab");
      out.cands.push({
        key,
        name: `Punjab State ${name}`.replace(/\s+/g, " "),
        time: t ? `${Number(t[1])}:${t[2]} ${t[3].toUpperCase()}M` : undefined,
        kind,
        tiers,
        source: siteHost,
        url: l.href,
        image: images[0],
      });
    } catch (e) {
      out.notes.push(`[${siteHost}] post ${(e as Error).message}`);
    }
  }
}

/** Admin-configured extra sources: URL templates with {dd} {mm} {yyyy} {yy} {date} {iso}. */
async function extraSources(id: OtherId, templates: string, dateISO: string, out: Found) {
  const { yyyy, mm, dd, yy, dmy } = parts(dateISO);
  const urls = templates
    .split(/\s+/)
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//.test(u))
    .slice(0, 5)
    .map((u) => u.replace(/\{dd\}/g, dd).replace(/\{mm\}/g, mm).replace(/\{yyyy\}/g, yyyy).replace(/\{yy\}/g, yy).replace(/\{date\}/g, dmy).replace(/\{iso\}/g, dateISO));
  for (const url of urls) {
    try {
      const html = await page(url);
      const text = htmlToText(html);
      if (!mentionsDate(text, dateISO)) {
        out.notes.push(`[${host(url)}] date not on page`);
        continue;
      }
      const title = pageTitle(html);
      let draws: ParsedDraw[] = [];
      if (id === "kerala") {
        const d = parseKerala(text, title);
        if (d) draws = [d];
      } else if (id === "maharashtra" || id === "punjab") {
        draws = parseSections(text, id, dateISO);
      }
      if (!draws.length) {
        const tiers = parseTiers(text, id);
        if (tiers.length) draws = [{ key: slugify(title || id).slice(0, 40) || id, name: title || OTHER[id].state, kind: "daily", tiers }];
      }
      const image = pageImages(html, url).find((u) => u.includes(dd) || /result/i.test(u));
      for (const d of draws) out.cands.push({ ...d, source: host(url), url, image });
      if (!draws.length && image && id !== "kerala") out.cands.push({ key: slugify(title || id).slice(0, 40), name: title || OTHER[id].state, kind: "daily", tiers: [], source: host(url), url, image });
    } catch (e) {
      out.notes.push(`[${host(url)}] ${(e as Error).message}`);
    }
  }
}

async function collect(id: OtherId, dateISO: string, extra: string): Promise<Found> {
  const out: Found = { cands: [], notes: [] };
  const { dmy, dd, mm, yy } = parts(dateISO);
  const jobs: Promise<void>[] = [];
  if (id === "kerala") {
    jobs.push(keralaBlog("keralalotteries.net", dateISO, out), keralaBlog("keralalotteryresult.net", dateISO, out));
  } else if (id === "maharashtra") {
    jobs.push(goodreturns("maharashtra", ["weekly", "monthly", "bumper"], dateISO, out));
  } else if (id === "punjab") {
    jobs.push(
      goodreturns("punjab", ["weekly", "monthly", "bumper"], dateISO, out),
      punjabPosts("punjablotterynews.com", dateISO, (h) => /punjab-state/i.test(h) && h.includes(`-${dmy}`), out),
      punjabPosts("punjabstatelotteryresult.com", dateISO, (h) => /punjab-state/i.test(h) && new RegExp(`-${dd}-${mm}-(?:${yy}|20${yy})/?$`).test(h), out),
    );
  }
  if (extra.trim()) jobs.push(extraSources(id, extra, dateISO, out));
  await Promise.all(jobs);
  return out;
}

/* ---------------- merge + save ---------------- */

const score = (tiers: DrawTier[]) => tiers.reduce((a, t) => a + t.numbers.length, 0) + (tiers.some((t) => t.label === "1st Prize") ? 50 : 0);

export type OtherOutcome = {
  lottery: OtherId;
  date: string;
  status: "success" | "partial" | "waiting" | "error" | "skipped";
  message: string;
  changed: boolean;
  draws: number;
};

async function log(id: OtherId, date: string, status: string, message: string, ms: number, source?: string) {
  try {
    await db.insert(scrapeLogs).values({ drawDate: date, slot: id, status, source: source?.slice(0, 120), message: message.slice(0, 4000), durationMs: ms });
  } catch {}
}

async function saveImage(id: OtherId, dateISO: string, key: string, url: string) {
  const img = await fetchImage(url);
  if (!img) return null;
  const webp = await toWebp(img.data, 1600, 82);
  if (webp.srcWidth < 400) return null;
  const mediaKey = `others/${id}-lottery-result-${parts(dateISO).dmy}-${key}-${webp.hash}.webp`.slice(0, 190);
  await saveMedia({ key: mediaKey, data: webp.data, contentType: "image/webp", width: webp.width, height: webp.height });
  return { key: mediaKey, width: webp.width, height: webp.height, source: url };
}

/** Fetch every draw of `id` on `dateISO` from all sources and save/merge them. */
export async function scrapeOther(id: OtherId, dateISO: string, opts: { force?: boolean; trigger?: string } = {}): Promise<OtherOutcome> {
  const t0 = Date.now();
  const tag = opts.trigger ? `[${opts.trigger}] ` : "";
  const settings = await getSettingsFresh();
  const cfg = settings.others[id];
  if (!OTHER[id].window && !cfg.extraSources.trim()) {
    return { lottery: id, date: dateISO, status: "skipped", message: "no scraper – shows the Dear draws / manual results", changed: false, draws: 0 };
  }

  let found: Found;
  try {
    found = await collect(id, dateISO, cfg.extraSources);
  } catch (e) {
    await log(id, dateISO, "error", `${tag}${(e as Error).message}`, Date.now() - t0);
    return { lottery: id, date: dateISO, status: "error", message: (e as Error).message, changed: false, draws: 0 };
  }

  // group candidates by draw key
  const groups = new Map<string, Candidate[]>();
  for (const c of found.cands) groups.set(c.key, [...(groups.get(c.key) ?? []), c]);
  if (!groups.size) {
    const status = found.notes.some((n) => /HTTP|fetch|abort|timeout|ENOTFOUND/i.test(n)) && !found.notes.some((n) => /no post|nothing|no numbers|no posts/i.test(n)) ? "error" : "waiting";
    await log(id, dateISO, status, `${tag}Result not published yet. ${found.notes.join(" | ")}`, Date.now() - t0);
    return { lottery: id, date: dateISO, status, message: "not published yet", changed: false, draws: 0 };
  }

  const existingRows = await db.select().from(lotteryDraws).where(and(eq(lotteryDraws.lottery, id), eq(lotteryDraws.drawDate, dateISO)));
  const existing = new Map(existingRows.map((r) => [r.drawKey, r]));
  let changedAny = false;
  let complete = 0;
  const lines: string[] = [];

  for (const [key, cands] of groups) {
    const ex: LotteryDraw | undefined = existing.get(key);
    if (ex?.source === "manual" && !opts.force) {
      lines.push(`${key}: locked`);
      continue;
    }
    const best = [...cands].sort((a, b) => score(b.tiers) - score(a.tiers))[0];
    const firsts = new Set(cands.map((c) => firstPrizeOf(c.tiers)).filter(Boolean));
    if (firsts.size > 1) found.notes.push(`warning ${key}: sources disagree on 1st prize (${[...firsts].join(", ")})`);
    const keepOld = ex && score(ex.tiers) > score(best.tiers);
    const tiers = keepOld ? ex!.tiers : best.tiers;

    let image: Awaited<ReturnType<typeof saveImage>> = null;
    const imgUrl = cands.map((c) => c.image).find(Boolean);
    if (imgUrl && (!ex?.imageKey || opts.force)) {
      try {
        image = await saveImage(id, dateISO, key, imgUrl);
      } catch (e) {
        found.notes.push(`image ${(e as Error).message}`);
      }
    }
    const imageKey = image?.key ?? ex?.imageKey ?? null;
    const first = firstPrizeOf(tiers);
    const isComplete = isCompleteTiers(id, tiers, !!imageKey);
    const pick = <K extends keyof Candidate>(k: K) => cands.map((c) => c[k]).find((v) => v) as Candidate[K] | undefined;
    const row = {
      lottery: id,
      drawDate: dateISO,
      drawKey: key,
      drawName: ex?.drawName && ex.drawName.length > (pick("name")?.length ?? 0) ? ex.drawName : (pick("name") ?? ex?.drawName ?? OTHER[id].state),
      drawCode: pick("code") ?? ex?.drawCode ?? null,
      drawTime: pick("time") ?? ex?.drawTime ?? null,
      kind: pick("kind") ?? ex?.kind ?? "daily",
      firstPrize: first ?? ex?.firstPrize ?? null,
      firstAmount: tiers[0]?.amount ?? ex?.firstAmount ?? null,
      tiers,
      imageKey,
      imageWidth: image?.width ?? ex?.imageWidth ?? null,
      imageHeight: image?.height ?? ex?.imageHeight ?? null,
      imageSourceUrl: image?.source ?? ex?.imageSourceUrl ?? null,
      sourceUrl: best.url,
      source: best.source,
      status: ex?.status ?? "published",
      isComplete,
      publishedAt: ex?.publishedAt ?? new Date(),
      updatedAt: new Date(),
    };
    const changed = !ex || ex.firstPrize !== row.firstPrize || ex.imageKey !== row.imageKey || score(ex.tiers) !== score(row.tiers) || ex.isComplete !== isComplete;
    if (changed) {
      await db
        .insert(lotteryDraws)
        .values(row)
        .onConflictDoUpdate({ target: [lotteryDraws.lottery, lotteryDraws.drawDate, lotteryDraws.drawKey], set: row });
      changedAny = true;
    }
    if (isComplete) complete++;
    lines.push(`${row.drawName}: 1st ${row.firstPrize ?? "-"}, ${tiers.length} tiers${imageKey ? ", image" : ""}${changed ? " (saved)" : ""}`);
  }

  const status = complete === groups.size ? "success" : "partial";
  await log(id, dateISO, status, `${tag}${lines.join(" · ")}. ${found.notes.join(" | ")}`, Date.now() - t0, [...new Set(found.cands.map((c) => c.source))].join(", "));
  return { lottery: id, date: dateISO, status, message: lines.join(" · "), changed: changedAny, draws: groups.size };
}
