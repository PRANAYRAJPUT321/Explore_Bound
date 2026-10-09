import type { Metadata } from "next";
import { DestinationExplorer } from "@/components/destinations/DestinationExplorer";
import { PageHero } from "@/components/ui/PageHero";
import { listDestinations } from "@/db/queries";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Explore every Explore Bound destination on an interactive 3D globe — India and international.",
};

export default async function DestinationsPage() {
  const destinations = await listDestinations();
  return (
    <>
      <PageHero eyebrow="Destinations" title="Spin the globe." highlight="Pick your story." subtitle="Hover any destination to fly there on the globe. Click to see packages, best time to visit, weather and visa info." />
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <DestinationExplorer destinations={destinations} />
      </section>
    </>
  );
}
