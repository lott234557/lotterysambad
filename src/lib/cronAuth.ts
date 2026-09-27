import "server-only";
import type { NextRequest } from "next/server";

/**
 * Cron endpoints accept:
 *  - `Authorization: Bearer CRON_SECRET` (sent automatically by Vercel Cron when CRON_SECRET is set)
 *  - `?key=CRON_SECRET` (cron-job.org)
 *  - without CRON_SECRET: any call in development, and Vercel's own cron in production
 */
export function cronAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production" || isVercelCron(req);
  if (req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return req.nextUrl.searchParams.get("key") === secret;
}

export function isVercelCron(req: NextRequest) {
  return (req.headers.get("user-agent") ?? "").toLowerCase().startsWith("vercel-cron");
}
