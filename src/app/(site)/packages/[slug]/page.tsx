import { CalendarRange, CheckCircle2, ChevronRight, Clock, CloudSun, Gauge, MapPin, Printer, Stamp, Users, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { BookingWidget } from "@/components/packages/BookingWidget";
import { EmiCalculator } from "@/components/packages/EmiCalculator";
import { Gallery } from "@/components/packages/Gallery";
import { ItineraryTimeline } from "@/components/packages/ItineraryTimeline";
import { MobileBookBar } from "@/components/packages/MobileBookBar";
import { CompareButton, ShareButton, WishlistButton } from "@/components/packages/PackageActions";
import { PackageCard } from "@/components/packages/PackageCard";
import { SectionNav } from "@/components/packages/SectionNav";
import { TrackView } from "@/components/packages/TrackView";
import { RatingSummary } from "@/components/reviews/RatingSummary";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Globe } from "@/components/three/Globe";
import { Reveal } from "@/components/ui/Reveal";
import { Stars } from "@/components/ui/Stars";
import { getPackageBySlug, getReviewSummary, getSimilarPackages } from "@/db/queries";
import { site, themeLabel } from "@/lib/site";
import { sized } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ departure?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const pkg = await getPackageBySlug((await params).slug);
  if (!pkg) return { title: "Package not found" };
  return {
    title: `${pkg.title} — ${pkg.durationDays}D/${pkg.durationNights}N`,
    description: pkg.summary,
    openGraph: { title: pkg.title, description: pkg.summary, images: [sized(pkg.coverImage, 1200)] },
  };
}

export default async function PackagePage({ params, searchParams }: Params) {
  const { slug } = await params;
  const { departure } = await searchParams;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();
  const [similar, summary] = await Promise.all([getSimilarPackages(pkg), getReviewSummary(pkg.id)]);
  const dest = pkg.destination;

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "itinerary", label: "Itinerary" },
    { id: "inclusions", label: "Inclusions" },
    ...(pkg.departures.length ? [{ id: "departures", label: "Departures" }] : []),
    { id: "know", label: "Good to know" },
    { id: "reviews", label: `Reviews${summary.total ? ` (${summary.total})` : ""}` },
    { id: "enquire", label: "Enquire" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.summary,
    image: sized(pkg.coverImage, 1200),
    itinerary: { "@type": "ItemList", itemListElement: pkg.itinerary.map((d) => ({ "@type": "ListItem", position: d.day, name: d.title })) },
    offers: { "@type": "Offer", price: pkg.price, priceCurrency: "INR", availability: "https://schema.org/InStock" },
    ...(summary.total && { aggregateRating: { "@type": "AggregateRating", ratingValue: summary.average, reviewCount: summary.total } }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <TrackView id={pkg.id} />
      <section className="mx-auto max-w-7xl px-4 pt-28 md:px-8 md:pt-32">
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-white/45" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/packages" className="hover:text-white">
            Packages
          </Link>
          <ChevronRight size={12} />
          <Link href={`/destinations/${dest.slug}`} className="hover:text-white">
            {dest.name}
          </Link>
          <ChevronRight size={12} />
          <span className="text-white/70">{pkg.title}</span>
        </nav>
        <div className="relative">
          <Gallery images={[pkg.coverImage, ...pkg.gallery]} title={pkg.title} />
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0">
          <Reveal>
            <div className="flex flex-wrap gap-2">
              <span className={`chip ${pkg.category === "domestic" ? "!text-sun-300" : "!text-aqua-300"}`}>
                <MapPin size={12} /> {dest.name}, {dest.country}
              </span>
              {pkg.isGroupTour && (
                <span className="chip !text-aqua-300">
                  <Users size={12} /> Group tour
                </span>
              )}
              {pkg.themes.map((t) => (
                <Link key={t} href={`/packages?theme=${t}`} className="chip hover:text-white">
                  {themeLabel(t)}
                </Link>
              ))}
            </div>
            <h1 className="mt-4 text-4xl leading-[1.05] font-extrabold md:text-6xl">{pkg.title}</h1>
            <p className="mt-3 text-lg text-white/60">{pkg.summary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
              {summary.total > 0 && (
                <a href="#reviews" className="flex items-center gap-2 hover:text-white">
                  <Stars value={summary.average} /> <b className="text-white">{summary.average.toFixed(1)}</b> ({summary.total} reviews)
                </a>
              )}
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-sun-400" /> {pkg.durationDays} days / {pkg.durationNights} nights
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={15} className="text-sun-400" /> Max {pkg.groupSizeMax} travellers
              </span>
              <span className="flex items-center gap-1.5 capitalize">
                <Gauge size={15} className="text-sun-400" /> {pkg.difficulty}
              </span>
            </div>
            <div className="no-print mt-6 flex flex-wrap gap-2">
              <WishlistButton id={pkg.id} title={pkg.title} withLabel className="!px-4 !py-2.5" />
              <CompareButton id={pkg.id} title={pkg.title} withLabel className="!px-4 !py-2.5" />
              <ShareButton title={pkg.title} text={pkg.summary} className="!px-4 !py-2.5" />
              <Link href={`/itinerary/${pkg.slug}`} target="_blank" className="btn-ghost !px-4 !py-2.5">
                <Printer size={16} /> Itinerary PDF
              </Link>
            </div>
          </Reveal>

          <div className="mt-10">
            <SectionNav sections={sections} />
          </div>

          <div id="overview" className="scroll-mt-40 pt-12">
            <h2 className="font-display text-3xl font-bold">Overview</h2>
            <p className="mt-4 leading-relaxed text-white/70">{pkg.overview}</p>
            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-4 text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Your route</div>
              <div className="flex flex-wrap items-center gap-2">
                {pkg.route.map((city, i) => (
                  <span key={city} className="flex items-center gap-2">
                    <span className="rounded-full bg-white/5 px-3.5 py-1.5 text-sm font-semibold ring-1 ring-white/10">
                      <span className="mr-1.5 text-sun-400">{String(i + 1).padStart(2, "0")}</span>
                      {city}
                    </span>
                    {i < pkg.route.length - 1 && <span className="h-px w-6 bg-gradient-to-r from-sun-400 to-aqua-400" />}
                  </span>
                ))}
              </div>
            </div>
            <h3 className="mt-10 font-display text-xl font-bold">Trip highlights</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {pkg.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-4 text-sm text-white/80">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sunset text-xs text-ink-950">✦</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div id="itinerary" className="scroll-mt-40 pt-16">
            <h2 className="font-display text-3xl font-bold">Day-by-day itinerary</h2>
            <p className="mt-2 text-sm text-white/50">Fully flexible — ask us to add, remove or slow down any day.</p>
            <div className="mt-6">
              <ItineraryTimeline days={pkg.itinerary} />
            </div>
          </div>

          <div id="inclusions" className="grid scroll-mt-40 gap-6 pt-16 md:grid-cols-2">
            <div className="card p-6">
              <h3 className="flex items-center gap-2 font-display text-xl font-bold text-aqua-300">
                <CheckCircle2 size={20} /> What&apos;s included
              </h3>
              <ul className="mt-4 space-y-3">
                {pkg.inclusions.map((x) => (
                  <li key={x} className="flex gap-3 text-sm text-white/75">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-aqua-400" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="flex items-center gap-2 font-display text-xl font-bold text-coral-400">
                <XCircle size={20} /> Not included
              </h3>
              <ul className="mt-4 space-y-3">
                {pkg.exclusions.map((x) => (
                  <li key={x} className="flex gap-3 text-sm text-white/60">
                    <XCircle size={16} className="mt-0.5 shrink-0 text-coral-500/80" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {pkg.departures.length > 0 && (
            <div id="departures" className="scroll-mt-40 pt-16">
              <h2 className="font-display text-3xl font-bold">Upcoming departures</h2>
              <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
                {pkg.departures.map((d) => {
                  const left = d.totalSeats - d.bookedSeats;
                  return (
                    <div key={d.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 px-5 py-4 last:border-0">
                      <div className="flex items-center gap-3">
                        <CalendarRange size={18} className="text-sun-400" />
                        <span className="font-semibold">{new Date(`${d.startDate}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-white/10 sm:block">
                          <div className="h-full bg-lagoon" style={{ width: `${(d.bookedSeats / d.totalSeats) * 100}%` }} />
                        </div>
                        <span className={`text-sm font-semibold ${left <= 5 ? "text-coral-400" : "text-aqua-300"}`}>{left > 0 ? `${left} seats left` : "Sold out"}</span>
                        {left > 0 && (
                          <Link href={`/book/${pkg.slug}?departure=${d.id}`} className="btn-primary !px-4 !py-2 text-xs">
                            Reserve
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div id="know" className="scroll-mt-40 pt-16">
            <h2 className="font-display text-3xl font-bold">Good to know</h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard icon={<CloudSun size={18} />} title="Best time to visit" text={dest.bestTime} />
                <InfoCard icon={<CloudSun size={18} />} title="Weather" text={dest.climate} />
                <InfoCard icon={<Stamp size={18} />} title="Visa & permits" text={dest.visaInfo} className="sm:col-span-2" />
              </div>
              <div className="relative h-72 overflow-hidden rounded-3xl border border-white/10 bg-ink-900">
                <Globe
                  markers={[{ slug: dest.slug, name: dest.name, lat: dest.lat, lng: dest.lng, region: dest.region, tagline: dest.tagline }]}
                  hub={site.hub}
                  focus={dest.slug}
                  showPlane={false}
                  showStars={false}
                  cameraZ={3.1}
                  className="h-full w-full"
                />
                <div className="pointer-events-none absolute bottom-3 left-4 text-xs text-white/50">📍 {dest.name} on the globe</div>
              </div>
            </div>
            <div className="mt-6">
              <EmiCalculator price={pkg.price} />
            </div>
          </div>

          <div id="reviews" className="scroll-mt-40 pt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-bold">Traveller reviews</h2>
              <Link href={`/reviews?package=${pkg.id}#write`} className="btn-ghost !py-2.5">
                Write a review
              </Link>
            </div>
            {summary.total > 0 ? (
              <>
                <div className="card mt-6 p-6">
                  <RatingSummary summary={summary} />
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {pkg.reviews.map((r) => (
                    <ReviewCard key={r.id} r={r} showPackage={false} />
                  ))}
                </div>
              </>
            ) : (
              <p className="card mt-6 p-6 text-white/60">No reviews yet — be the first to travel and share your story!</p>
            )}
          </div>

          <div id="enquire" className="scroll-mt-40 pt-16">
            <div className="grain relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(90%_80%_at_0%_0%,rgb(255_138_61/0.15),transparent_60%),#0d1427] p-6 md:p-8">
              <h2 className="font-display text-3xl font-bold">Have a question or want it customised?</h2>
              <p className="mt-2 mb-6 text-white/60">Our trip experts reply within 2 working hours.</p>
              <EnquiryForm type="package" packageId={pkg.id} packageTitle={pkg.title} />
            </div>
          </div>
        </div>

        <aside className="no-print hidden lg:block">
          <div className="sticky top-28">
            <BookingWidget
              pkg={{ id: pkg.id, slug: pkg.slug, title: pkg.title, price: pkg.price, originalPrice: pkg.originalPrice, offerEndsAt: pkg.offerEndsAt, durationDays: pkg.durationDays }}
              departures={pkg.departures.map((d) => ({ id: d.id, startDate: d.startDate, totalSeats: d.totalSeats, bookedSeats: d.bookedSeats, price: d.price }))}
              initialDeparture={Number(departure) || undefined}
            />
          </div>
        </aside>
      </section>

      {similar.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-24 md:px-8">
          <h2 className="mb-8 font-display text-3xl font-bold md:text-4xl">
            You might also <span className="text-gradient">love</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
        </section>
      )}
      <RecentlyViewed exclude={pkg.id} title="Recently viewed" />
      <MobileBookBar slug={pkg.slug} price={pkg.price} />
    </>
  );
}

function InfoCard({ icon, title, text, className }: { icon: React.ReactNode; title: string; text: string; className?: string }) {
  return (
    <div className={`card p-5 ${className ?? ""}`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-sun-300">
        {icon} {title}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{text || "Ask our team for details."}</p>
    </div>
  );
}
