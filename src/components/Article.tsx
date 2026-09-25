import { renderMarkdown, toc } from "@/lib/markdown";
import { PageHero } from "./PageHero";
import { Ad } from "./Ad";

export function Article({
  title,
  crumbs,
  eyebrow,
  content,
  meta,
  cover,
}: {
  title: string;
  crumbs: { name: string; href?: string }[];
  eyebrow?: string;
  content: string;
  meta?: React.ReactNode;
  cover?: string | null;
}) {
  const html = renderMarkdown(content);
  const headings = toc(content);
  // Insert the in-content ad after the 2nd section when the article is long enough.
  const parts = html.split(/(?=<h2 )/);
  const cut = parts.length > 3 ? 2 : parts.length;
  return (
    <>
      <PageHero crumbs={crumbs} eyebrow={eyebrow} title={title} subtitle={meta} />
      <div className="wrap mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="card min-w-0 p-5 sm:p-8">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={title} className="mb-6 w-full rounded-2xl border border-line" />
          )}
          <div className="prose-x" dangerouslySetInnerHTML={{ __html: parts.slice(0, cut).join("") }} />
          {parts.length > cut && (
            <>
              <Ad slot="inContent" className="my-8" />
              <div className="prose-x" dangerouslySetInnerHTML={{ __html: parts.slice(cut).join("") }} />
            </>
          )}
        </article>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {headings.length > 2 && (
            <nav className="card p-4 text-sm" aria-label="Table of contents">
              <div className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">On this page</div>
              <ul className="space-y-1.5">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-ink/80 hover:text-brand-2">{h.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <Ad slot="sidebar" />
        </aside>
      </div>
    </>
  );
}
