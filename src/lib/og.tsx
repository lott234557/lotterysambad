import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const font = (f: string) => readFile(join(process.cwd(), "src/fonts/og", f));
const fontsP = Promise.all([font("jakarta-800.woff"), font("jakarta-500.woff"), font("jbmono-800.woff")]).catch(() => null);

const ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjMTU1N2Q5Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDYxYTQ0Ii8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZmUyN2QiLz48c3RvcCBvZmZzZXQ9Ii41IiBzdG9wLWNvbG9yPSIjZmZjMjFhIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmZhYjAwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTYiIGZpbGw9InVybCgjYikiLz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgtMTQgMzIgMzIpIj48cGF0aCBkPSJNMTQgMjBoMzZhMyAzIDAgMCAxIDMgM3Y1LjVhMy41IDMuNSAwIDAgMCAwIDdWNDFhMyAzIDAgMCAxLTMgM0gxNGEzIDMgMCAwIDEtMy0zdi01LjVhMy41IDMuNSAwIDAgMCAwLTdWMjNhMyAzIDAgMCAxIDMtM3oiIGZpbGw9InVybCgjZykiLz48cGF0aCBkPSJNMzIgMjEuNWMuOSA2LjYgMy45IDkuNiAxMC41IDEwLjUtNi42LjktOS42IDMuOS0xMC41IDEwLjUtLjktNi42LTMuOS05LjYtMTAuNS0xMC41IDYuNi0uOSA5LjYtMy45IDEwLjUtMTAuNXoiIGZpbGw9IiMwNjFhNDQiLz48Y2lyY2xlIGN4PSI0Mi41IiBjeT0iMjQuNSIgcj0iMi4yIiBmaWxsPSIjMDYxYTQ0Ii8+PC9nPjwvc3ZnPgo=";

export const OG_SIZE = { width: 1200, height: 630 };

export async function ogImage(opts: { kicker: string; title: string; sub?: string; number?: string | null; footer?: string }) {
  const { kicker, title, sub, number, footer = "lotterysambad.plus" } = opts;
  const f = await fontsP;
  const fonts = f
    ? [
        { name: "Jakarta", data: f[0], weight: 800 as const, style: "normal" as const },
        { name: "Jakarta", data: f[1], weight: 500 as const, style: "normal" as const },
        { name: "Mono", data: f[2], weight: 800 as const, style: "normal" as const },
      ]
    : undefined;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          color: "white",
          fontFamily: "Jakarta",
          background: "radial-gradient(900px 400px at 90% 0%, rgba(255,194,26,0.35), transparent 60%), linear-gradient(135deg, #051233 0%, #0a2766 55%, #0d3a8f 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ICON} width={64} height={64} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 800 }}>Lottery Sambad</div>
            <div style={{ display: "flex", marginTop: 4 }}>
              <div style={{ background: "#ffc21a", color: "#1c1400", fontSize: 16, fontWeight: 800, padding: "2px 10px", borderRadius: 6, letterSpacing: 4 }}>PLUS</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, color: "#ffc21a", fontWeight: 800, letterSpacing: 4, textTransform: "uppercase" }}>{kicker}</div>
          <div style={{ fontSize: number ? 58 : 68, fontWeight: 800, lineHeight: 1.1, marginTop: 10, maxWidth: 1000 }}>{title}</div>
          {sub && <div style={{ fontSize: 28, fontWeight: 500, color: "rgba(255,255,255,0.75)", marginTop: 14 }}>{sub}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          {number ? (
            <div style={{ display: "flex", flexDirection: "column", background: "linear-gradient(135deg, #ffe07a, #ffc21a 45%, #ffab00)", color: "#1c1400", borderRadius: 22, padding: "18px 40px" }}>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 4 }}>1ST PRIZE</div>
              <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: 2, fontFamily: "Mono" }}>{number}</div>
            </div>
          ) : (
            <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.8)" }}>1 PM · 6 PM · 8 PM · Live Results</div>
          )}
          <div style={{ fontSize: 26, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>{footer}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
