import type { Metadata } from "next";
import { BookingLookup } from "@/components/booking/BookingLookup";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = { title: "Manage my booking", robots: { index: false } };

export default async function MyBookingPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return (
    <>
      <PageHero eyebrow="Manage booking" title="Track your" highlight="journey." subtitle="Check status, payments and trip details any time — just your booking reference and email." />
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <BookingLookup initialRef={ref?.slice(0, 20)} />
      </section>
    </>
  );
}
