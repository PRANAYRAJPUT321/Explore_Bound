import { CloudSun, MapPin, Sparkles, Stamp, Sun } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageCard } from "@/components/packages/PackageCard";
import { Globe } from "@/components/three/Globe";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { getDestinationBySlug } from "@/db/queries";
import { site } from "@/lib/site";
import { sized, whatsappLink } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const d = await getDestinationBySlug((await params).slug);
  if (!d) return { title: "Destination not found" };
  return { title: `${d.name} Tour Packages`, description: `${d.tagline}. ${d.description}`, openGraph: { images: [sized(d.heroImage, 1200)] } };
}

export default async function DestinationPage({ params }: Params) {
  const d = await getDestinationBySlug((await params).slug);
  if (!d) notFound();
  return (
    <>
      <section className="grain relative isolate flex min-h-[78vh] items-end overflow-hidden pt-32 pb-16">
        <SmartImage src={d.heroImage} alt={d.name} label={d.name} width={2000} priority className="absolute inset-0 -z-20 h-full w-full scale-105" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/20" />
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
          <Reveal>
            <span className="eyebrow">
              <MapPin size={13} /> {d.country}
            </span>
            <h1 className="mt-5 font-display text-6xl leading-[0.95] font-extrabold md:text-8xl lg:text-9xl">{d.name}</h1>
            <p className="mt-4 text-2xl text-gradient font-display font-semibold md:text-3xl">{d.tagline}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <p className="text-lg leading-relaxed text-white/75 md:text-xl">{d.description}</p>
          <h2 className="mt-10 flex items-center gap-2 font-display text-2xl font-bold">
            <Sparkles className="text-sun-400" /> Don&apos;t miss
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {d.highlights.map((h, i) => (
              <div key={h} className="card flex items-center gap-3 p-4">
                <span className="font-display text-2xl font-bold text-white/20">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-semibold">{h}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Fact icon={<Sun size={16} />} k="Best time" v={d.bestTime} />
            <Fact icon={<CloudSun size={16} />} k="Weather" v={d.climate} />
            <Fact icon={<Stamp size={16} />} k="Visa / permits" v={d.visaInfo} />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative h-[380px] overflow-hidden rounded-[2rem] border border-white/10 bg-ink-900 md:h-[460px]">
            <Globe markers={[{ slug: d.slug, name: d.name, lat: d.lat, lng: d.lng, region: d.region, tagline: d.tagline }]} hub={site.hub} focus={d.slug} navigate={false} className="h-full w-full" />
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-20 md:px-8">
        <h2 className="mb-8 font-display text-3xl font-bold md:text-5xl">
          {d.name} <span className="text-gradient">packages</span>
        </h2>
        {d.packages.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {d.packages.map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center">
            <p className="text-white/65">We&apos;re crafting ready-made trips for {d.name}. Meanwhile, we&apos;ll build one just for you.</p>
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/plan-my-trip" className="btn-primary">
                Plan my {d.name} trip
              </Link>
              <a href={whatsappLink(site.whatsapp, `Hi! I'd like a ${d.name} trip.`)} className="btn-ghost" target="_blank" rel="noreferrer">
                WhatsApp us
              </a>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function Fact({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-sun-300">
        {icon} {k}
      </div>
      <p className="mt-1.5 text-sm text-white/70">{v || "—"}</p>
    </div>
  );
}
