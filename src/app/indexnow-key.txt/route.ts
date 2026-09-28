import { getSettings } from "@/lib/settings";

export const revalidate = 86400; // rebuilt on demand when content changes

export async function GET() {
  const s = await getSettings();
  if (!s.indexNowKey) return new Response("Not found", { status: 404 });
  return new Response(s.indexNowKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
