import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SmartImage } from "@/components/ui/SmartImage";
import type { DestinationSummary } from "@/db/queries";

/** A tilted 3D wall of destination cards drifting in opposite directions. */
export function DestinationWall({ destinations }: { destinations: DestinationSummary[] }) {
  const cols = [0, 1, 2, 3].map((c) => destinations.filter((_, i) => i % 4 === c));
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="relative z-10">
          <span className="eyebrow">✦ {destinations.length} destinations</span>
          <h2 className="mt-4 text-5xl leading-[1] font-bold md:text-7xl">
            One planet.
            <br />
            <span className="text-gradient">Endless</span> stories.
          </h2>
          <p className="mt-6 max-w-md text-white/60 md:text-lg">
            Snow deserts and coral reefs, ancient temples and neon skylines. Explore every destination on our interactive 3D globe.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/destinations" className="btn-primary">
              Open the 3D globe <ArrowUpRight size={16} />
            </Link>
            <Link href="/packages" className="btn-ghost">
              Browse packages
            </Link>
          </div>
        </div>
        <div className="relative h-[560px] [perspective:1400px]">
          <div className="mask-fade-y absolute inset-0">
            <div className="grid h-[150%] -translate-y-[15%] grid-cols-4 gap-4 [transform:rotateX(22deg)_rotateZ(-12deg)_rotateY(-8deg)] [transform-style:preserve-3d]">
              {cols.map((col, ci) => (
                <div key={ci} className="overflow-hidden">
                  <div className={`flex flex-col gap-4 ${ci % 2 ? "animate-scroll-y-reverse" : "animate-scroll-y"}`} style={{ ["--scroll-duration" as string]: `${38 + ci * 7}s` }}>
                    {[...col, ...col].map((d, i) => (
                      <Link key={`${d.slug}-${i}`} href={`/destinations/${d.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-2xl border border-white/10" tabIndex={i >= col.length ? -1 : 0}>
                        <SmartImage src={d.heroImage} alt={d.name} label={d.name} width={400} className="h-full w-full transition duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 to-transparent" />
                        <div className="absolute bottom-2 left-3 right-2">
                          <div className="truncate text-sm font-bold text-white">{d.name}</div>
                          <div className="truncate text-[10px] text-white/60">{d.country}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
