import "server-only";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Render trusted (admin-authored) Markdown/HTML to HTML with heading ids and safe external links. */
export function renderMarkdown(md: string): string {
  const html = marked.parse(md ?? "", { async: false }) as string;
  return html
    .replace(/<h([23])>(.*?)<\/h\1>/g, (_m, l, inner) => `<h${l} id="${slugify(inner)}">${inner}</h${l}>`)
    .replace(/<a href="(https?:\/\/[^"]+)"/g, (m, href) =>
      href.includes("lotterysambad.plus") ? m : `<a href="${href}" target="_blank" rel="noopener nofollow"`,
    )
    .replace(/<img /g, '<img loading="lazy" decoding="async" ');
}

export function toc(md: string) {
  return Array.from((md ?? "").matchAll(/^##\s+(.+)$/gm)).map((m) => ({ id: slugify(m[1]), text: m[1].replace(/[*_`]/g, "") }));
}

export function plainExcerpt(md: string, len = 160) {
  const t = (md ?? "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t.length > len ? t.slice(0, len - 1).replace(/\s+\S*$/, "") + "…" : t;
}
