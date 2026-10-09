import { Check, Crown, Trash2, X } from "lucide-react";
import Link from "next/link";
import { ConfirmButton, PendingButton } from "@/components/admin/FormControls";
import { StatusPill } from "@/components/admin/StatusPill";
import { Stars } from "@/components/ui/Stars";
import { adminListReviews } from "@/db/queries";
import { moderateReview } from "@/lib/admin-actions";
import { cn, timeAgo } from "@/lib/utils";

export const metadata = { title: "Reviews" };

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "pending" } = await searchParams;
  const all = await adminListReviews("all");
  const list = status === "all" ? all : status === "featured" ? all.filter((r) => r.featured) : all.filter((r) => r.status === status);
  const count = (s: string) => (s === "all" ? all.length : s === "featured" ? all.filter((r) => r.featured).length : all.filter((r) => r.status === s).length);
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">Reviews</h1>
        <p className="text-sm text-white/50">Approve genuine reviews, reply publicly, and pick which ones appear as home-page testimonials (Featured).</p>
      </header>
      <div className="mb-6 flex flex-wrap gap-2">
        {["pending", "approved", "featured", "rejected", "all"].map((s) => (
          <Link key={s} href={`/admin/reviews?status=${s}`} className={cn("rounded-full px-4 py-2 text-sm capitalize", status === s ? "bg-white text-ink-950" : "bg-white/5 text-white/65 hover:text-white")}>
            {s} <span className="opacity-60">{count(s)}</span>
          </Link>
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {list.map((r) => (
          <article key={r.id} className="card flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  {r.name} {r.featured && <Crown size={14} className="text-sun-400" aria-label="Featured" />}
                </div>
                <div className="text-xs text-white/45">
                  {[r.location, r.email, r.tripType].filter(Boolean).join(" · ")}
                </div>
              </div>
              <div className="text-right">
                <StatusPill status={r.status} />
                <div className="mt-1 text-[11px] text-white/35">{timeAgo(r.createdAt)}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Stars value={r.rating} size={14} /> <span className="text-xs text-white/45">{r.package?.title ?? "General"}</span>
            </div>
            <h2 className="mt-2 font-display text-lg font-bold">{r.title}</h2>
            <p className="mt-1 text-sm whitespace-pre-line text-white/70">{r.comment}</p>
            {r.photoUrl && (
              <a href={r.photoUrl} target="_blank" rel="noreferrer" className="mt-2 text-xs text-sun-300 underline">
                View attached photo link
              </a>
            )}
            <form action={moderateReview} className="mt-4 flex gap-2">
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="op" value="reply" />
              <input name="reply" defaultValue={r.reply} placeholder="Public reply from Explore Bound (optional)" className="field !rounded-xl !py-2 !text-sm" />
              <PendingButton className="btn-ghost shrink-0 !rounded-xl !px-3 !py-2 text-xs">Save reply</PendingButton>
            </form>
            <form action={moderateReview} className="mt-auto flex flex-wrap gap-2 pt-4">
              <input type="hidden" name="id" value={r.id} />
              {r.status !== "approved" && (
                <PendingButton name="op" value="approve" className="btn-aqua !px-4 !py-2 text-xs">
                  <Check size={14} /> Approve
                </PendingButton>
              )}
              {r.status !== "rejected" && (
                <PendingButton name="op" value="reject" className="btn-ghost !px-4 !py-2 text-xs">
                  <X size={14} /> Reject
                </PendingButton>
              )}
              <PendingButton name="op" value="feature" className="btn-ghost !px-4 !py-2 text-xs">
                <Crown size={14} /> {r.featured ? "Unfeature" : "Feature on home"}
              </PendingButton>
              <span className="flex-1" />
              <ConfirmButton name="op" value="delete" message="Delete this review permanently?" className="rounded-full p-2 text-white/40 hover:text-coral-400">
                <Trash2 size={15} />
              </ConfirmButton>
            </form>
          </article>
        ))}
        {list.length === 0 && <p className="card p-10 text-center text-white/50 xl:col-span-2">No reviews in this view.</p>}
      </div>
    </div>
  );
}
