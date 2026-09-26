import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { isLocalizablePath, isPrefixed, LANG_COOKIE, lp, pickLocale, type Locale } from "@/lib/i18n/config";

const COOKIE = "lsp_admin";
const BOT = /bot|crawl|spider|slurp|mediapartners|lighthouse|facebookexternalhit|whatsapp|telegram|twitter|discord|preview/i;

async function valid(token?: string) {
  if (!token) return false;
  const s = process.env.AUTH_SECRET || (process.env.NODE_ENV === "production" ? "" : "dev-only-secret-change-me-please");
  if (!s) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(s), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

async function adminGuard(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();
  if (!(await valid(req.cookies.get(COOKIE)?.value))) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

/**
 * First visit: send readers whose browser prefers Hindi / Bengali / Malayalam to that version.
 * Later visits: follow the language they picked (the `lang` cookie set by the language switcher).
 * Crawlers and link-preview bots always get the URL they asked for.
 */
function languageRedirect(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (!isLocalizablePath(pathname) || BOT.test(req.headers.get("user-agent") ?? "")) return NextResponse.next();
  const cookie = req.cookies.get(LANG_COOKIE)?.value;
  let target: Locale | null = null;
  if (cookie) {
    if (isPrefixed(cookie)) target = cookie;
  } else {
    const picked = pickLocale(req.headers.get("accept-language"));
    if (isPrefixed(picked)) target = picked;
  }
  if (!target) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = lp(target, pathname);
  url.search = search;
  const res = NextResponse.redirect(url, 307);
  res.headers.set("Cache-Control", "private, no-store");
  if (!cookie) res.cookies.set(LANG_COOKIE, target, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminGuard(req);
  return languageRedirect(req);
}

// English pages only (no locale prefix, no files, no API/admin) – and only when a redirect is possible:
// the browser asks for hi/bn/ml and no choice was stored yet, or the stored choice is hi/bn/ml.
// Client-side navigations (RSC) and prefetches are skipped, so the proxy runs at most once per full page load.
// (Values must be literals – Next.js reads this config at build time.)
export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    {
      source: "/((?!api|_next|admin|media|blog|hi|bn|ml|.*\\.).*)",
      has: [{ type: "header", key: "accept-language", value: ".*(hi|bn|ml).*" }],
      missing: [
        { type: "cookie", key: "lang" },
        { type: "header", key: "rsc" },
        { type: "header", key: "next-router-prefetch" },
      ],
    },
    {
      source: "/((?!api|_next|admin|media|blog|hi|bn|ml|.*\\.).*)",
      has: [{ type: "cookie", key: "lang", value: "(hi|bn|ml)" }],
      missing: [
        { type: "header", key: "rsc" },
        { type: "header", key: "next-router-prefetch" },
      ],
    },
  ],
};
