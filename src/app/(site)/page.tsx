import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { Deals } from "@/components/home/Deals";
import { DestinationWall } from "@/components/home/DestinationWall";
import { FaqCallback } from "@/components/home/FaqCallback";
import { GroupDepartures } from "@/components/home/GroupDepartures";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Marquee } from "@/components/home/Marquee";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { Testimonials3D } from "@/components/home/Testimonials3D";
import { ThemesBento, type ThemeTile } from "@/components/home/ThemesBento";
import { WhyUs } from "@/components/home/WhyUs";
import {
  getDeals,
  getFeaturedPackages,
  getPackagesByCategory,
  getSiteRating,
  getTestimonials,
  getUpcomingDepartures,
  listDestinations,
  listPackages,
} from "@/db/queries";
import { faqs, site, themes } from "@/lib/site";

export default async function HomePage() {
  const [destinations, rating, departures, featured, domestic, international, deals, testimonials, all] = await Promise.all([
    listDestinations(),
    getSiteRating(),
    getUpcomingDepartures(6),
    getFeaturedPackages(1),
    getPackagesByCategory("domestic", 6),
    getPackagesByCategory("international", 6),
    getDeals(4),
    getTestimonials(10),
    listPackages({}),
  ]);

  const markers = destinations.map((d) => ({ slug: d.slug, name: d.name, lat: d.lat, lng: d.lng, region: d.region, tagline: d.tagline }));
  const dep = departures[0];
  const spot = featured[0];

  const tiles: ThemeTile[] = themes.map((t) => {
    const matches = all.filter((p) => p.themes.includes(t.id));
    return { id: t.id, count: matches.length, image: matches[0]?.coverImage ?? "" };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: site.name,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    address: site.address,
    ...(rating.total > 0 && { aggregateRating: { "@type": "AggregateRating", ratingValue: rating.average, reviewCount: rating.total } }),
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero
        markers={markers}
        rating={rating}
        nextDeparture={dep ? { title: dep.title, slug: dep.slug, startDate: dep.startDate, seatsLeft: dep.totalSeats - dep.bookedSeats } : null}
        spotlight={spot ? { title: spot.title, slug: spot.slug, price: spot.price, destination: spot.destinationName } : null}
      />
      <Marquee items={destinations.map((d) => d.name)} />
      <RecentlyViewed />
      <CategoryShowcase domestic={domestic} international={international} />
      <ThemesBento tiles={tiles} />
      <Deals deals={deals} />
      <HowItWorks />
      <GroupDepartures departures={departures} />
      <DestinationWall destinations={destinations} />
      <WhyUs />
      <Testimonials3D items={testimonials} average={rating.average} total={rating.total} />
      <FaqCallback />
    </>
  );
}
