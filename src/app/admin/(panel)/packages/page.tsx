import { Crown, Eye, EyeOff, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { PendingButton } from "@/components/admin/FormControls";
import { StatusPill } from "@/components/admin/StatusPill";
import { SmartImage } from "@/components/ui/SmartImage";
import { adminListPackages } from "@/db/queries";
import { togglePackage } from "@/lib/admin-actions";
import { cn, formatINR } from "@/lib/utils";

export const metadata = { title: "Packages" };

export default async function AdminPackages() {
  const list = await adminListPackages();
  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Packages</h1>
          <p className="text-sm text-white/50">{list.length} packages. Edits go live on the website instantly.</p>
        </div>
        <Link href="/admin/packages/new" className="btn-primary">
          <Plus size={16} /> New package
        </Link>
      </header>
      <div className="grid gap-3">
        {list.map((p) => (
          <div key={p.id} className={cn("card flex flex-wrap items-center gap-4 p-3 pr-5", p.status === "draft" && "opacity-60")}>
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl">
              <SmartImage src={p.coverImage} alt="" label={p.destinationName} width={200} className="h-full w-full" />
            </div>
            <div className="min-w-48 flex-1">
              <div className="flex items-center gap-2 font-semibold">
                {p.title} {p.featured && <Crown size={14} className="text-sun-400" aria-label="Featured" />}
              </div>
              <div className="text-xs text-white/45">
                {p.destinationName} · {p.durationDays} days · {p.isGroupTour ? "Group tour · " : ""}
                {p.reviewCount ? `★ ${p.rating} (${p.reviewCount})` : "No reviews"} · {p.bookings} bookings
              </div>
            </div>
            <div className="font-semibold">{formatINR(p.price)}</div>
            <StatusPill status={p.status} />
            <div className="flex items-center gap-1">
              <form action={togglePackage}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="field" value="featured" />
                <PendingButton className={cn("rounded-full p-2 hover:bg-white/10", p.featured ? "text-sun-400" : "text-white/40")}>
                  <Crown size={16} />
                  <span className="sr-only">Toggle featured</span>
                </PendingButton>
              </form>
              <form action={togglePackage}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="field" value="status" />
                <PendingButton className="rounded-full p-2 text-white/50 hover:bg-white/10">
                  {p.status === "active" ? <Eye size={16} /> : <EyeOff size={16} />}
                  <span className="sr-only">Toggle visibility</span>
                </PendingButton>
              </form>
              <Link href={`/admin/packages/${p.id}`} className="btn-ghost !px-4 !py-2 text-xs">
                <Pencil size={13} /> Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
