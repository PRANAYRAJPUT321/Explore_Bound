import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton, PendingButton } from "@/components/admin/FormControls";
import { PackageForm } from "@/components/admin/PackageForm";
import { StatusPill } from "@/components/admin/StatusPill";
import { adminGetPackage, adminListDestinations } from "@/db/queries";
import { addDeparture, deletePackage, updateDeparture } from "@/lib/admin-actions";
import { formatDate, todayISO } from "@/lib/utils";

export const metadata = { title: "Edit package" };

export default async function EditPackage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [pkg, destinations] = await Promise.all([adminGetPackage(Number(id)), adminListDestinations()]);
  if (!pkg) notFound();
  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <Link href="/admin/packages" className="text-sm text-white/50 hover:text-white">
          ← All packages
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-bold">{pkg.title}</h1>
          <a href={`/packages/${pkg.slug}`} target="_blank" className="btn-ghost !py-2.5 text-xs">
            <ExternalLink size={14} /> View on site
          </a>
        </div>
      </div>

      <PackageForm pkg={pkg} destinations={destinations.map((d) => ({ id: d.id, name: d.name, region: d.region }))} created={sp.created === "1"} />

      <section className="card p-6">
        <h2 className="font-semibold">Fixed departures (group tour dates)</h2>
        <p className="mb-4 text-xs text-white/45">Customers pick from these dates. Seats update automatically with every booking or cancellation.</p>
        <div className="divide-y divide-white/5">
          {pkg.departures.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-4 py-3 text-sm">
              <span className="w-40 font-semibold">{formatDate(d.startDate, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
              <span className="text-white/60">
                {d.bookedSeats}/{d.totalSeats} booked
              </span>
              {d.price ? <span className="text-white/60">₹{d.price.toLocaleString("en-IN")}</span> : <span className="text-white/35">base price</span>}
              <StatusPill status={d.startDate < todayISO() ? "completed" : d.status === "open" ? "active" : "closed"} />
              <span className="flex-1" />
              <form action={updateDeparture} className="flex gap-2">
                <input type="hidden" name="id" value={d.id} />
                <PendingButton name="op" value="toggle" className="btn-ghost !px-3 !py-1.5 text-xs">
                  {d.status === "open" ? "Close sales" : "Reopen"}
                </PendingButton>
                <ConfirmButton name="op" value="delete" message="Delete this departure? (If it has bookings it will be closed instead.)" className="rounded-full p-2 text-white/40 hover:text-coral-400">
                  <Trash2 size={14} />
                </ConfirmButton>
              </form>
            </div>
          ))}
          {pkg.departures.length === 0 && <p className="py-3 text-sm text-white/45">No fixed departures — customers can choose any date.</p>}
        </div>
        <form action={addDeparture} className="mt-4 grid gap-3 rounded-2xl bg-white/[0.03] p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <input type="hidden" name="packageId" value={pkg.id} />
          <input type="date" name="startDate" min={todayISO(1)} required className="field [color-scheme:dark]" aria-label="Start date" />
          <input type="number" name="totalSeats" min={1} placeholder="Total seats" required className="field" aria-label="Total seats" />
          <input type="number" name="price" min={0} placeholder="Price override (optional)" className="field" aria-label="Price override" />
          <PendingButton className="btn-primary !py-2.5">Add date</PendingButton>
        </form>
      </section>

      <section className="card border-coral-500/20 p-6">
        <h2 className="font-semibold text-coral-400">Danger zone</h2>
        <p className="mt-1 mb-4 text-sm text-white/50">Packages with bookings are switched to draft instead of being deleted, so booking history stays intact.</p>
        <form action={deletePackage}>
          <input type="hidden" name="id" value={pkg.id} />
          <ConfirmButton message={`Delete “${pkg.title}”?`} className="btn-ghost !border-coral-500/40 !text-coral-400">
            <Trash2 size={15} /> Delete package
          </ConfirmButton>
        </form>
      </section>
    </div>
  );
}
