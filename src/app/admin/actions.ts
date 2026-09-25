"use server";

import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { results, posts, pages, scrapeLogs, media } from "@/lib/db/schema";
import { checkCredentials, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { scrapeDraw, isCompleteResult, type ScrapeOutcome } from "@/lib/scraper";
import { revalidateSite } from "@/lib/revalidate";
import { SLOTS, isSlot, normalizeTicket, SLOT_META, drawNameFor, type Slot } from "@/lib/draws";
import { isValidISO, isoToDMY } from "@/lib/time";
import { toWebp } from "@/lib/image";
import { saveMedia, deleteMedia } from "@/lib/storage";
import { saveSettings, getSettingsFresh, AD_SLOTS, type SiteSettings, type AdSlotKey } from "@/lib/settings";
import { fetchImage } from "@/lib/scraper/fetch";

export type ActionState = { ok?: boolean; error?: string; message?: string; url?: string };

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";

/* ---------------- auth ---------------- */

export async function loginAction(_: ActionState, f: FormData): Promise<ActionState> {
  const u = str(f, "username");
  const p = String(f.get("password") ?? "");
  await new Promise((r) => setTimeout(r, 400)); // slow down brute force
  if (!checkCredentials(u, p)) return { error: "Invalid username or password." };
  await createSession(u);
  // Prepare the database (tables + default content) before the dashboard renders.
  try {
    const { ensureSetup } = await import("@/lib/setup");
    await ensureSetup();
  } catch (e) {
    console.error("[setup]", (e as Error).message);
  }
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------------- maintenance ---------------- */

/** Make sure tables + default content exist, then rebuild every public page on next visit. */
export async function refreshSiteAction(): Promise<ActionState> {
  await requireAdmin();
  try {
    const { ensureSetup } = await import("@/lib/setup");
    const r = await ensureSetup(true);
    revalidateSite();
    return { ok: true, message: `Website refreshed${r.inserted ? ` (${r.inserted} default items added)` : ""}.` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/* ---------------- scraping ---------------- */

export async function scrapeNowAction(date: string, slot: string): Promise<ScrapeOutcome | { error: string }> {
  await requireAdmin();
  if (!isValidISO(date) || !isSlot(slot)) return { error: "Bad date or slot" };
  const out = await scrapeDraw(date, slot, { force: true });
  revalidateSite();
  return out;
}

/** Fill missing draws of one date (used by the backfill tool, one date per call). */
export async function backfillDateAction(date: string): Promise<{ date: string; outcomes: ScrapeOutcome[] }> {
  await requireAdmin();
  if (!isValidISO(date)) return { date, outcomes: [] };
  const outcomes: ScrapeOutcome[] = [];
  for (const slot of SLOTS) {
    try {
      outcomes.push(await scrapeDraw(date, slot));
    } catch (e) {
      outcomes.push({ date, slot, status: "error", message: (e as Error).message, changed: false });
    }
  }
  if (outcomes.some((o) => o.changed)) revalidateSite();
  return { date, outcomes };
}

export async function clearLogsAction() {
  await requireAdmin();
  await db.delete(scrapeLogs);
  redirect("/admin/logs");
}

/* ---------------- results ---------------- */

const parseList = (s: string, len: number) =>
  Array.from(new Set((s.match(new RegExp(`(?<!\\d)\\d{${len}}(?!\\d)`, "g")) ?? []).map((x) => x.trim())));

async function imageFromForm(f: FormData, keyBase: string): Promise<{ key: string; width: number; height: number; source: string | null } | null> {
  const file = f.get("image") as File | null;
  const url = str(f, "imageUrl");
  let buf: Buffer | null = null;
  let source: string | null = null;
  if (file && typeof file === "object" && file.size > 0) {
    if (file.size > 8 * 1024 * 1024) throw new Error("Image too large (max 8 MB)");
    buf = Buffer.from(await file.arrayBuffer());
  } else if (url) {
    const img = await fetchImage(url);
    if (!img) throw new Error("Could not download an image from that URL");
    buf = img.data;
    source = url;
  }
  if (!buf) return null;
  const webp = await toWebp(buf);
  const key = `${keyBase}-${webp.hash}.webp`;
  await saveMedia({ key, data: webp.data, contentType: "image/webp", width: webp.width, height: webp.height });
  return { key, width: webp.width, height: webp.height, source };
}

export async function saveResultAction(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = Number(str(f, "id")) || null;
    const drawDate = str(f, "drawDate");
    const slot = str(f, "slot");
    if (!isValidISO(drawDate) || !isSlot(slot)) return { error: "Please choose a valid date and draw time." };

    const dup = await db
      .select({ id: results.id })
      .from(results)
      .where(and(eq(results.drawDate, drawDate), eq(results.slot, slot), id ? ne(results.id, id) : undefined))
      .limit(1);
    if (dup.length) return { error: `A result for ${drawDate} ${slot} already exists (#${dup[0].id}). Edit that one instead.` };

    const existing = id ? (await db.select().from(results).where(eq(results.id, id)).limit(1))[0] : null;
    const firstRaw = str(f, "firstPrize");
    const firstPrize = firstRaw ? normalizeTicket(firstRaw) : null;
    if (firstRaw && !firstPrize) return { error: "1st prize must look like 84L 10051 (2 digits + letter + 5 digits)." };

    const img = await imageFromForm(f, `results/lottery-sambad-result-${slot}-${isoToDMY(drawDate)}`);
    const removeImage = bool(f, "removeImage");

    const settings = await getSettingsFresh();
    const row = {
      drawDate,
      slot,
      drawName: str(f, "drawName") || drawNameFor(slot as Slot, drawDate, settings.schedule),
      drawNo: str(f, "drawNo") || null,
      state: str(f, "state") || SLOT_META[slot as Slot].state,
      firstPrize,
      consPrize: parseList(str(f, "consPrize"), 5)[0] ?? firstPrize?.split(" ")[1] ?? null,
      secondPrize: parseList(str(f, "secondPrize"), 5),
      thirdPrize: parseList(str(f, "thirdPrize"), 4),
      fourthPrize: parseList(str(f, "fourthPrize"), 4),
      fifthPrize: parseList(str(f, "fifthPrize"), 4),
      imageKey: img?.key ?? (removeImage ? null : existing?.imageKey ?? null),
      imageWidth: img?.width ?? (removeImage ? null : existing?.imageWidth ?? null),
      imageHeight: img?.height ?? (removeImage ? null : existing?.imageHeight ?? null),
      imageSourceUrl: img ? img.source : removeImage ? null : existing?.imageSourceUrl ?? null,
      notes: str(f, "notes") || null,
      status: str(f, "status") === "draft" ? "draft" : "published",
      // "manual" = locked: the scraper will never overwrite this result
      source: bool(f, "manual") ? "manual" : existing && existing.source !== "manual" ? existing.source : "admin",
      updatedAt: new Date(),
    };
    const isComplete = isCompleteResult(row);
    let savedId = id;
    if (existing) {
      await db.update(results).set({ ...row, isComplete }).where(eq(results.id, existing.id));
      if (removeImage && existing.imageKey && existing.imageKey !== row.imageKey) await deleteMedia(existing.imageKey);
    } else {
      const ins = await db
        .insert(results)
        .values({ ...row, isComplete, publishedAt: new Date() })
        .returning({ id: results.id });
      savedId = ins[0].id;
    }
    revalidateSite();
    if (!existing) redirect(`/admin/results/${savedId}?saved=1`);
    return { ok: true, message: "Result saved." };
  } catch (e) {
    if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw e;
    return { error: (e as Error).message };
  }
}

export async function deleteResultAction(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id"));
  const r = (await db.select().from(results).where(eq(results.id, id)).limit(1))[0];
  if (r) {
    await db.delete(results).where(eq(results.id, id));
    if (r.imageKey) await deleteMedia(r.imageKey);
    revalidateSite();
  }
  redirect("/admin/results");
}

/* ---------------- posts & pages ---------------- */

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);

const RESERVED = new Set([
  "admin", "api", "media", "result", "old-results", "blog", "check-ticket", "lottery-sambad-today",
  "lottery-sambad-1pm-result", "lottery-sambad-6pm-result", "lottery-sambad-8pm-result",
  "lottery-sambad-yesterday-result", "lottery-sambad-chart", "lottery-sambad-draw-schedule",
  "sitemap.xml", "robots.txt", "ads.txt", "manifest.webmanifest",
]);

export async function savePostAction(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = Number(str(f, "id")) || null;
    const title = str(f, "title");
    if (!title) return { error: "Title is required." };
    const slug = slugify(str(f, "slug") || title);
    if (!slug) return { error: "Slug is required." };
    const clash = await db.select({ id: posts.id }).from(posts).where(and(eq(posts.slug, slug), id ? ne(posts.id, id) : undefined)).limit(1);
    if (clash.length) return { error: "Another article already uses this slug." };
    const status = str(f, "status") === "published" ? "published" : "draft";
    const existing = id ? (await db.select().from(posts).where(eq(posts.id, id)).limit(1))[0] : null;
    const values = {
      title,
      slug,
      excerpt: str(f, "excerpt") || null,
      content: String(f.get("content") ?? ""),
      coverImage: str(f, "coverImage") || null,
      metaTitle: str(f, "metaTitle") || null,
      metaDescription: str(f, "metaDescription") || null,
      status,
      publishedAt: status === "published" ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null,
      updatedAt: new Date(),
    };
    let newId = id;
    if (existing) await db.update(posts).set(values).where(eq(posts.id, existing.id));
    else newId = (await db.insert(posts).values(values).returning({ id: posts.id }))[0].id;
    revalidateSite();
    if (!existing) redirect(`/admin/articles/${newId}?saved=1`);
    return { ok: true, message: "Article saved.", url: `/blog/${slug}` };
  } catch (e) {
    if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw e;
    return { error: (e as Error).message };
  }
}

export async function deletePostAction(f: FormData) {
  await requireAdmin();
  await db.delete(posts).where(eq(posts.id, Number(f.get("id"))));
  revalidateSite();
  redirect("/admin/articles");
}

export async function savePageAction(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = Number(str(f, "id")) || null;
    const title = str(f, "title");
    if (!title) return { error: "Title is required." };
    const slug = slugify(str(f, "slug") || title);
    if (!slug || RESERVED.has(slug)) return { error: "This slug is reserved or empty – choose another one." };
    const clash = await db.select({ id: pages.id }).from(pages).where(and(eq(pages.slug, slug), id ? ne(pages.id, id) : undefined)).limit(1);
    if (clash.length) return { error: "Another page already uses this slug." };
    const values = {
      title,
      slug,
      content: String(f.get("content") ?? ""),
      metaTitle: str(f, "metaTitle") || null,
      metaDescription: str(f, "metaDescription") || null,
      status: str(f, "status") === "draft" ? "draft" : "published",
      showInFooter: bool(f, "showInFooter"),
      sortOrder: Number(str(f, "sortOrder")) || 0,
      updatedAt: new Date(),
    };
    let newId = id;
    if (id) await db.update(pages).set(values).where(eq(pages.id, id));
    else newId = (await db.insert(pages).values(values).returning({ id: pages.id }))[0].id;
    revalidateSite();
    if (!id) redirect(`/admin/pages/${newId}?saved=1`);
    return { ok: true, message: "Page saved.", url: `/${slug}` };
  } catch (e) {
    if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw e;
    return { error: (e as Error).message };
  }
}

export async function deletePageAction(f: FormData) {
  await requireAdmin();
  await db.delete(pages).where(eq(pages.id, Number(f.get("id"))));
  revalidateSite();
  redirect("/admin/pages");
}

/* ---------------- media ---------------- */

export async function uploadMediaAction(f: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const file = f.get("file") as File | null;
    if (!file || !file.size) return { error: "No file" };
    if (file.size > 8 * 1024 * 1024) return { error: "Max 8 MB" };
    const buf = Buffer.from(await file.arrayBuffer());
    const isSvg = file.type === "image/svg+xml";
    const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
    if (isSvg) {
      const key = `uploads/${base}-${Date.now().toString(36)}.svg`;
      const url = await saveMedia({ key, data: buf, contentType: "image/svg+xml" });
      return { ok: true, url };
    }
    const webp = await toWebp(buf, 1600, 82);
    const key = `uploads/${base}-${webp.hash}.webp`;
    const url = await saveMedia({ key, data: webp.data, contentType: "image/webp", width: webp.width, height: webp.height });
    return { ok: true, url };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteMediaAction(f: FormData) {
  await requireAdmin();
  const key = String(f.get("key") ?? "");
  const used = await db.select({ id: results.id }).from(results).where(eq(results.imageKey, key)).limit(1);
  if (!used.length) await deleteMedia(key);
  redirect("/admin/media");
}

/* ---------------- settings ---------------- */

export async function saveSettingsAction(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const section = str(f, "section");
  const patch: Partial<SiteSettings> = {};
  const cur = await getSettingsFresh();
  try {
    if (section === "general") {
      Object.assign(patch, {
        siteName: str(f, "siteName") || cur.siteName,
        siteTagline: str(f, "siteTagline"),
        logoUrl: str(f, "logoUrl"),
        contactEmail: str(f, "contactEmail"),
        footerAbout: str(f, "footerAbout"),
        footerDisclaimer: str(f, "footerDisclaimer") || cur.footerDisclaimer,
        social: {
          telegram: str(f, "telegram"),
          whatsapp: str(f, "whatsapp"),
          facebook: str(f, "facebook"),
          youtube: str(f, "youtube"),
          x: str(f, "x"),
        },
      });
    } else if (section === "results") {
      const schedule = { ...cur.schedule };
      for (const s of SLOTS) schedule[s] = Array.from({ length: 7 }, (_, d) => str(f, `sch_${s}_${d}`) || cur.schedule[s][d]);
      Object.assign(patch, {
        scraperEnabled: bool(f, "scraperEnabled"),
        showImageCredit: bool(f, "showImageCredit"),
        prizes: {
          first: str(f, "prize_first") || cur.prizes.first,
          cons: str(f, "prize_cons") || cur.prizes.cons,
          second: str(f, "prize_second") || cur.prizes.second,
          third: str(f, "prize_third") || cur.prizes.third,
          fourth: str(f, "prize_fourth") || cur.prizes.fourth,
          fifth: str(f, "prize_fifth") || cur.prizes.fifth,
        },
        schedule,
      });
    } else if (section === "ads") {
      const adSlots = { ...cur.adSlots };
      for (const a of AD_SLOTS) adSlots[a.key as AdSlotKey] = String(f.get(`ad_${a.key}`) ?? "");
      const client = str(f, "adsenseClient");
      if (client && !/^ca-pub-\d{10,20}$/.test(client)) return { error: "AdSense client ID must look like ca-pub-1234567890123456" };
      Object.assign(patch, { adsenseClient: client, adsTxt: String(f.get("adsTxt") ?? "").trim(), adSlots });
    } else if (section === "seo") {
      const ga = str(f, "gaId");
      if (ga && !/^G-[A-Z0-9]{4,}$/i.test(ga)) return { error: "Google Analytics ID must look like G-XXXXXXXXXX" };
      Object.assign(patch, {
        gaId: ga.toUpperCase(),
        gscVerification: str(f, "gscVerification").replace(/.*content="([^"]+)".*/, "$1"),
        bingVerification: str(f, "bingVerification").replace(/.*content="([^"]+)".*/, "$1"),
        robotsExtra: String(f.get("robotsExtra") ?? ""),
        indexNowKey: str(f, "indexNowKey").replace(/[^a-zA-Z0-9-]/g, ""),
        bodyEndCode: String(f.get("bodyEndCode") ?? ""),
      });
    } else {
      return { error: "Unknown section" };
    }
    await saveSettings(patch);
    revalidateSite();
    return { ok: true, message: "Settings saved." };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
