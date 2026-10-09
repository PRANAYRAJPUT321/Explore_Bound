import { Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { AutoSelect, ConfirmButton, PendingButton } from "@/components/admin/FormControls";
import { StatusPill } from "@/components/admin/StatusPill";
import { adminListBookings } from "@/db/queries";
import { deleteBooking, updateBooking } from "@/lib/admin-actions";
import { addDays, cn, formatDate, formatINR, timeAgo } from "@/lib/utils";

export const metadata = { title: "Bookings" };

const tabs = ["all", "pending", "confirmed", "completed", "cancelled"];

export default async function AdminBookings({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "all", q = "" } = await searchParams;
  const all = await adminListBookings();
  const term = q.trim().toLowerCase();
  const list = all.filter(
    (b) =>
      (status === "all" || b.status === status) &&
      (!term || [b.reference, b.customerName, b.email, b.phone, b.package.title].some((f) => f.toLowerCase().includes(term))),
  );
  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Bookings</h1>
          <p className="text-sm text-white/50">Confirm requests, track payments and keep notes. Cancelling releases group-tour seats automatically.</p>
        </div>
        <form className="relative">
          <Search size={15} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-white/40" />
          <input name="q" defaultValue={q} placeholder="Search ref, name, phone…" className="field !w-72 !rounded-full !py-2.5 !pl-10" />
          {status !== "all" && <input type="hidden" name="status" value={status} />}
        </form>
      </header>
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const n = t === "all" ? all.length : all.filter((b) => b.status === t).length;
          return (
            <Link key={t} href={`/admin/bookings?status=${t}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={cn("rounded-full px-4 py-2 text-sm capitalize transition", status === t ? "bg-white text-ink-950" : "bg-white/5 text-white/65 hover:text-white")}>
              {t} <span className="opacity-60">{n}</span>
            </Link>
          );
        })}
      </div>
      <div className="space-y-3">
        {list.map((b) => (
          <details key={b.id} className="card group overflow-hidden">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-2 p-5 hover:bg-white/[0.02]">
              <span className="font-mono text-sm text-sun-300">{b.reference}</span>
              <span className="min-w-40 flex-1">
                <span className="block font-semibold">{b.customerName}</span>
                <span className="text-xs text-white/45">
                  {b.phone} · {b.email}
                </span>
              </span>
              <span className="min-w-48 text-sm">
                <span className="block">{b.package.title}</span>
                <span className="text-xs text-white/45">
                  {formatDate(b.travelDate)} → {formatDate(addDays(b.travelDate, b.package.durationDays - 1))} · {b.adults}A{b.children ? ` ${b.children}C` : ""}
                  {b.infants ? ` ${b.infants}I` : ""} · <span className="capitalize">{b.tier}</span>
                </span>
              </span>
              <span className="text-right">
                <span className="block font-semibold">{formatINR(b.totalAmount)}</span>
                <span className="text-xs text-white/45">adv. {formatINR(b.advanceAmount)}</span>
              </span>
              <span className="flex flex-col items-end gap-1">
                <StatusPill status={b.status} />
                <StatusPill status={b.paymentStatus} className="!bg-transparent !px-0 !text-white/45" />
              </span>
              <span className="text-xs text-white/35">{timeAgo(b.createdAt)}</span>
            </summary>
            <div className="grid gap-6 border-t border-white/10 p-5 md:grid-cols-2">
              <div className="space-y-3 text-sm">
                <div>
                  <div className="label">Travellers</div>
                  {b.travellers.length ? b.travellers.map((t, i) => <div key={i}>{t.name} <span className="text-white/40">({t.type})</span></div>) : <div className="text-white/45">Lead only: {b.customerName}</div>}
                </div>
                <div>
                  <div className="label">Add-ons</div>
                  {b.addOns.length ? b.addOns.map((a) => <div key={a.id}>{a.name} — {formatINR(a.amount)}</div>) : <div className="text-white/45">None</div>}
                </div>
                <div>
                  <div className="label">Price</div>
                  Subtotal {formatINR(b.subtotal)} + GST {formatINR(b.taxes)} = <b>{formatINR(b.totalAmount)}</b>
                </div>
                {b.city && <div><span className="label inline">City</span> {b.city}</div>}
                {b.specialRequests && (
                  <div>
                    <div className="label">Special requests</div>
                    <p className="text-white/70">{b.specialRequests}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="btn-ghost !px-4 !py-2 text-xs">Call</a>
                  <a href={`https://wa.me/${b.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${b.customerName}, this is Explore Bound regarding booking ${b.reference}.`)}`} target="_blank" rel="noreferrer" className="btn-ghost !px-4 !py-2 text-xs">WhatsApp</a>
                  <a href={`mailto:${b.email}?subject=${encodeURIComponent(`Your booking ${b.reference}`)}`} className="btn-ghost !px-4 !py-2 text-xs">Email</a>
                </div>
              </div>
              <div>
                <form action={updateBooking} className="space-y-3">
                  <input type="hidden" name="id" value={b.id} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Booking status</label>
                      <select name="status" defaultValue={b.status} className="field !py-2.5">
                        {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Payment</label>
                      <select name="paymentStatus" defaultValue={b.paymentStatus} className="field !py-2.5">
                        {["unpaid", "advance-paid", "paid", "refunded"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Internal note</label>
                    <textarea name="adminNote" defaultValue={b.adminNote} rows={3} className="field resize-none" placeholder="Hotels confirmed, payment link sent…" />
                  </div>
                  <PendingButton className="btn-primary !py-2.5">Save changes</PendingButton>
                </form>
                <form action={deleteBooking} className="mt-3">
                  <input type="hidden" name="id" value={b.id} />
                  <ConfirmButton message={`Delete booking ${b.reference}? This cannot be undone.`} className="flex items-center gap-1.5 text-xs text-coral-400 hover:text-coral-500">
                    <Trash2 size={13} /> Delete booking
                  </ConfirmButton>
                </form>
              </div>
            </div>
          </details>
        ))}
        {list.length === 0 && <p className="card p-10 text-center text-white/50">No bookings match.</p>}
      </div>
    </div>
  );
}
