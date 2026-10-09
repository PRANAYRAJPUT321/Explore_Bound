import Link from "next/link";
import { Logo } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <main className="grain relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_40%,rgb(255_138_61/0.18),transparent)]" />
      <Logo className="h-14 w-14 animate-spin-slow" />
      <div className="mt-6 font-display text-[9rem] leading-none font-extrabold text-gradient md:text-[14rem]">404</div>
      <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">Looks like you&apos;ve wandered off the map.</h1>
      <p className="mt-3 max-w-md text-white/60">Even the best explorers take a wrong turn. Let&apos;s get you back on course.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Take me home
        </Link>
        <Link href="/destinations" className="btn-ghost">
          Spin the globe
        </Link>
      </div>
    </main>
  );
}
