import "server-only";
import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

type DB = PostgresJsDatabase<typeof schema>;

const g = globalThis as unknown as { __lspSql?: ReturnType<typeof postgres>; __lspDb?: DB };

/** Drop libpq-only params (e.g. Neon's channel_binding) that postgres.js would send as server settings. */
export function cleanDbUrl(raw: string) {
  try {
    const u = new URL(raw);
    for (const k of ["channel_binding", "pgbouncer", "options"]) u.searchParams.delete(k);
    return u.toString();
  } catch {
    return raw;
  }
}

function create(): DB {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not set");
  const url = cleanDbUrl(raw);
  const client =
    g.__lspSql ??
    postgres(url, {
      max: 5,
      prepare: false, // required for Neon / pgbouncer pooled connections
      idle_timeout: 20,
      connect_timeout: 15,
      onnotice: () => {},
    });
  g.__lspSql = client;
  const d = drizzle(client, { schema });
  g.__lspDb = d;
  return d;
}

/** Lazily-created Drizzle client (does not connect at import time). */
export const db: DB = new Proxy({} as DB, {
  get(_t, prop) {
    const d = g.__lspDb ?? create();
    const v = (d as unknown as Record<string | symbol, unknown>)[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(d) : v;
  },
});

/** Raw postgres.js client (used for migrations / seeding). */
export function getSql() {
  if (!g.__lspSql) create();
  return g.__lspSql!;
}

export const isBuildPhase = () => process.env.NEXT_PHASE === "phase-production-build";

/**
 * Run a read query for public pages. During `next build` a DB failure returns the
 * fallback (so builds never break); at runtime errors are re-thrown so ISR keeps
 * serving the previous good page instead of caching an empty one.
 */
export async function safeRead<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (isBuildPhase() || !process.env.DATABASE_URL) {
      console.warn("[db] read failed during build, using fallback:", (e as Error).message);
      return fallback;
    }
    throw e;
  }
}

export { schema };
