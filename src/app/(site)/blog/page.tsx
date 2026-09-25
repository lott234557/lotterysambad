import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/pages";
import { getSettings, siteUrl } from "@/lib/settings";
import { formatIST } from "@/lib/time";
import { PageHero } from "@/components/PageHero";
import { ArrowRight, Newspaper } from "lucide-react";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = "Lottery Sambad Guides & Updates";
  const description = "Guides on checking Lottery Sambad results, claiming prizes, draw changes and other useful updates.";
  return { title, description, alternates: { canonical: siteUrl() + "/blog" }, openGraph: { title: `${title} | ${s.siteName}`, description } };
}

export default async function Page() {
  const posts = await getPublishedPosts(60);
  return (
    <>
      <PageHero crumbs={[{ name: "Guides & Updates" }]} eyebrow="Blog" title="Guides & Updates" subtitle="Helpful guides and the latest updates about Lottery Sambad results." />
      <div className="wrap mt-8">
        {posts.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-12 text-center text-muted">
            <Newspaper className="size-8" /> Articles will appear here soon.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="card group flex flex-col overflow-hidden hover:border-brand-2">
                {p.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverImage} alt={p.title} loading="lazy" className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <div className="hero grid aspect-[16/9] place-items-center p-6 text-center text-lg font-extrabold text-white">{p.title}</div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-extrabold leading-snug group-hover:text-brand-2">{p.title}</h2>
                  {p.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted">{p.excerpt}</p>}
                  <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted">
                    <span>{formatIST(p.publishedAt)}</span>
                    <ArrowRight className="size-4 text-brand-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
