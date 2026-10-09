import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPackageBySlug } from "@/db/queries";
import { site } from "@/lib/site";
import { formatINR, sized } from "@/lib/utils";
import { PrintBar } from "./PrintBar";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const pkg = await getPackageBySlug((await params).slug);
  return { title: pkg ? `Itinerary — ${pkg.title}` : "Itinerary", robots: { index: false } };
}

export default async function ItineraryPrint({ params }: Params) {
  const pkg = await getPackageBySlug((await params).slug);
  if (!pkg) notFound();
  return (
    <div className="min-h-dvh bg-neutral-100 text-neutral-900 print:bg-white">
      <PrintBar slug={pkg.slug} />
      <article className="mx-auto my-8 max-w-3xl bg-white p-10 shadow-xl print:my-0 print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between border-b-4 border-orange-500 pb-5">
          <div>
            <div className="font-display text-2xl font-extrabold text-neutral-900">{site.name}</div>
            <div className="text-xs tracking-widest text-orange-600 uppercase">{site.tagline}</div>
          </div>
          <div className="text-right text-xs leading-relaxed text-neutral-600">
            {site.phone}
            <br />
            {site.email}
            <br />
            {site.url.replace(/^https?:\/\//, "")}
          </div>
        </header>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sized(pkg.coverImage, 1400)} alt="" className="mt-6 h-56 w-full rounded-xl object-cover" />

        <h1 className="mt-6 font-display text-4xl leading-tight font-extrabold text-neutral-900">{pkg.title}</h1>
        <p className="mt-2 text-neutral-600">{pkg.summary}</p>

        <div className="mt-5 grid grid-cols-4 gap-3 text-center text-sm">
          {[
            ["Duration", `${pkg.durationDays}D / ${pkg.durationNights}N`],
            ["Destination", pkg.destination.name],
            ["From", `${formatINR(pkg.price)} pp`],
            ["Best time", pkg.destination.bestTime.split("(")[0]],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-orange-50 p-3">
              <div className="text-[10px] font-bold tracking-widest text-orange-600 uppercase">{k}</div>
              <div className="mt-1 font-semibold text-neutral-800">{v}</div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-sm leading-relaxed text-neutral-700">{pkg.overview}</p>
        <p className="mt-3 text-sm text-neutral-700">
          <b>Route:</b> {pkg.route.join(" → ")}
        </p>

        <h2 className="mt-8 border-b border-neutral-200 pb-2 font-display text-2xl font-bold">Day-by-day itinerary</h2>
        <ol className="mt-4 space-y-4">
          {pkg.itinerary.map((d) => (
            <li key={d.day} className="flex gap-4 break-inside-avoid">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">{d.day}</span>
              <div>
                <h3 className="font-semibold text-neutral-900">{d.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-700">{d.description}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {d.meals ? `Meals: ${d.meals}` : ""}
                  {d.stay ? ` · Stay: ${d.stay}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid grid-cols-2 gap-6 break-inside-avoid">
          <div>
            <h2 className="font-display text-lg font-bold text-emerald-700">Inclusions</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
              {pkg.inclusions.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-red-700">Exclusions</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
              {pkg.exclusions.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="mt-10 rounded-xl bg-neutral-900 p-5 text-sm text-white">
          <b>Ready to go?</b> Book online at {site.url.replace(/^https?:\/\//, "")}/packages/{pkg.slug} or call {site.phone}. Prices are per person on twin sharing and subject to availability; GST extra.
        </footer>
      </article>
    </div>
  );
}
