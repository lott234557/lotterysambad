export function FirstPrize({
  number,
  amount = "₹1 Crore",
  size = "md",
  variant = "gold",
  label = "1st Prize",
  awaiting = "Awaiting…",
}: {
  number: string | null;
  amount?: string;
  size?: "md" | "lg";
  variant?: "gold" | "blue";
  label?: string;
  awaiting?: string;
}) {
  const [series, digits] = (number ?? "").split(" ");
  const big = size === "lg";
  return (
    <div className={`ticket ${variant === "blue" ? "ticket-blue" : ""} ${big ? "px-9 py-6 sm:px-12 sm:py-8" : "px-7 py-4"}`}>
      <div className={`flex items-center justify-between gap-3 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] ${variant === "blue" ? "text-white/70" : "text-[#5a4300]"}`}>
        <span>{label}</span>
        <span>{amount}</span>
      </div>
      <div className={`num mt-1 flex items-baseline justify-center gap-2 font-extrabold leading-none ${big ? "text-[2.6rem] sm:text-6xl" : "text-[2rem]"}`}>
        {number && digits ? (
          <>
            <span className={`${big ? "text-[1.6rem] sm:text-4xl" : "text-[1.25rem]"} opacity-80`}>{series}</span>
            <span>{digits}</span>
          </>
        ) : number ? (
          <span>{series}</span>
        ) : (
          <span className="text-base font-bold opacity-70">{awaiting}</span>
        )}
      </div>
    </div>
  );
}
