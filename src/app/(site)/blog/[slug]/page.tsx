import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/pages";
import { getSettings, siteUrl } from "@/lib/settings";
import { formatIST, isoWithIST } from "@/lib/time";
import { plainExcerpt } from "@/lib/markdown";
import { Article } from "@/components/Article";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPostBySlug(slug);
  if (!p) return {};
  const description = p.metaDescription || p.excerpt || plainExcerpt(p.content);
  return {
    title: p.metaTitle || p.title,
    description,
    alternates: { canonical: `${siteUrl()}/blog/${p.slug}` },
    openGraph: { title: p.metaTitle || p.title, description, type: "article", images: p.coverImage ? [p.coverImage] : undefined },
  };
}

export default async function Page({ params }: P) {
  const { slug } = await params;
  const [p, s] = await Promise.all([getPostBySlug(slug), getSettings()]);
  if (!p) notFound();
  return (
    <>
      <Article
        title={p.title}
        crumbs={[{ name: "Guides & Updates", href: "/blog" }, { name: p.title }]}
        eyebrow="Guide"
        content={p.content}
        cover={p.coverImage}
        meta={<>Updated {formatIST(p.updatedAt)} · {s.siteName}</>}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: p.metaDescription || p.excerpt || plainExcerpt(p.content),
          datePublished: isoWithIST(p.publishedAt ?? p.createdAt),
          dateModified: isoWithIST(p.updatedAt),
          mainEntityOfPage: `${siteUrl()}/blog/${p.slug}`,
          image: p.coverImage ? [p.coverImage.startsWith("http") ? p.coverImage : siteUrl() + p.coverImage] : undefined,
          author: { "@type": "Organization", name: s.siteName },
          publisher: { "@type": "Organization", name: s.siteName, logo: { "@type": "ImageObject", url: siteUrl() + "/icon-512.png" } },
        }}
      />
    </>
  );
}
