"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { lotteryDraws, type DrawTier } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { revalidateOther } from "@/lib/revalidate";
import { isValidISO, isoToDMY } from "@/lib/time";
import { toWebp } from "@/lib/image";
import { saveMedia, deleteMedia } from "@/lib/storage";
import { fetchImage } from "@/lib/scraper/fetch";
import { getSettingsFresh, saveSettings } from "@/lib/settings";
import { OTHER, isOtherId, type OtherId } from "@/lib/others/config";
import { scrapeOther, type OtherOutcome } from "@/lib/others/scrape";
import { cleanText, firstPrizeOf, isCompleteTiers, parseKerala, parseSections, parseTiers, slugify, type ParsedDraw } from "@/lib/others/parse";
import type { ActionState } from "./actions";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";

/** "Fetch now" for one lottery and date (forces a refresh of existing draws). */
export async function scrapeOtherAction(id: string, date: string): Promise<OtherOutcome | { error: string }> {
  await requireAdmin();
  if (!isOtherId(id) || !isValidISO(date)) return { error: "Bad lottery or date" };
  try {
    const out = await scrapeOther(id, date, { force: true, trigger: "manual" });
    revalidateOther(id, date, { newUrls: true });
    return out;
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function saveOtherSettingsAction(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(f, "lottery");
  if (!isOtherId(id)) return { error: "Unknown lottery" };
  const cur = await getSettingsFresh();
  const extra = str(f, "extraSources")
    .split(/\s+/)
    .filter((u) => /^https?:\/\/\S+$/.test(u))
    .slice(0, 5)
    .join("\n");
  await saveSettings({ others: { ...cur.others, [id]: { enabled: bool(f, "enabled"), extraSources: extra } } });
  revalidatePath("/admin/lotteries");
  return { ok: true, message: "Saved." };
}

/** Read prize tiers from pasted text (result page copy, PDF text, WhatsApp message …). */
export async function parseOtherTextAction(id: string, text: string): Promise<{ draws: ParsedDraw[] } | { error: string }> {
  await requireAdmin();
  if (!isOtherId(id)) return { error: "Unknown lottery" };
  const clean = cleanText(text);
  let draws: ParsedDraw[] = [];
  if (id === "kerala") {
    const d = parseKerala(clean);
    if (d) draws = [d];
  } else if (id === "maharashtra" || id === "punjab") {
    draws = parseSections(clean, id);
  }
  if (!draws.length) {
    const tiers = parseTiers(clean, id);
    if (tiers.length) draws = [{ key: "", name: "", kind: "daily", tiers }];
  }
  if (!draws.length) return { error: "No prize list found. Make sure the text contains lines like “1st Prize Rs.1,00,00,000/- RA 494226”." };
  return { draws };
}

async function imageFromForm(f: FormData, keyBase: string) {
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
  const webp = await toWebp(buf, 1600, 82);
  const key = `${keyBase}-${webp.hash}.webp`.slice(0, 190);
  await saveMedia({ key, data: webp.data, contentType: "image/webp", width: webp.width, height: webp.height });
  return { key, width: webp.width, height: webp.height, source };
}

function readTiers(raw: string): DrawTier[] {
  let data: unknown;
  try {
    data = JSON.parse(raw || "[]");
  } catch {
    throw new Error("Prize list could not be read – please try again.");
  }
  if (!Array.isArray(data)) return [];
  return data
    .map((t) => ({
      label: String((t as DrawTier).label ?? "").trim().slice(0, 40),
      amount: String((t as DrawTier).amount ?? "").trim().slice(0, 40) || undefined,
      numbers: Array.from(
        new Set(
          (Array.isArray((t as DrawTier).numbers) ? (t as DrawTier).numbers : [])
            .map((n) => String(n).trim().toUpperCase().replace(/\s+/g, " "))
            .filter(Boolean),
        ),
      ).slice(0, 2000),
      expected: Number((t as DrawTier).expected) || undefined,
    }))
    .filter((t) => t.label && t.numbers.length);
}

export async function saveOtherDrawAction(_: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = Number(str(f, "id")) || null;
    const lottery = str(f, "lottery");
    const drawDate = str(f, "drawDate");
    if (!isOtherId(lottery)) return { error: "Choose a lottery." };
    if (!isValidISO(drawDate)) return { error: "Choose a valid draw date." };
    const drawName = str(f, "drawName");
    if (!drawName) return { error: "Enter the draw name (e.g. Suvarna Keralam SK-71)." };
    const drawCode = str(f, "drawCode") || null;
    const drawKey = slugify(str(f, "drawKey") || drawCode || drawName) || "draw";
    const tiers = readTiers(str(f, "tiers"));

    const dup = await db
      .select({ id: lotteryDraws.id })
      .from(lotteryDraws)
      .where(and(eq(lotteryDraws.lottery, lottery), eq(lotteryDraws.drawDate, drawDate), eq(lotteryDraws.drawKey, drawKey), id ? ne(lotteryDraws.id, id) : undefined))
      .limit(1);
    if (dup.length) return { error: `This draw already exists for ${drawDate} (#${dup[0].id}). Edit that one instead.` };

    const existing = id ? (await db.select().from(lotteryDraws).where(eq(lotteryDraws.id, id)).limit(1))[0] : null;
    const img = await imageFromForm(f, `others/${lottery}-lottery-result-${isoToDMY(drawDate)}-${drawKey}`);
    const removeImage = bool(f, "removeImage");
    const imageKey = img?.key ?? (removeImage ? null : existing?.imageKey ?? null);
    const row = {
      lottery,
      drawDate,
      drawKey,
      drawName,
      drawCode,
      drawTime: str(f, "drawTime") || null,
      kind: ["daily", "weekly", "monthly", "bumper"].includes(str(f, "kind")) ? str(f, "kind") : "daily",
      firstPrize: firstPrizeOf(tiers),
      firstAmount: tiers.find((t) => t.label === "1st Prize")?.amount ?? null,
      tiers,
      imageKey,
      imageWidth: img?.width ?? (removeImage ? null : existing?.imageWidth ?? null),
      imageHeight: img?.height ?? (removeImage ? null : existing?.imageHeight ?? null),
      imageSourceUrl: img ? img.source : removeImage ? null : existing?.imageSourceUrl ?? null,
      notes: str(f, "notes") || null,
      status: str(f, "status") === "draft" ? "draft" : "published",
      // "manual" = locked: the scraper never overwrites this draw
      source: bool(f, "manual") ? "manual" : existing && existing.source !== "manual" ? existing.source : "admin",
      isComplete: isCompleteTiers(lottery as OtherId, tiers, !!imageKey) || (tiers.length > 0 && bool(f, "manual")),
      updatedAt: new Date(),
    };
    let savedId = id;
    if (existing) {
      await db.update(lotteryDraws).set(row).where(eq(lotteryDraws.id, existing.id));
      if (removeImage && existing.imageKey && existing.imageKey !== row.imageKey) await deleteMedia(existing.imageKey);
    } else {
      const ins = await db
        .insert(lotteryDraws)
        .values({ ...row, publishedAt: new Date() })
        .returning({ id: lotteryDraws.id });
      savedId = ins[0].id;
    }
    revalidateOther(lottery as OtherId, drawDate, { newUrls: !existing });
    if (existing && existing.drawDate !== drawDate && isOtherId(existing.lottery)) revalidateOther(existing.lottery, existing.drawDate);
    if (!existing) redirect(`/admin/lotteries/${savedId}?saved=1`);
    return { ok: true, message: "Draw saved.", url: `${OTHER[lottery as OtherId].path}/${isoToDMY(drawDate)}` };
  } catch (e) {
    if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw e;
    return { error: (e as Error).message };
  }
}

export async function deleteOtherDrawAction(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id"));
  const r = (await db.select().from(lotteryDraws).where(eq(lotteryDraws.id, id)).limit(1))[0];
  if (r) {
    await db.delete(lotteryDraws).where(eq(lotteryDraws.id, id));
    if (r.imageKey) await deleteMedia(r.imageKey).catch(() => {});
    if (isOtherId(r.lottery)) revalidateOther(r.lottery, r.drawDate, { newUrls: true });
  }
  redirect(`/admin/lotteries?l=${r?.lottery ?? "kerala"}`);
}
