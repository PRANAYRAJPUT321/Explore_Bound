import { Compass, Heart, Leaf, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { WhyUs } from "@/components/home/WhyUs";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About us",
  description: `${site.name} — a team of travellers crafting immersive domestic and international journeys.`,
};

const values = [
  { icon: Compass, title: "Curiosity first", text: "We travel every route ourselves before we ever sell it." },
  { icon: Heart, title: "Care like family", text: "From your first call to your flight home, someone is always looking out for you." },
  { icon: Leaf, title: "Travel lighter", text: "Local guides, homestays and responsible operators wherever we can." },
  { icon: Sparkles, title: "Moments over checklists", text: "We design for the sunrise you'll never forget, not just the sights you tick off." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="Our story" title="We're Explore Bound." highlight="We live to go further." subtitle="Explore Bound Holidays began with a simple idea: travel planning should feel as exciting as the trip itself. Today we craft journeys across India and the world for honeymooners, families, solo travellers and groups." />
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="card h-full p-6">
                <v.icon className="text-sun-400" size={26} />
                <h2 className="mt-4 font-display text-xl font-bold">{v.title}</h2>
                <p className="mt-2 text-sm text-white/60">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <WhyUs />
      <section className="mx-auto max-w-4xl px-5 text-center md:px-8">
        <h2 className="text-4xl font-bold md:text-5xl">
          Ready when <span className="text-gradient">you are.</span>
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/packages" className="btn-primary">
            Explore packages
          </Link>
          <Link href="/contact" className="btn-ghost">
            Talk to us
          </Link>
        </div>
      </section>
    </>
  );
}
