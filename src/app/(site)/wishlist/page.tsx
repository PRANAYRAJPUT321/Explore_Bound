import type { Metadata } from "next";
import { WishlistGrid } from "@/components/compare/WishlistGrid";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = { title: "My wishlist", robots: { index: false } };

export default function WishlistPage() {
  return (
    <>
      <PageHero eyebrow="Wishlist" title="Trips you" highlight="love." subtitle="Your saved packages — compare them, share them, or book the one that's calling you." />
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <WishlistGrid />
      </section>
    </>
  );
}
