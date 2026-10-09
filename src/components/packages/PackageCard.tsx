"use client";

import { ArrowUpRight, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { SmartImage } from "@/components/ui/SmartImage";
import { Stars } from "@/components/ui/Stars";
import { TiltCard } from "@/components/ui/TiltCard";
import type { PackageCard as PackageCardData } from "@/db/queries";
import { themeLabel } from "@/lib/site";
import { cn, discountPct } from "@/lib/utils";
import { Countdown } from "./Countdown";
import { CompareButton, WishlistButton } from "./PackageActions";

export function PackageCard({ pkg, priority, className }: { pkg: PackageCardData; priority?: boolean; className?: string }) {
  const off = discountPct(pkg.price, pkg.originalPrice);
  const offerLive = pkg.offerEndsAt && new Date(pkg.offerEndsAt).getTime() > Date.now();
  return (
    <TiltCard className={cn("group h-full rounded-[1.75rem]", className)} max={7}>
      <article className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-850 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)] transition-colors duration-500 group-hover:border-white/20">
        <Link href={`/packages/${pkg.slug}`} className="absolute inset-0 z-10" aria-label={pkg.title} />
        <div className="relative aspect-[4/3.1] overflow-hidden">
          <SmartImage
            src={pkg.coverImage}
            alt={pkg.title}
            label={pkg.destinationName}
            width={800}
            priority={priority}
            className="h-full w-full transition duration-[1.4s] ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-850 via-ink-850/10 to-ink-950/30" />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 [transform:translateZ(30px)]">
            {off > 0 && <span className="rounded-full bg-sunset px-2.5 py-1 text-[11px] font-bold text-ink-950">{off}% OFF</span>}
            {pkg.isGroupTour && (
              <span className="flex items-center gap-1 rounded-full bg-aqua-400/90 px-2.5 py-1 text-[11px] font-bold text-ink-950">
                <Users size={11} /> Group tour
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3 z-20">
            <WishlistButton id={pkg.id} title={pkg.title} />
          </div>
          <div className="absolute right-4 bottom-3 left-4 flex items-end justify-between gap-2 [transform:translateZ(40px)]">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-white drop-shadow">
              <MapPin size={14} className={pkg.category === "domestic" ? "text-sun-400" : "text-aqua-400"} />
              {pkg.destinationName}
            </span>
            <span className="glass flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white">
              <Clock size={11} /> {pkg.durationDays}D / {pkg.durationNights}N
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 font-display text-xl leading-snug font-bold text-white transition group-hover:text-sun-200">{pkg.title}</h3>
          <p className="mt-1.5 line-clamp-1 text-xs text-white/45">{pkg.route.join(" → ")}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {pkg.reviewCount > 0 ? (
              <span className="flex items-center gap-1.5 text-xs text-white/70">
                <Stars value={pkg.rating} size={12} /> {pkg.rating.toFixed(1)} <span className="text-white/40">({pkg.reviewCount})</span>
              </span>
            ) : (
              <span className="text-xs font-medium text-aqua-300">New ✦</span>
            )}
            {pkg.themes.slice(0, 2).map((t) => (
              <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/60">
                {themeLabel(t)}
              </span>
            ))}
          </div>
          {offerLive && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-coral-500/10 px-3 py-1.5 text-[11px] font-semibold text-coral-400">
              ⏳ Deal ends in <Countdown to={pkg.offerEndsAt!} compact />
            </div>
          )}
          <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/5 pt-4">
            <div>
              <div className="text-[10px] tracking-widest text-white/40 uppercase">Starting from</div>
              <div className="flex items-baseline gap-2">
                <Price inr={pkg.price} className="font-display text-2xl font-bold text-white" />
                {off > 0 && <Price inr={pkg.originalPrice!} className="text-xs text-white/35 line-through" />}
              </div>
              <div className="text-[10px] text-white/40">per person</div>
            </div>
            <div className="relative z-20 flex items-center gap-2">
              <CompareButton id={pkg.id} title={pkg.title} />
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-950 transition duration-500 group-hover:rotate-45 group-hover:bg-sunset">
                <ArrowUpRight size={18} />
              </span>
            </div>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
