import { ChevronDown } from "lucide-react";
import { JsonLd } from "./JsonLd";

export type QA = { q: string; a: string };

export function FAQ({ items, title = "Frequently Asked Questions" }: { items: QA[]; title?: string }) {
  return (
    <section className="mt-12" aria-labelledby="faq">
      <h2 id="faq" className="section-title">{title}</h2>
      <div className="mt-5 space-y-3">
        {items.map((it, i) => (
          <details key={i} className="card group p-0 [&_summary::-webkit-details-marker]:hidden" open={i === 0}>
            <summary className="flex cursor-pointer items-start justify-between gap-4 px-5 py-4 text-[0.97rem] font-bold">
              {it.q}
              <ChevronDown className="mt-0.5 size-5 shrink-0 text-muted transition group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 text-[0.93rem] leading-relaxed text-muted">{it.a}</div>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
        }}
      />
    </section>
  );
}
