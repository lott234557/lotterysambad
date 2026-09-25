"use client";
import { useEffect } from "react";

/** Injects custom HTML/scripts (from Admin → SEO) at the end of <body>, once. */
export function BodyCode({ code }: { code: string }) {
  useEffect(() => {
    if (!code || document.getElementById("lsp-body-code")) return;
    const wrap = document.createElement("div");
    wrap.id = "lsp-body-code";
    wrap.innerHTML = code;
    wrap.querySelectorAll("script").forEach((old) => {
      const s = document.createElement("script");
      for (const a of Array.from(old.attributes)) s.setAttribute(a.name, a.value);
      s.text = old.text;
      old.replaceWith(s);
    });
    document.body.appendChild(wrap);
  }, [code]);
  return null;
}
