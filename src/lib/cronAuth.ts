import "server-only";
import type { NextRequest } from "next/server";

/**
 * Cron endpoints accept:
 *  - `Authorization: Bearer CRON_SECRET` (sent automatically by Vercel Cron when CRON_SECRET is set)
 *  - `?key=CRON_SECRET` (cron-job.org)
 *  - without CRON_SECRET: any call in development, and Vercel's own cron in production
 */
export function cronAuthorized(req: NextRequest) {
  const raw = process.env.CRON_SECRET ?? "";
  const secret = raw.trim();
  // an empty CRON_SECRET counts as "not set"
  if (!secret) return process.env.NODE_ENV !== "production" || isVercelCron(req);
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}` || auth === `Bearer ${raw}`) return true;
  return (req.nextUrl.searchParams.get("key") ?? "").trim() === secret;
}

export function isVercelCron(req: NextRequest) {
  return (req.headers.get("user-agent") ?? "").toLowerCase().startsWith("vercel-cron");
}
