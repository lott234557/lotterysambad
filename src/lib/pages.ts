import "server-only";
import { cache } from "react";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, safeRead } from "./db";
import { pages, posts, type Page, type Post } from "./db/schema";

export const getFooterPages = cache(async () =>
  safeRead(
    () =>
      db
        .select({ slug: pages.slug, title: pages.title })
        .from(pages)
        .where(and(eq(pages.status, "published"), eq(pages.showInFooter, true)))
        .orderBy(asc(pages.sortOrder), asc(pages.title)),
    [] as { slug: string; title: string }[],
  ),
);

export const getPageBySlug = cache(async (slug: string) => {
  const rows = await safeRead(
    () => db.select().from(pages).where(and(eq(pages.slug, slug), eq(pages.status, "published"))).limit(1),
    [] as Page[],
  );
  return rows[0] ?? null;
});

export const getAllPages = cache(async () =>
  safeRead(() => db.select({ slug: pages.slug, updatedAt: pages.updatedAt }).from(pages).where(eq(pages.status, "published")), [] as { slug: string; updatedAt: Date }[]),
);

export const getPublishedPosts = cache(async (limit = 50) =>
  safeRead(
    () =>
      db
        .select({
          id: posts.id,
          slug: posts.slug,
          title: posts.title,
          excerpt: posts.excerpt,
          coverImage: posts.coverImage,
          publishedAt: posts.publishedAt,
          updatedAt: posts.updatedAt,
        })
        .from(posts)
        .where(eq(posts.status, "published"))
        .orderBy(desc(posts.publishedAt))
        .limit(limit),
    [] as Pick<Post, "id" | "slug" | "title" | "excerpt" | "coverImage" | "publishedAt" | "updatedAt">[],
  ),
);

export const getPostBySlug = cache(async (slug: string) => {
  const rows = await safeRead(
    () => db.select().from(posts).where(and(eq(posts.slug, slug), eq(posts.status, "published"))).limit(1),
    [] as Post[],
  );
  return rows[0] ?? null;
});
