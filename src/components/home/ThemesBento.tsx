import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartImage } from "@/components/ui/SmartImage";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { themes } from "@/lib/site";
import { cn } from "@/lib/utils";

export type ThemeTile = { id: string; count: number; image: string };

const layout: Record<string, string> = {
  honeymoon: "md:col-span-2 md:row-span-2",
  adventure: "md:row-span-2",
  family: "",
  beach: "",
  group: "md:col-span-2",
  pilgrimage: "",
  luxury: "",
  culture: "md:col-span-2",
  friends: "",
  nature: "",
};

export function ThemesBento({ tiles }: { tiles: ThemeTile[] }) {
  const ordered = Object.keys(layout)
    .map((id) => tiles.find((t) => t.id === id))
    .filter((t): t is ThemeTile => Boolean(t && t.count));
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 md:px-8">
      <SectionHeading eyebrow="Travel your way" title="Pick a vibe," highlight="we'll pick the place." subtitle="Every trip style, perfected over thousands of journeys." />
      <Stagger className="grid auto-rows-[220px] grid-flow-dense gap-4 md:grid-cols-4 md:auto-rows-[240px]">
        {ordered.map((t) => {
          const meta = themes.find((x) => x.id === t.id)!;
          return (
            <StaggerItem key={t.id} className={cn("h-full", layout[t.id])}>
              <Link href={`/packages?theme=${t.id}`} className="group shine relative block h-full overflow-hidden rounded-[2rem] border border-white/10">
                <SmartImage src={t.image} alt={meta.label} label={meta.label} width={900} className="absolute inset-0 h-full w-full transition duration-[1.6s] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/30 to-transparent transition group-hover:from-ink-950/80" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                  <div>
                    <div className="text-3xl">{meta.emoji}</div>
                    <h3 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">{meta.label}</h3>
                    <p className="mt-1 max-h-0 overflow-hidden text-sm text-white/70 opacity-0 transition-all duration-500 group-hover:max-h-20 group-hover:opacity-100">{meta.blurb}</p>
                    <span className="mt-2 inline-block text-xs font-semibold tracking-widest text-sun-300 uppercase">
                      {t.count} {t.count === 1 ? "trip" : "trips"}
                    </span>
                  </div>
                  <span className="glass flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-ink-950">
                    <ArrowUpRight size={20} />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
