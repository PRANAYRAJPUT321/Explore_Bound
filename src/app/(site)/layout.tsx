import { CompareBar } from "@/components/layout/CompareBar";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { listDestinations } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const destinations = (await listDestinations()).map((d) => ({
    slug: d.slug,
    name: d.name,
    region: d.region,
    heroImage: d.heroImage,
    tagline: d.tagline,
  }));
  return (
    <>
      <Navbar destinations={destinations} />
      <main className="relative">{children}</main>
      <Footer destinations={destinations} />
      <FloatingActions />
      <CompareBar />
      <SearchOverlay />
    </>
  );
}
