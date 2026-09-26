import Link from "next/link";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lm-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1557d9" />
          <stop offset="1" stopColor="#061a44" />
        </linearGradient>
        <linearGradient id="lm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe27d" />
          <stop offset=".5" stopColor="#ffc21a" />
          <stop offset="1" stopColor="#ffab00" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#lm-b)" />
      <g transform="rotate(-14 32 32)">
        <path
          d="M14 20h36a3 3 0 0 1 3 3v5.5a3.5 3.5 0 0 0 0 7V41a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3v-5.5a3.5 3.5 0 0 0 0-7V23a3 3 0 0 1 3-3z"
          fill="url(#lm-g)"
        />
        <path
          d="M32 21.5c.9 6.6 3.9 9.6 10.5 10.5-6.6.9-9.6 3.9-10.5 10.5-.9-6.6-3.9-9.6-10.5-10.5 6.6-.9 9.6-3.9 10.5-10.5z"
          fill="#061a44"
        />
        <circle cx="42.5" cy="24.5" r="2.2" fill="#061a44" />
      </g>
    </svg>
  );
}

export function Logo({
  logoUrl,
  siteName,
  invert = false,
  href = "/",
  live = "Live Results",
}: {
  logoUrl?: string;
  siteName: string;
  invert?: boolean;
  href?: string;
  live?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5 shrink-0" aria-label={`${siteName} – Home`}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={siteName} className="h-9 w-auto" />
      ) : (
        <>
          <LogoMark />
          <span className="leading-none">
            <span className={`block text-[1.05rem] font-extrabold tracking-tight ${invert ? "text-white" : "text-ink"}`}>
              Lottery Sambad
            </span>
            <span className="mt-1 flex items-center gap-1.5">
              <span className="rounded-md bg-gold px-1.5 py-[1px] text-[0.62rem] font-extrabold tracking-[0.18em] text-[#1c1400]">
                PLUS
              </span>
              <span className={`text-[0.66rem] font-semibold ${invert ? "text-white/60" : "text-muted"}`}>{live}</span>
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
