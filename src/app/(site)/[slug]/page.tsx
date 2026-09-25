import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/pages";
import { getSettings, siteUrl } from "@/lib/settings";
import { formatIST } from "@/lib/time";
import { plainExcerpt } from "@/lib/markdown";
import { Article } from "@/components/Article";

export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPageBySlug(slug);
  if (!p) return {};
  return {
    title: p.metaTitle || p.title,
    description: p.metaDescription || plainExcerpt(p.content),
    alternates: { canonical: `${siteUrl()}/${p.slug}` },
  };
}

export default async function Page({ params }: P) {
  const { slug } = await params;
  const [p, s] = await Promise.all([getPageBySlug(slug), getSettings()]);
  if (!p) notFound();
  return (
    <Article
      title={p.title}
      crumbs={[{ name: p.title }]}
      eyebrow={s.siteName}
      content={p.content}
      meta={<>Last updated {formatIST(p.updatedAt).split(",")[0]}</>}
    />
  );
}
