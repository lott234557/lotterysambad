import { Breadcrumbs } from "./Breadcrumbs";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  crumbs,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  crumbs?: { name: string; href?: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="hero">
      <div className="wrap pb-10 pt-6 md:pb-14 md:pt-8">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold backdrop-blur">{eyebrow}</div>}
        <h1 className="mt-3 max-w-4xl text-[1.7rem] font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-[2.6rem]">{title}</h1>
        {subtitle && <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-white/75 md:text-base">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
