import { Download, Maximize2 } from "lucide-react";
import { mediaUrl } from "@/lib/storage";
import type { Result } from "@/lib/db/schema";
import { fmt, getDict, type Locale } from "@/lib/i18n";

export function ResultImage({
  result,
  alt,
  credit,
  priority = false,
  lang = "en",
}: {
  result: Result;
  alt: string;
  credit?: string | null;
  priority?: boolean;
  lang?: Locale;
}) {
  const t = getDict(lang).img;
  const src = mediaUrl(result.imageKey);
  if (!src) return null;
  const file = src.split("/").pop();
  return (
    <figure id="result-image" className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2 px-4 py-3">
        <figcaption className="text-[0.95rem] font-extrabold">{t.title}</figcaption>
        <div className="flex gap-2">
          <a href={src} target="_blank" rel="noopener" className="btn btn-ghost !px-3 !py-1.5 text-xs">
            <Maximize2 className="size-3.5" /> {t.full}
          </a>
          <a href={src} download={file} className="btn btn-gold !px-3 !py-1.5 text-xs">
            <Download className="size-3.5" /> {t.download}
          </a>
        </div>
      </div>
      <a href={src} target="_blank" rel="noopener" className="block bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={result.imageWidth ?? 1200}
          height={result.imageHeight ?? 1700}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="mx-auto h-auto w-full max-w-3xl"
        />
      </a>
      {credit && <p className="border-t border-line px-4 py-2 text-[0.7rem] text-muted">{fmt(t.source, { s: credit })}</p>}
    </figure>
  );
}
