"use client";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "", label = "Toggle dark mode" }: { className?: string; label?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const dark = !root.classList.contains("dark");
    root.classList.toggle("dark", dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`grid size-10 place-items-center rounded-xl border border-line bg-surface text-ink transition hover:border-brand-2 ${className}`}
    >
      <Sun className="hidden size-[18px] dark:block" />
      <Moon className="size-[18px] dark:hidden" />
    </button>
  );
}
