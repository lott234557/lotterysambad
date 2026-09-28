import Link from "@/components/SiteLink";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="hero grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <LogoMark className="mx-auto size-16" />
        <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.2em] text-gold">404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">This page is not available</h1>
        <p className="mx-auto mt-3 max-w-md text-white/70">The result or page you are looking for does not exist or has not been published yet.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-gold">Today&apos;s result</Link>
          <Link href="/old-results" className="btn border border-white/20 text-white">Old results</Link>
        </div>
      </div>
    </main>
  );
}
