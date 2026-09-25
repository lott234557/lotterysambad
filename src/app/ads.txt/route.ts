import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

export async function GET() {
  const s = await getSettings();
  let body = s.adsTxt.trim();
  if (!body && s.adsenseClient) {
    const pub = s.adsenseClient.replace(/^ca-/, "");
    body = `google.com, ${pub}, DIRECT, f08c47fec0942fa0`;
  }
  return new Response((body || "# ads.txt – add your ad network lines in Admin → Ads") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
