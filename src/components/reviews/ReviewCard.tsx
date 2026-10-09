import { BadgeCheck, MessageSquareReply } from "lucide-react";
import Link from "next/link";
import { SmartImage } from "@/components/ui/SmartImage";
import { Stars } from "@/components/ui/Stars";
import { initials, timeAgo } from "@/lib/utils";
import { HelpfulButton } from "./HelpfulButton";

export type ReviewCardData = {
  id: number;
  name: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  tripType: string;
  travelMonth: string;
  photoUrl: string;
  helpful: number;
  reply: string;
  createdAt: Date;
  packageTitle?: string | null;
  packageSlug?: string | null;
};

const hues = ["from-sun-400 to-coral-500", "from-aqua-400 to-sky-glow", "from-coral-400 to-pink-500", "from-violet-400 to-aqua-400", "from-sun-300 to-aqua-400"];

export function ReviewCard({ r, showPackage = true }: { r: ReviewCardData; showPackage?: boolean }) {
  return (
    <article className="card flex h-full flex-col p-6 transition hover:border-white/20">
      <div className="flex items-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${hues[r.id % hues.length]} text-sm font-bold text-ink-950`}>{initials(r.name)}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <span className="truncate">{r.name}</span>
            <BadgeCheck size={15} className="shrink-0 text-aqua-300" aria-label="Verified" />
          </div>
          <div className="truncate text-xs text-white/45">
            {[r.location, r.tripType, r.travelMonth && `Travelled ${r.travelMonth}`].filter(Boolean).join(" · ")}
          </div>
        </div>
        <span className="shrink-0 text-[11px] text-white/35">{timeAgo(r.createdAt)}</span>
      </div>
      <Stars value={r.rating} size={15} className="mt-4" />
      <h3 className="mt-2 font-display text-lg leading-snug font-bold text-white">{r.title}</h3>
      <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-white/65">{r.comment}</p>
      {r.photoUrl ? (
        <div className="mt-4 h-40 overflow-hidden rounded-2xl">
          <SmartImage src={r.photoUrl} alt={`Photo by ${r.name}`} label="" width={600} className="h-full w-full" />
        </div>
      ) : null}
      {r.reply ? (
        <div className="mt-4 rounded-2xl border-l-2 border-sun-400 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-sun-300">
            <MessageSquareReply size={13} /> Reply from Explore Bound
          </div>
          {r.reply}
        </div>
      ) : null}
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        {showPackage && r.packageSlug ? (
          <Link href={`/packages/${r.packageSlug}`} className="truncate text-xs font-semibold text-sun-300 hover:text-sun-200">
            {r.packageTitle} →
          </Link>
        ) : (
          <span />
        )}
        <HelpfulButton id={r.id} count={r.helpful} />
      </div>
    </article>
  );
}
