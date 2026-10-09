import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { RatingSummary } from "@/components/reviews/RatingSummary";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewForms } from "@/components/reviews/ReviewForms";
import { PageHero } from "@/components/ui/PageHero";
import { getPackageOptions, getReviewSummary, listReviews } from "@/db/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reviews & Feedback",
  description: "Read verified traveller reviews of Explore Bound Holidays and share your own experience or feedback.",
};

type SP = { rating?: string; trip?: string; sort?: string; page?: string; package?: string };

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const rating = Number(sp.rating) || undefined;
  const page = Number(sp.page) || 1;
  const [summary, list, packages] = await Promise.all([
    getReviewSummary(),
    listReviews({ rating, packageSlug: sp.trip, sort: sp.sort, page }),
    getPackageOptions(),
  ]);

  const href = (patch: Partial<SP>) => {
    const p = new URLSearchParams(Object.entries({ rating: sp.rating, trip: sp.trip, sort: sp.sort, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/reviews${p.size ? `?${p}` : ""}#list`;
  };

  return (
    <>
      <PageHero eyebrow="Reviews & feedback" title="Real journeys." highlight="Real words." subtitle="Every review comes from a traveller who booked with us. Moderated for spam and abuse, never for honesty." />
      <section className="mx-auto grid max-w-7xl gap-8 px-5 md:px-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="card p-6 md:p-8">
          <RatingSummary summary={summary} />
          <div className="mt-6 flex items-center gap-2 text-xs text-white/45">
            <ShieldCheck size={14} className="text-aqua-300" /> Reviews are checked by our team before publishing.
          </div>
        </div>
        <div className="card flex flex-col justify-center gap-4 p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold">Travelled with us?</h2>
          <p className="text-white/60">Your story helps thousands of travellers choose with confidence — and helps us get better at what we do.</p>
          <div className="flex flex-wrap gap-3">
            <a href="#write" className="btn-primary">
              Write a review
            </a>
            <a href="#write" className="btn-ghost">
              Share feedback
            </a>
          </div>
        </div>
      </section>

      <section id="list" className="mx-auto max-w-7xl scroll-mt-28 px-5 pt-16 md:px-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {[undefined, 5, 4, 3, 2, 1].map((r) => (
              <Link
                key={r ?? "all"}
                href={href({ rating: r ? String(r) : undefined, page: undefined })}
                className={cn("rounded-full border px-4 py-2 text-sm transition", rating === r ? "border-sun-400 bg-sun-400/15 text-sun-200" : "border-white/10 text-white/65 hover:border-white/30")}
                scroll={false}
              >
                {r ? `${r}★` : "All"}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {[
              ["", "Newest"],
              ["helpful", "Most helpful"],
              ["highest", "Highest"],
              ["lowest", "Lowest"],
            ].map(([v, l]) => (
              <Link key={v} href={href({ sort: v || undefined, page: undefined })} className={cn("rounded-full px-3 py-1.5 transition", (sp.sort ?? "") === v ? "bg-white text-ink-950" : "text-white/60 hover:text-white")} scroll={false}>
                {l}
              </Link>
            ))}
          </div>
        </div>

        {list.items.length ? (
          <div className="columns-1 gap-5 md:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
            {list.items.map((r) => (
              <ReviewCard key={r.id} r={r} />
            ))}
          </div>
        ) : (
          <p className="card p-10 text-center text-white/60">No reviews match this filter yet.</p>
        )}

        {list.pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {list.page > 1 && (
              <Link href={href({ page: String(list.page - 1) })} className="glass flex h-10 w-10 items-center justify-center rounded-full" aria-label="Previous page">
                <ChevronLeft size={18} />
              </Link>
            )}
            {Array.from({ length: list.pages }).map((_, i) => (
              <Link key={i} href={href({ page: String(i + 1) })} className={cn("flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold", list.page === i + 1 ? "bg-sunset text-ink-950" : "glass")}>
                {i + 1}
              </Link>
            ))}
            {list.page < list.pages && (
              <Link href={href({ page: String(list.page + 1) })} className="glass flex h-10 w-10 items-center justify-center rounded-full" aria-label="Next page">
                <ChevronRight size={18} />
              </Link>
            )}
          </div>
        )}
      </section>

      <section id="write" className="mx-auto grid max-w-7xl scroll-mt-28 gap-10 px-5 pt-24 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <span className="eyebrow">✦ Your voice matters</span>
          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            Tell us how it <span className="text-gradient">really</span> went.
          </h2>
          <p className="mt-4 text-white/60">Loved it? Tell the world. Something not right? Tell us — every piece of feedback is read by our founders and helps shape the next journey.</p>
          <ul className="mt-6 space-y-3 text-sm text-white/65">
            <li>✦ Reviews appear after a quick check (usually within 24 hrs)</li>
            <li>✦ Your email is never published</li>
            <li>✦ Feedback goes straight to our team — not public</li>
          </ul>
        </div>
        <ReviewForms packages={packages} defaultPackage={Number(sp.package) || undefined} />
      </section>
    </>
  );
}
