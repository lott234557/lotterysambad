import "server-only";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { media } from "./db/schema";

const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

/** Public URL (on our own domain) for a media key. */
export const mediaUrl = (key: string | null | undefined) => (key ? `/media/${key}` : null);

export async function saveMedia(opts: {
  key: string;
  data: Buffer;
  contentType: string;
  width?: number;
  height?: number;
}) {
  const { key, data, contentType, width, height } = opts;
  let storage: "db" | "blob" = "db";
  let blobUrl: string | null = null;
  let stored: Buffer | null = data;

  if (useBlob()) {
    const { put } = await import("@vercel/blob");
    const res = await put(key, data, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 31536000,
    });
    storage = "blob";
    blobUrl = res.url;
    stored = null;
  }

  const values = {
    key,
    contentType,
    size: data.length,
    width: width ?? null,
    height: height ?? null,
    storage,
    blobUrl,
    data: stored,
  };
  await db
    .insert(media)
    .values(values)
    .onConflictDoUpdate({ target: media.key, set: { ...values, createdAt: new Date() } });
  return mediaUrl(key)!;
}

export async function readMedia(key: string): Promise<{ contentType: string; data: Buffer } | null> {
  const rows = await db.select().from(media).where(eq(media.key, key)).limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.storage === "blob" && row.blobUrl) {
    const r = await fetch(row.blobUrl);
    if (!r.ok) return null;
    return { contentType: row.contentType, data: Buffer.from(await r.arrayBuffer()) };
  }
  if (!row.data) return null;
  return { contentType: row.contentType, data: Buffer.from(row.data) };
}

export async function deleteMedia(key: string) {
  const rows = await db.select({ blobUrl: media.blobUrl }).from(media).where(eq(media.key, key)).limit(1);
  if (rows[0]?.blobUrl && useBlob()) {
    try {
      const { del } = await import("@vercel/blob");
      await del(rows[0].blobUrl);
    } catch (e) {
      console.warn("[media] blob delete failed", e);
    }
  }
  await db.delete(media).where(eq(media.key, key));
}
