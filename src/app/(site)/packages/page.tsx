import { Compass } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActiveFilterChips, Filters, SortSelect } from "@/components/packages/Filters";
import { PackageCard } from "@/components/packages/PackageCard";
import { PageHero } from "@/components/ui/PageHero";
import { getPriceBounds, listDestinations, listPackages } from "@/db/queries";
import { themeLabel } from "@/lib/site";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tour Packages",
  description: "Browse domestic & international tour packages, honeymoons and group tours. Filter by destination, budget, duration and travel style.",
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function PackagesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const filters = {
    q: one(sp.q).slice(0, 60),
    type: one(sp.type),
    theme: one(sp.theme),
    destination: one(sp.destination),
    minPrice: Number(one(sp.minPrice)) || undefined,
    maxPrice: Number(one(sp.maxPrice)) || undefined,
    duration: one(sp.duration),
    group: one(sp.group) === "1",
    sort: one(sp.sort),
  };
  const [results, destinations, bounds] = await Promise.all([listPackages(filters), listDestinations(), getPriceBounds()]);

  const destName = destinations.find((d) => d.slug === filters.destination)?.name;
  const chips = [
    filters.q && { key: "q", label: `“${filters.q}”` },
    filters.type && { key: "type", label: filters.type === "domestic" ? "India" : "International" },
    destName && { key: "destination", label: destName },
    filters.theme && { key: "theme", label: themeLabel(filters.theme) },
    filters.duration && { key: "duration", label: `${filters.duration.replace("-", "–")} days` },
    filters.maxPrice && { key: "maxPrice", label: `Under ${formatINR(filters.maxPrice)}` },
    filters.minPrice && { key: "minPrice", label: `Over ${formatINR(filters.minPrice)}` },
    filters.group && { key: "group", label: "Group tours" },
  ].filter(Boolean) as { key: string; label: string }[];

  const title = filters.theme ? `${themeLabel(filters.theme)}` : filters.type === "domestic" ? "India" : filters.type === "international" ? "International" : "All";

  return (
    <>
      <PageHero eyebrow="Tour packages" title={`${title} holidays,`} highlight="handcrafted." subtitle="Every package is fully customisable — tweak hotels, add experiences or change the pace. Prices are per person." />
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 md:px-8 lg:grid-cols-[300px_1fr]">
        <Filters destinations={destinations.map((d) => ({ slug: d.slug, name: d.name, region: d.region }))} bounds={bounds} />
        <div>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/60">
                <b className="text-white">{results.length}</b> {results.length === 1 ? "journey" : "journeys"} found
              </p>
              <div className="mt-2">
                <ActiveFilterChips labels={chips} />
              </div>
            </div>
            <SortSelect />
          </div>
          {results.length ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p, i) => (
                <PackageCard key={p.id} pkg={p} priority={i < 3} />
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-center px-6 py-20 text-center">
              <Compass size={48} className="text-sun-400" />
              <h2 className="mt-5 font-display text-3xl font-bold">No trips match… yet</h2>
              <p className="mt-2 max-w-md text-white/60">Try loosening a filter — or let our experts craft a custom itinerary around exactly what you want.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/packages" className="btn-ghost">
                  Clear filters
                </Link>
                <Link href="/plan-my-trip" className="btn-primary">
                  Plan a custom trip
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
