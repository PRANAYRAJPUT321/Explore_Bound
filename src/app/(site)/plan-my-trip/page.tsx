import type { Metadata } from "next";
import { TripPlanner } from "@/components/planner/TripPlanner";
import { PageHero } from "@/components/ui/PageHero";
import { listDestinations } from "@/db/queries";

export const metadata: Metadata = {
  title: "Plan My Trip",
  description: "Tell us where, when and how you like to travel — get a free personalised itinerary from an Explore Bound trip designer within 24 hours.",
};

export default async function PlanPage() {
  const destinations = await listDestinations();
  return (
    <>
      <PageHero eyebrow="Custom trip planner" title="Design your" highlight="dream trip." subtitle="Five quick questions. One personalised itinerary from a real trip designer — free, within 24 hours, no obligation." />
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <TripPlanner suggestions={destinations.filter((d) => d.featured).map((d) => d.name)} />
      </section>
    </>
  );
}
