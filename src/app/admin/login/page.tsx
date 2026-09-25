import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogoMark } from "@/components/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function Login() {
  if (await getSession()) redirect("/admin");
  return (
    <main className="hero grid min-h-dvh place-items-center p-4">
      <div className="card w-full max-w-sm p-7">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="size-14" />
          <h1 className="mt-4 text-xl font-extrabold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Lottery Sambad Plus</p>
        </div>
        <div className="mt-7">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
