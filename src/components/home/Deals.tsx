import { ArrowUpRight, Flame } from "lucide-react";
import Link from "next/link";
import { Countdown } from "@/components/packages/Countdown";
import { Price } from "@/components/ui/Price";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import type { PackageCard } from "@/db/queries";
import { discountPct } from "@/lib/utils";

export function Deals({ deals }: { deals: PackageCard[] }) {
  if (!deals.length) return null;
  const [hero, ...rest] = deals;
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 md:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-96 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(255_94_98/0.12),transparent)]" />
      <Reveal className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="eyebrow !text-coral-400">
            <Flame size={14} /> Flash deals
          </span>
          <h2 className="mt-4 text-4xl font-bold md:text-6xl">
            Grab them <span className="text-gradient">before they fly.</span>
          </h2>
        </div>
        <p className="max-w-sm text-white/55">Limited-time prices on our most-loved trips. When the timer hits zero, the deal is gone.</p>
      </Reveal>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Reveal>
          <Link href={`/packages/${hero.slug}`} className="group shine relative block h-full min-h-[460px] overflow-hidden rounded-[2.5rem] border border-white/10">
            <SmartImage src={hero.coverImage} alt={hero.title} label={hero.destinationName} width={1400} className="absolute inset-0 h-full w-full transition duration-[1.6s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-tr from-ink-950 via-ink-950/50 to-transparent" />
            <div className="absolute top-6 left-6 rounded-full bg-sunset px-4 py-1.5 text-sm font-extrabold text-ink-950">{discountPct(hero.price, hero.originalPrice)}% OFF</div>
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
              <div className="text-sm font-semibold text-sun-300">
                {hero.destinationName} · {hero.durationDays} days
              </div>
              <h3 className="mt-2 max-w-lg font-display text-3xl font-bold text-white md:text-5xl">{hero.title}</h3>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <div className="text-xs tracking-widest text-white/50 uppercase">Deal ends in</div>
                  <Countdown to={hero.offerEndsAt!} className="mt-2" />
                </div>
                <div className="text-right">
                  <Price inr={hero.originalPrice!} className="text-sm text-white/40 line-through" />
                  <div className="flex items-center gap-3">
                    <Price inr={hero.price} className="font-display text-4xl font-bold text-white" />
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink-950 transition group-hover:rotate-45">
                      <ArrowUpRight />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </Reveal>
        <div className="flex flex-col gap-4">
          {rest.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.08}>
              <Link href={`/packages/${d.slug}`} className="group card flex items-center gap-4 p-3 transition hover:border-white/25 hover:bg-ink-800">
                <div className="relative h-28 w-32 shrink-0 overflow-hidden rounded-2xl">
                  <SmartImage src={d.coverImage} alt={d.title} label={d.destinationName} width={400} className="h-full w-full transition duration-700 group-hover:scale-110" />
                  <span className="absolute top-2 left-2 rounded-full bg-sunset px-2 py-0.5 text-[10px] font-bold text-ink-950">-{discountPct(d.price, d.originalPrice)}%</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-white/50">
                    {d.destinationName} · {d.durationDays}D
                  </div>
                  <div className="truncate font-display text-lg font-bold text-white">{d.title}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Price inr={d.price} className="font-bold text-sun-300" />
                    <Price inr={d.originalPrice!} className="text-xs text-white/35 line-through" />
                  </div>
                  <div className="mt-1.5 text-[11px] font-semibold text-coral-400">
                    ⏳ <Countdown to={d.offerEndsAt!} compact />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
