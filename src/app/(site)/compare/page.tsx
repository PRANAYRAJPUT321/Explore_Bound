import { Check, Minus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CompareSync, EmptyCompare, RemoveFromCompare } from "@/components/compare/CompareClient";
import { PageHero } from "@/components/ui/PageHero";
import { Price } from "@/components/ui/Price";
import { SmartImage } from "@/components/ui/SmartImage";
import { Stars } from "@/components/ui/Stars";
import { getPackagesForCompare } from "@/db/queries";
import { themeLabel } from "@/lib/site";

export const metadata: Metadata = { title: "Compare packages", robots: { index: false } };

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const ids = (((await searchParams).ids ?? "").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0)).slice(0, 3);
  const rows = await getPackagesForCompare(ids);
  const minPrice = Math.min(...rows.map((r) => r.price));
  const maxRating = Math.max(...rows.map((r) => r.rating));

  const lines: { label: string; render: (p: (typeof rows)[number]) => React.ReactNode }[] = [
    { label: "Price / person", render: (p) => <span className={p.price === minPrice && rows.length > 1 ? "font-bold text-aqua-300" : "font-bold"}><Price inr={p.price} />{p.price === minPrice && rows.length > 1 ? " · best value" : ""}</span> },
    { label: "Duration", render: (p) => `${p.durationDays} days / ${p.durationNights} nights` },
    { label: "Destination", render: (p) => `${p.destination.name}, ${p.destination.country}` },
    { label: "Route", render: (p) => p.route.join(" → ") },
    { label: "Rating", render: (p) => (p.reviewCount ? <span className={`flex items-center gap-2 ${p.rating === maxRating && rows.length > 1 ? "text-sun-300" : ""}`}><Stars value={p.rating} size={12} /> {p.rating.toFixed(1)} ({p.reviewCount})</span> : "New") },
    { label: "Trip style", render: (p) => p.themes.map(themeLabel).join(", ") },
    { label: "Difficulty", render: (p) => <span className="capitalize">{p.difficulty}</span> },
    { label: "Group size", render: (p) => `Up to ${p.groupSizeMax}` },
    { label: "Group tour", render: (p) => (p.isGroupTour ? <Check className="text-aqua-400" size={18} /> : <Minus className="text-white/30" size={18} />) },
    { label: "Next departure", render: (p) => (p.departures[0] ? new Date(`${p.departures[0].startDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Any date") },
    { label: "Best time", render: (p) => p.destination.bestTime },
    { label: "Visa", render: (p) => p.destination.visaInfo },
    {
      label: "Inclusions",
      render: (p) => (
        <ul className="space-y-1.5">
          {p.inclusions.map((x) => (
            <li key={x} className="flex gap-2">
              <Check size={14} className="mt-0.5 shrink-0 text-aqua-400" /> {x}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "Highlights",
      render: (p) => (
        <ul className="space-y-1.5">
          {p.highlights.map((x) => (
            <li key={x}>✦ {x}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <>
      <CompareSync ids={rows.map((r) => r.id)} />
      <PageHero eyebrow="Compare" title="Side by side," highlight="crystal clear." subtitle="Compare up to three packages on price, inclusions, duration and more." />
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        {rows.length === 0 ? (
          <EmptyCompare />
        ) : (
          <div className="no-scrollbar overflow-x-auto" data-lenis-prevent>
            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr>
                  <th className="w-44" />
                  {rows.map((p) => (
                    <th key={p.id} className="p-2 align-top">
                      <div className="card relative overflow-hidden">
                        <RemoveFromCompare id={p.id} />
                        <div className="h-36">
                          <SmartImage src={p.coverImage} alt={p.title} label={p.destination.name} width={600} className="h-full w-full" />
                        </div>
                        <div className="p-4">
                          <div className="font-display text-lg leading-snug font-bold">{p.title}</div>
                          <Link href={`/packages/${p.slug}`} className="btn-primary mt-3 w-full !py-2.5 text-xs">
                            View & book
                          </Link>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.label} className="align-top">
                    <td className="border-t border-white/10 py-4 pr-4 text-xs font-bold tracking-widest text-white/45 uppercase">{l.label}</td>
                    {rows.map((p) => (
                      <td key={p.id} className="border-t border-white/10 p-4 text-white/80">
                        {l.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
