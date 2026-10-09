import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/ui/Icons";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await getSession()) redirect("/admin");
  const usingDefaults = !process.env.ADMIN_PASSWORD;
  return (
    <main className="grain relative flex min-h-dvh items-center justify-center overflow-hidden px-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_30%,rgb(255_138_61/0.15),transparent)]" />
      <div className="glass-strong relative w-full max-w-md rounded-[2rem] p-8">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-10 w-10" />
          <span>
            <span className="block font-display text-lg font-bold">Explore Bound</span>
            <span className="block text-xs text-white/50">Admin console</span>
          </span>
        </Link>
        <h1 className="mt-8 mb-6 font-display text-3xl font-bold">Welcome back</h1>
        <LoginForm
          hint={
            usingDefaults && process.env.NODE_ENV !== "production"
              ? "Dev defaults: admin@explorebound.com / explore@123 — set ADMIN_EMAIL, ADMIN_PASSWORD and AUTH_SECRET in .env before going live."
              : undefined
          }
        />
      </div>
    </main>
  );
}
