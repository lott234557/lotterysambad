"use client";
import { useState } from "react";
import { Share2, Link2, Check, Send, MessageCircle } from "lucide-react";
import { FacebookIcon as Facebook } from "./BrandIcons";

export function ShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(`${title} ${url}`);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  const native = async () => {
    try {
      await navigator.share({ title, url });
    } catch {}
  };
  const cls = "btn btn-ghost !px-3 !py-2 text-[0.82rem]";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a className={`${cls} !border-[#25D366]/40 text-[#128C7E] dark:text-[#25D366]`} href={`https://wa.me/?text=${text}`} target="_blank" rel="noopener nofollow">
        <MessageCircle className="size-4" /> WhatsApp
      </a>
      <a className={`${cls} !border-[#229ED9]/40 text-[#229ED9]`} href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener nofollow">
        <Send className="size-4" /> Telegram
      </a>
      <a className={`${cls} hidden sm:inline-flex`} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener nofollow">
        <Facebook className="size-4" /> Facebook
      </a>
      <button type="button" onClick={copy} className={cls}>
        {copied ? <Check className="size-4 text-ok" /> : <Link2 className="size-4" />} {copied ? "Copied" : "Copy link"}
      </button>
      <button type="button" onClick={native} className={`${cls} sm:hidden`} aria-label="Share">
        <Share2 className="size-4" />
      </button>
    </div>
  );
}
