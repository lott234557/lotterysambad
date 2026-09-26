"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Languages, Check } from "lucide-react";
import { LOCALES, LOCALE_NAMES, LANG_COOKIE, lp, splitLocale, type Locale } from "@/lib/i18n/config";

/** Language picker: remembers the choice in a cookie and opens the same page in the new language. */
export function LangSwitcher({ lang, label, compact = false }: { lang: Locale; label: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const go = (l: Locale) => {
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    const { path } = splitLocale(pathname);
    const target = lp(l, path);
    // non-localizable pages (blog, legal) have no translation – open that language's home instead
    window.location.href = l !== "en" && target === path ? lp(l, "/") : target;
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 text-sm font-bold text-ink transition hover:border-brand-2 ${compact ? "w-full justify-center" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        title={label}
      >
        <Languages className="size-[18px]" />
        <span className={compact ? "" : "hidden sm:inline"}>{LOCALE_NAMES[lang].native}</span>
      </button>
      {open && (
        <ul role="listbox" className={`card absolute z-[80] mt-2 w-44 overflow-hidden p-1.5 ${compact ? "bottom-full left-0 mb-2" : "right-0"}`}>
          {LOCALES.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === lang}
                onClick={() => go(l)}
                lang={l}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold hover:bg-surface-2"
              >
                <span>
                  {LOCALE_NAMES[l].native}
                  {l !== "en" && <span className="ml-1.5 text-xs font-normal text-muted">{LOCALE_NAMES[l].english}</span>}
                </span>
                {l === lang && <Check className="size-4 text-ok" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
