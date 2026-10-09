"use client";

import { CalendarDays, Minus, Phone, Plus, ShieldCheck, Star, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { calculatePrice, tiers, type TierId } from "@/lib/pricing";
import { site } from "@/lib/site";
import { cn, discountPct, formatDate, todayISO, whatsappLink } from "@/lib/utils";
import { Countdown } from "./Countdown";

export type WidgetDeparture = { id: number; startDate: string; totalSeats: number; bookedSeats: number; price: number | null };

type Props = {
  pkg: { id: number; slug: string; title: string; price: number; originalPrice: number | null; offerEndsAt: Date | null; durationDays: number };
  departures: WidgetDeparture[];
  initialDeparture?: number;
};

export function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-[11px] text-white/45">{hint}</div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 transition hover:border-white/40 disabled:opacity-30" aria-label={`Fewer ${label}`}>
          <Minus size={14} />
        </button>
        <span className="w-5 text-center font-semibold tabular-nums">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 transition hover:border-white/40 disabled:opacity-30" aria-label={`More ${label}`}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export function BookingWidget({ pkg, departures, initialDeparture }: Props) {
  const { formatPrice } = useApp();
  const firstOpen = departures.find((d) => d.totalSeats - d.bookedSeats > 0);
  const [tier, setTier] = useState<TierId>("standard");
  const [depId, setDepId] = useState<number | undefined>(departures.find((d) => d.id === initialDeparture)?.id ?? firstOpen?.id);
  const [date, setDate] = useState(todayISO(21));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const dep = departures.find((d) => d.id === depId);
  const seatsLeft = dep ? dep.totalSeats - dep.bookedSeats : 99;
  const base = dep?.price ?? pkg.price;
  const quote = useMemo(() => calculatePrice({ basePrice: base, tier, adults, children, infants, addOnIds: [] }), [base, tier, adults, children, infants]);
  const off = discountPct(pkg.price, pkg.originalPrice);
  const offerLive = pkg.offerEndsAt && new Date(pkg.offerEndsAt).getTime() > Date.now();
  const tooMany = adults + children > seatsLeft;

  const params = new URLSearchParams({ tier, adults: String(adults), children: String(children), infants: String(infants) });
  if (departures.length && depId) params.set("departure", String(depId));
  else params.set("date", date);

  return (
    <div className="glass-strong relative overflow-hidden rounded-[2rem] p-6 shadow-[0_40px_100px_-40px_rgb(0_0_0/0.9)]">
      <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-sun-500/20 blur-3xl" />
      <div className="relative">
        {offerLive && (
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-coral-500/12 px-4 py-2.5 text-xs font-semibold text-coral-400">
            <span>🔥 Limited deal · {off}% off</span>
            <Countdown to={pkg.offerEndsAt!} compact />
          </div>
        )}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] tracking-widest text-white/45 uppercase">From / person</div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold text-white">{formatPrice(Math.round(base * (tiers.find((t) => t.id === tier)?.multiplier ?? 1)))}</span>
              {off > 0 && <span className="text-sm text-white/35 line-through">{formatPrice(pkg.originalPrice!)}</span>}
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-white/70">
            <ShieldCheck size={13} className="text-aqua-300" /> No hidden fees
          </span>
        </div>

        <div className="mt-6">
          <div className="label">Hotel category</div>
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-white/[0.04] p-1.5">
            {tiers.map((t) => (
              <button key={t.id} onClick={() => setTier(t.id)} className={cn("rounded-xl py-2 text-xs font-semibold transition", tier === t.id ? "bg-white text-ink-950" : "text-white/60 hover:text-white")}>
                {t.label}
                <span className="mt-0.5 flex justify-center gap-px">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={8} fill="currentColor" strokeWidth={0} className={tier === t.id ? "text-sun-600" : "text-sun-400/60"} />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="label flex items-center gap-1.5">
            <CalendarDays size={13} /> {departures.length ? "Departure date" : "Travel date"}
          </div>
          {departures.length ? (
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {departures.map((d) => {
                const left = d.totalSeats - d.bookedSeats;
                const dd = new Date(`${d.startDate}T00:00:00`);
                return (
                  <button
                    key={d.id}
                    disabled={left <= 0}
                    onClick={() => setDepId(d.id)}
                    className={cn(
                      "flex min-w-[78px] shrink-0 flex-col items-center rounded-2xl border px-3 py-2 transition disabled:opacity-30",
                      depId === d.id ? "border-sun-400 bg-sun-400/10" : "border-white/10 hover:border-white/30",
                    )}
                  >
                    <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">{dd.toLocaleString("en-IN", { month: "short" })}</span>
                    <span className="font-display text-xl font-bold">{dd.getDate()}</span>
                    <span className={cn("text-[10px] font-semibold", left <= 5 ? "text-coral-400" : "text-aqua-300")}>{left > 0 ? `${left} left` : "Sold out"}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <input type="date" min={todayISO(3)} value={date} onChange={(e) => setDate(e.target.value)} className="field [color-scheme:dark]" aria-label="Travel date" />
          )}
        </div>

        <div className="mt-4 divide-y divide-white/5 rounded-2xl border border-white/10 px-4">
          <Stepper label="Adults" hint="12+ years" value={adults} min={1} max={20} onChange={setAdults} />
          <Stepper label="Children" hint="5–11 yrs · 40% off" value={children} min={0} max={10} onChange={setChildren} />
          <Stepper label="Infants" hint="Under 5 · free" value={infants} min={0} max={6} onChange={setInfants} />
        </div>

        <div className="mt-5 space-y-1.5 text-sm">
          <div className="flex justify-between text-white/60">
            <span>
              {adults} adult{adults > 1 ? "s" : ""}
              {children ? ` + ${children} child${children > 1 ? "ren" : ""}` : ""}
            </span>
            <span>{formatPrice(quote.base)}</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>GST (5%)</span>
            <span>{formatPrice(quote.taxes)}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2 text-base font-bold text-white">
            <span>Estimated total</span>
            <span>{formatPrice(quote.total)}</span>
          </div>
          <div className="text-right text-xs text-aqua-300">Pay just {formatPrice(quote.advance)} (25%) to confirm</div>
        </div>

        {tooMany && <p className="mt-3 text-xs text-coral-400">Only {seatsLeft} seats left on this departure.</p>}

        <Link
          href={`/book/${pkg.slug}?${params}`}
          aria-disabled={tooMany}
          className={cn("btn-primary mt-5 w-full !py-4 text-base", tooMany && "pointer-events-none opacity-50")}
        >
          Book now <Users size={16} />
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href={whatsappLink(site.whatsapp, `Hi! I'm interested in "${pkg.title}" for ${adults + children} traveller(s). Can you help?`)} target="_blank" rel="noreferrer" className="btn-ghost !px-3 !py-2.5 text-xs">
            <WhatsAppIcon size={16} /> WhatsApp
          </a>
          <a href={site.phoneHref} className="btn-ghost !px-3 !py-2.5 text-xs">
            <Phone size={14} /> Call expert
          </a>
        </div>
        {dep && <p className="mt-3 text-center text-[11px] text-white/40">Departs {formatDate(dep.startDate, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>}
      </div>
    </div>
  );
}
