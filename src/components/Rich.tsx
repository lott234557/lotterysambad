import Link from "@/components/SiteLink";
import { Fragment } from "react";
import { lp, type Locale } from "@/lib/i18n/config";

/**
 * Minimal inline renderer for dictionary strings: **bold** and [label](/path).
 * Internal links are localised for `lang`.
 */
export function Rich({ text, lang }: { text: string; lang: Locale }) {
  const out: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((\/[^)\s]*|https?:\/\/[^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(<Fragment key={i++}>{text.slice(last, m.index)}</Fragment>);
    if (m[1]) out.push(<strong key={i++}>{m[1]}</strong>);
    else if (m[3].startsWith("/")) out.push(<Link key={i++} href={lp(lang, m[3])}>{m[2]}</Link>);
    else
      out.push(
        <a key={i++} href={m[3]} target="_blank" rel="noopener nofollow">
          {m[2]}
        </a>,
      );
    last = re.lastIndex;
  }
  if (last < text.length) out.push(<Fragment key={i++}>{text.slice(last)}</Fragment>);
  return <>{out}</>;
}

/** Plain-text version (for meta descriptions / JSON-LD). */
export const plain = (text: string) => text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[(.+?)\]\([^)]+\)/g, "$1");
