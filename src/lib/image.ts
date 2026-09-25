import "server-only";
import sharp from "sharp";
import { createHash } from "node:crypto";

/** Convert any image to an optimised WebP (max width 1400px). */
export async function toWebp(input: Buffer, maxWidth = 1400, quality = 80) {
  const img = sharp(input, { failOn: "none" }).rotate();
  const meta = await img.metadata();
  if (!meta.width || !meta.height) throw new Error("Not a valid image");
  const out = await img
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer({ resolveWithObject: true });
  return {
    data: out.data,
    width: out.info.width,
    height: out.info.height,
    srcWidth: meta.width,
    srcHeight: meta.height,
    hash: createHash("sha1").update(out.data).digest("hex").slice(0, 8),
  };
}
