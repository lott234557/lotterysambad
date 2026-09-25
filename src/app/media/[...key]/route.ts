import { readMedia } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key } = await ctx.params;
  const k = key.map(decodeURIComponent).join("/");
  if (!/^[\w\-./]+$/.test(k) || k.includes("..")) return new Response("Not found", { status: 404 });
  const file = await readMedia(k);
  if (!file) return new Response("Not found", { status: 404, headers: { "Cache-Control": "public, s-maxage=60" } });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.data.length),
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
