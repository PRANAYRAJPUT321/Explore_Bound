import { CalendarCheck, ShieldCheck, UserRound, Users } from "lucide-react";
import type { Metadata } from "next";
import { DepartureCard } from "@/components/home/GroupDepartures";
import { PageHero } from "@/components/ui/PageHero";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { getUpcomingDepartures } from "@/db/queries";

export const metadata: Metadata = {
  title: "Group Tours & Fixed Departures",
  description: "Join small-group tours with a dedicated tour leader. Live seat availability for Ladakh, Spiti, Char Dham, Europe, Japan, Vietnam, Bhutan and more.",
};

export default async function GroupToursPage() {
  const deps = await getUpcomingDepartures();
  const byMonth = new Map<string, typeof deps>();
  for (const d of deps) {
    const key = new Date(`${d.startDate}T00:00:00`).toLocaleString("en-IN", { month: "long", year: "numeric" });
    byMonth.set(key, [...(byMonth.get(key) ?? []), d]);
  }
  return (
    <>
      <PageHero eyebrow="Group tours" title="Strangers on day one." highlight="Family by the last." subtitle="Fixed-date departures with a tour leader, curated stays and like-minded travellers. Perfect for solo travellers, friends and families.">
        <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-4">
          {[
            [Users, "Small groups"],
            [UserRound, "Tour leader"],
            [ShieldCheck, "Women-friendly"],
            [CalendarCheck, "Guaranteed dates"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof Users;
            return (
              <div key={label as string} className="glass flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold">
                <I size={16} className="text-aqua-300" /> {label as string}
              </div>
            );
          })}
        </div>
      </PageHero>
      <section className="mx-auto max-w-7xl space-y-16 px-5 md:px-8">
        {deps.length === 0 && <p className="card p-10 text-center text-white/60">New departures are being scheduled — check back soon or ask us on WhatsApp.</p>}
        {[...byMonth.entries()].map(([month, list]) => (
          <div key={month}>
            <h2 className="mb-6 flex items-baseline gap-3 font-display text-3xl font-bold">
              {month} <span className="text-sm font-normal text-white/45">{list.length} departure{list.length > 1 ? "s" : ""}</span>
            </h2>
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((d) => (
                <StaggerItem key={d.id} className="h-full">
                  <DepartureCard d={d} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        ))}
      </section>
    </>
  );
}
