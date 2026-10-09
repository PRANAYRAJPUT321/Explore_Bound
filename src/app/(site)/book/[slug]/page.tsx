import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { getPackageBySlug } from "@/db/queries";
import type { TierId } from "@/lib/pricing";

export const metadata: Metadata = { title: "Book your trip", robots: { index: false } };

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

const clamp = (v: string | undefined, min: number, max: number, d: number) => {
  const n = Number(v);
  return Number.isInteger(n) ? Math.min(max, Math.max(min, n)) : d;
};

export default async function BookPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();
  const tier = (["standard", "deluxe", "luxury"].includes(sp.tier ?? "") ? sp.tier : "standard") as TierId;
  return (
    <section className="mx-auto max-w-7xl px-4 pt-28 pb-16 md:px-8 md:pt-32">
      <div className="mb-8">
        <span className="eyebrow">✦ Secure booking</span>
        <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">
          Almost there — <span className="text-gradient">let&apos;s lock it in.</span>
        </h1>
      </div>
      <BookingFlow
        pkg={{
          id: pkg.id,
          slug: pkg.slug,
          title: pkg.title,
          price: pkg.price,
          coverImage: pkg.coverImage,
          durationDays: pkg.durationDays,
          durationNights: pkg.durationNights,
          destination: pkg.destination.name,
          route: pkg.route,
        }}
        departures={pkg.departures.map((d) => ({ id: d.id, startDate: d.startDate, totalSeats: d.totalSeats, bookedSeats: d.bookedSeats, price: d.price }))}
        initial={{
          tier,
          adults: clamp(sp.adults, 1, 20, 2),
          children: clamp(sp.children, 0, 10, 0),
          infants: clamp(sp.infants, 0, 6, 0),
          departure: Number(sp.departure) || undefined,
          date: /^\d{4}-\d{2}-\d{2}$/.test(sp.date ?? "") ? sp.date : undefined,
        }}
      />
    </section>
  );
}
