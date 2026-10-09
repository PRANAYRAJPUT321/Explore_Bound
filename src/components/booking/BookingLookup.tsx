"use client";

import { CalendarDays, CheckCircle2, Circle, CreditCard, Download, Search, Users } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { FormMessage, SubmitButton } from "@/components/ui/FormBits";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { SmartImage } from "@/components/ui/SmartImage";
import { lookupBooking, type LookupState } from "@/lib/actions";
import { site } from "@/lib/site";
import { addDays, cn, formatDate, whatsappLink } from "@/lib/utils";

const statusSteps = [
  { id: "pending", label: "Request received" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Trip completed" },
];

const payLabel: Record<string, string> = { unpaid: "Awaiting advance", "advance-paid": "Advance paid", paid: "Fully paid", refunded: "Refunded" };

export function BookingLookup({ initialRef }: { initialRef?: string }) {
  const [state, action] = useActionState<LookupState, FormData>(lookupBooking, { ok: false, message: "" });
  const { formatPrice } = useApp();
  const b = state.ok ? state.booking : null;
  const idx = b ? (b.status === "cancelled" ? -1 : statusSteps.findIndex((s) => s.id === b.status)) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form action={action} className="card h-fit space-y-4 p-6">
        <h2 className="font-display text-2xl font-bold">Find your booking</h2>
        <div>
          <label className="label" htmlFor="lk-ref">
            Booking reference
          </label>
          <input id="lk-ref" name="reference" defaultValue={initialRef} required placeholder="EB-2610-AB12" className="field font-mono uppercase" />
        </div>
        <div>
          <label className="label" htmlFor="lk-email">
            Email used for booking
          </label>
          <input id="lk-email" name="email" type="email" required className="field" autoComplete="email" />
        </div>
        {!state.ok && <FormMessage state={state} />}
        <SubmitButton className="w-full" pendingText="Searching…">
          <Search size={16} /> Show my booking
        </SubmitButton>
      </form>

      {b ? (
        <div className="card overflow-hidden">
          <div className="relative h-48">
            <SmartImage src={b.coverImage} alt={b.packageTitle} label={b.destination} width={1200} className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-850 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <div className="font-mono text-sm text-sun-300">{b.reference}</div>
              <h3 className="font-display text-3xl font-bold">{b.packageTitle}</h3>
            </div>
          </div>
          <div className="space-y-8 p-6">
            {b.status === "cancelled" ? (
              <div className="rounded-2xl border border-coral-500/30 bg-coral-500/10 p-4 text-coral-400">This booking has been cancelled. Contact us if you have questions about refunds.</div>
            ) : (
              <ol className="flex items-center gap-2">
                {statusSteps.map((s, i) => (
                  <li key={s.id} className="flex flex-1 items-center gap-2">
                    {i <= idx ? <CheckCircle2 className="shrink-0 text-aqua-400" /> : <Circle className="shrink-0 text-white/20" />}
                    <span className={cn("text-sm font-semibold", i <= idx ? "text-white" : "text-white/40")}>{s.label}</span>
                    {i < statusSteps.length - 1 && <span className={cn("h-px flex-1", i < idx ? "bg-aqua-400" : "bg-white/10")} />}
                  </li>
                ))}
              </ol>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <Info icon={<CalendarDays size={16} />} k="Travel dates" v={`${formatDate(b.travelDate)} – ${formatDate(addDays(b.travelDate, b.durationDays - 1))}`} />
              <Info icon={<Users size={16} />} k="Travellers" v={`${b.adults} adult(s)${b.children ? `, ${b.children} child(ren)` : ""}${b.infants ? `, ${b.infants} infant(s)` : ""} · ${b.tier}`} />
              <Info icon={<CreditCard size={16} />} k="Payment" v={payLabel[b.paymentStatus] ?? b.paymentStatus} />
            </div>
            <div className="rounded-2xl bg-white/[0.03] p-5 text-sm">
              {b.addOns.map((a) => (
                <div key={a.name} className="flex justify-between text-white/60">
                  <span>{a.name}</span>
                  <span>{formatPrice(a.amount)}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-lg font-bold">
                <span>Total (incl. GST)</span>
                <span>{formatPrice(b.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-aqua-300">
                <span>Advance (25%)</span>
                <span>{formatPrice(b.advanceAmount)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={whatsappLink(site.whatsapp, `Hi! Question about my booking ${b.reference}.`)} target="_blank" rel="noreferrer" className="btn-primary">
                <WhatsAppIcon size={16} /> Message my trip expert
              </a>
              <Link href={`/itinerary/${b.packageSlug}`} target="_blank" className="btn-ghost">
                <Download size={16} /> Itinerary PDF
              </Link>
              <Link href={`/packages/${b.packageSlug}`} className="btn-ghost">
                View package
              </Link>
            </div>
            <p className="text-xs text-white/40">Booked on {formatDate(b.createdAt)} by {b.customerName}. Need changes? Free date changes up to 30 days before travel.</p>
          </div>
        </div>
      ) : (
        <div className="grain relative flex min-h-80 flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-dashed border-white/15 p-10 text-center">
          <div className="text-6xl">🧳</div>
          <h3 className="mt-4 font-display text-2xl font-bold">Your trip dashboard</h3>
          <p className="mt-2 max-w-sm text-white/55">Enter your reference to see live status, payments, travel dates and your downloadable itinerary.</p>
        </div>
      )}
    </div>
  );
}

function Info({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <div className="flex items-center gap-1.5 text-xs text-white/45">
        <span className="text-sun-400">{icon}</span> {k}
      </div>
      <div className="mt-1 text-sm font-semibold text-white capitalize">{v}</div>
    </div>
  );
}
