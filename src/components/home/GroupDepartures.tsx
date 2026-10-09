import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartImage } from "@/components/ui/SmartImage";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import type { UpcomingDeparture } from "@/db/queries";
import { cn, formatDate } from "@/lib/utils";

export function DepartureCard({ d }: { d: UpcomingDeparture }) {
  const left = d.totalSeats - d.bookedSeats;
  const pct = Math.round((d.bookedSeats / d.totalSeats) * 100);
  const date = new Date(`${d.startDate}T00:00:00`);
  const urgent = left <= 5;
  return (
    <Link href={`/packages/${d.slug}?departure=${d.id}`} className="group card relative flex h-full flex-col overflow-hidden transition duration-500 hover:-translate-y-1 hover:border-white/25">
      <div className="relative h-44 overflow-hidden">
        <SmartImage src={d.coverImage} alt={d.title} label={d.destinationName} width={700} className="h-full w-full transition duration-[1.4s] group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-850 to-transparent" />
        <div className="glass-strong absolute top-4 left-4 flex flex-col items-center rounded-2xl px-3 py-2 leading-none">
          <span className="font-display text-2xl font-bold">{date.getDate()}</span>
          <span className="mt-1 text-[10px] font-bold tracking-widest text-sun-300 uppercase">{date.toLocaleString("en-IN", { month: "short" })}</span>
          <span className="text-[10px] text-white/50">{date.getFullYear()}</span>
        </div>
        {urgent && <span className="absolute top-4 right-4 animate-pulse rounded-full bg-coral-500 px-2.5 py-1 text-[10px] font-bold text-white">Only {left} left!</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs text-white/50">
          {d.destinationName} · {d.durationDays} days · {d.difficulty}
        </div>
        <h3 className="mt-1 font-display text-xl font-bold text-white">{d.title}</h3>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="flex items-center gap-1 text-white/60">
              <Users size={12} /> {d.bookedSeats}/{d.totalSeats} booked
            </span>
            <span className={cn("font-semibold", urgent ? "text-coral-400" : "text-aqua-300")}>{left} seats left</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className={cn("h-full rounded-full", urgent ? "bg-coral-500" : "bg-lagoon")} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-sm text-white/50">
            from <Price inr={d.price ?? d.basePrice} className="font-display text-xl font-bold text-white" />
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-sun-300 transition group-hover:gap-2">
            Reserve <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function GroupDepartures({ departures }: { departures: UpcomingDeparture[] }) {
  if (!departures.length) return null;
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 md:px-8">
      <SectionHeading eyebrow="Fixed departures" title="Travel solo," highlight="never alone." subtitle="Small-group tours with a dedicated tour leader. Seats update live — when they're gone, they're gone.">
        <Link href="/group-tours" className="btn-ghost shrink-0">
          All departures <ArrowRight size={16} />
        </Link>
      </SectionHeading>
      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {departures.map((d) => (
          <StaggerItem key={d.id} className="h-full">
            <DepartureCard d={d} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
