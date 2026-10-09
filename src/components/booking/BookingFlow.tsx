"use client";

import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Camera, Car, Check, Copy, Download, Gift, LoaderCircle, Mountain, PartyPopper, ShieldCheck, Utensils, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { SmartImage } from "@/components/ui/SmartImage";
import { Stepper, type WidgetDeparture } from "@/components/packages/BookingWidget";
import { createBooking, type BookingResult } from "@/lib/actions";
import { addOns, calculatePrice, tiers, type TierId } from "@/lib/pricing";
import { site } from "@/lib/site";
import { addDays, cn, formatDate, todayISO, whatsappLink } from "@/lib/utils";

const icons: Record<string, LucideIcon> = { ShieldCheck, Car, Camera, Utensils, Mountain, Gift };

type Props = {
  pkg: { id: number; slug: string; title: string; price: number; coverImage: string; durationDays: number; durationNights: number; destination: string; route: string[] };
  departures: WidgetDeparture[];
  initial: { tier: TierId; adults: number; children: number; infants: number; departure?: number; date?: string };
};

const steps = ["Trip", "Add-ons", "Travellers", "Confirm"];

export function BookingFlow({ pkg, departures, initial }: Props) {
  const { formatPrice } = useApp();
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState<TierId>(initial.tier);
  const firstOpen = departures.find((d) => d.totalSeats - d.bookedSeats > 0);
  const [depId, setDepId] = useState<number | undefined>(departures.find((d) => d.id === initial.departure)?.id ?? firstOpen?.id);
  const [date, setDate] = useState(initial.date && initial.date >= todayISO(3) ? initial.date : todayISO(21));
  const [adults, setAdults] = useState(initial.adults);
  const [children, setChildren] = useState(initial.children);
  const [infants, setInfants] = useState(initial.infants);
  const [extras, setExtras] = useState<string[]>(["insurance"]);
  const [contact, setContact] = useState({ customerName: "", email: "", phone: "", city: "", specialRequests: "" });
  const [names, setNames] = useState<string[]>([]);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<Extract<BookingResult, { ok: true }> | null>(null);
  const [pending, start] = useTransition();

  const dep = departures.find((d) => d.id === depId);
  const travelDate = departures.length ? dep?.startDate : date;
  const base = dep?.price ?? pkg.price;
  const quote = useMemo(() => calculatePrice({ basePrice: base, tier, adults, children, infants, addOnIds: extras }), [base, tier, adults, children, infants, extras]);
  const seatsLeft = dep ? dep.totalSeats - dep.bookedSeats : 99;
  const coTravellers = adults + children + infants - 1;

  function validateStep(s: number) {
    const e: Record<string, string[]> = {};
    if (s === 0) {
      if (departures.length && !dep) e.departureId = ["Choose a departure"];
      if (!departures.length && date < todayISO(3)) e.travelDate = ["Pick a date at least 3 days from today"];
      if (adults + children > seatsLeft) e.adults = [`Only ${seatsLeft} seats left on this departure`];
    }
    if (s === 2) {
      if (contact.customerName.trim().length < 2) e.customerName = ["Please enter the lead traveller's name"];
      if (!/^\S+@\S+\.\S+$/.test(contact.email)) e.email = ["Enter a valid email"];
      if (!/^[+\d][\d\s-]{6,}$/.test(contact.phone.trim())) e.phone = ["Enter a valid phone number"];
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) {
      setStep((s) => Math.min(3, s + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function confirm() {
    if (!terms) {
      setErrors({ acceptTerms: ["Please accept the booking terms"] });
      return;
    }
    setMessage("");
    start(async () => {
      const travellers = [
        { name: contact.customerName, age: 30, type: "adult" as const },
        ...names.slice(0, coTravellers).map((n, i) => ({ name: n, age: i < adults - 1 ? 30 : i < adults - 1 + children ? 8 : 2, type: (i < adults - 1 ? "adult" : i < adults - 1 + children ? "child" : "infant") as "adult" | "child" | "infant" })),
      ];
      const res = await createBooking({
        packageId: pkg.id,
        departureId: dep?.id ?? null,
        travelDate: travelDate ?? date,
        tier,
        adults,
        children,
        infants,
        addOnIds: extras,
        ...contact,
        travellers,
        acceptTerms: true,
      });
      if (res.ok) {
        setResult(res);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setMessage(res.message);
        setErrors(res.errors ?? {});
      }
    });
  }

  if (result) return <Success result={result} pkg={pkg} formatPrice={formatPrice} />;

  const err = (k: string) => (errors[k]?.[0] ? <p className="field-error">{errors[k][0]}</p> : null);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0">
        {/* progress */}
        <ol className="mb-8 flex items-center gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition",
                  i < step ? "bg-aqua-400 text-ink-950" : i === step ? "bg-sunset text-ink-950" : "bg-white/10 text-white/50",
                )}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </button>
              <span className={cn("hidden text-sm font-semibold sm:inline", i === step ? "text-white" : "text-white/45")}>{s}</span>
              {i < steps.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-aqua-400" : "bg-white/10")} />}
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }} className="card p-6 md:p-8">
            {step === 0 && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-bold">Choose your stay</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {tiers.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTier(t.id)}
                        className={cn("rounded-2xl border p-4 text-left transition", tier === t.id ? "border-sun-400 bg-sun-400/10" : "border-white/10 hover:border-white/30")}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{t.label}</span>
                          <span className="text-xs text-sun-300">{"★".repeat(t.stars)}</span>
                        </div>
                        <p className="mt-1 text-xs text-white/50">{t.blurb}</p>
                        <p className="mt-3 text-sm font-bold">
                          {formatPrice(Math.round(base * t.multiplier))}
                          <span className="text-xs font-normal text-white/45"> /adult</span>
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
                    <CalendarDays className="text-sun-400" /> {departures.length ? "Pick a departure" : "When do you travel?"}
                  </h2>
                  {departures.length ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {departures.map((d) => {
                        const left = d.totalSeats - d.bookedSeats;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            disabled={left <= 0}
                            onClick={() => setDepId(d.id)}
                            className={cn("flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition disabled:opacity-30", depId === d.id ? "border-sun-400 bg-sun-400/10" : "border-white/10 hover:border-white/30")}
                          >
                            <span>
                              <span className="block font-semibold">{formatDate(d.startDate, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
                              <span className="text-xs text-white/45">Returns {formatDate(addDays(d.startDate, pkg.durationDays - 1), { day: "numeric", month: "short" })}</span>
                            </span>
                            <span className={cn("text-xs font-semibold", left <= 5 ? "text-coral-400" : "text-aqua-300")}>{left > 0 ? `${left} seats` : "Sold out"}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-4 max-w-xs">
                      <input type="date" min={todayISO(3)} value={date} onChange={(e) => setDate(e.target.value)} className="field [color-scheme:dark]" aria-label="Travel date" />
                      <p className="mt-2 text-xs text-white/45">Returns {formatDate(addDays(date, pkg.durationDays - 1))}</p>
                    </div>
                  )}
                  {err("departureId")}
                  {err("travelDate")}
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold">Who&apos;s travelling?</h2>
                  <div className="mt-4 max-w-md divide-y divide-white/5 rounded-2xl border border-white/10 px-4">
                    <Stepper label="Adults" hint="12+ years" value={adults} min={1} max={20} onChange={setAdults} />
                    <Stepper label="Children" hint="5–11 years · 40% off" value={children} min={0} max={10} onChange={setChildren} />
                    <Stepper label="Infants" hint="Under 5 · travel free" value={infants} min={0} max={6} onChange={setInfants} />
                  </div>
                  {err("adults")}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="font-display text-2xl font-bold">Make it extra special</h2>
                <p className="mt-1 text-sm text-white/55">Optional add-ons — you can change these later with your trip expert.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {addOns.map((a) => {
                    const on = extras.includes(a.id);
                    const Icon = icons[a.icon] ?? Gift;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setExtras((x) => (on ? x.filter((y) => y !== a.id) : [...x, a.id]))}
                        className={cn("flex items-center gap-4 rounded-2xl border p-4 text-left transition", on ? "border-aqua-400 bg-aqua-400/10" : "border-white/10 hover:border-white/30")}
                      >
                        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", on ? "bg-aqua-400 text-ink-950" : "bg-white/5 text-aqua-300")}>
                          <Icon size={20} />
                        </span>
                        <span className="flex-1">
                          <span className="block font-semibold">{a.name}</span>
                          <span className="text-xs text-white/50">
                            {formatPrice(a.price)} {a.per === "person" ? "per person" : "per booking"}
                          </span>
                        </span>
                        <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border", on ? "border-aqua-400 bg-aqua-400 text-ink-950" : "border-white/20")}>{on && <Check size={14} />}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold">Lead traveller & contact</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ["customerName", "Full name (as on ID)", "text", "name"],
                      ["phone", "Mobile / WhatsApp", "tel", "tel"],
                      ["email", "Email", "email", "email"],
                      ["city", "City", "text", "address-level2"],
                    ] as const
                  ).map(([k, label, type, ac]) => (
                    <div key={k}>
                      <label className="label" htmlFor={`bk-${k}`}>
                        {label}
                      </label>
                      <input id={`bk-${k}`} type={type} autoComplete={ac} value={contact[k]} onChange={(e) => setContact((c) => ({ ...c, [k]: e.target.value }))} className="field" />
                      {err(k)}
                    </div>
                  ))}
                </div>
                {coTravellers > 0 && (
                  <div>
                    <div className="label">Co-travellers (optional — you can share later)</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Array.from({ length: Math.min(coTravellers, 12) }).map((_, i) => (
                        <input
                          key={i}
                          value={names[i] ?? ""}
                          onChange={(e) => setNames((n) => Object.assign([...n], { [i]: e.target.value }))}
                          placeholder={`Traveller ${i + 2} name`}
                          className="field"
                          aria-label={`Traveller ${i + 2} name`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="label" htmlFor="bk-req">
                    Special requests
                  </label>
                  <textarea
                    id="bk-req"
                    rows={3}
                    value={contact.specialRequests}
                    onChange={(e) => setContact((c) => ({ ...c, specialRequests: e.target.value }))}
                    className="field resize-none"
                    placeholder="Anniversary? Dietary needs? Need a wheelchair? Tell us."
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold">Review & confirm</h2>
                <dl className="grid gap-4 rounded-2xl bg-white/[0.03] p-5 text-sm sm:grid-cols-2">
                  <Row k="Package" v={pkg.title} />
                  <Row k="Travel dates" v={travelDate ? `${formatDate(travelDate)} → ${formatDate(addDays(travelDate, pkg.durationDays - 1))}` : "—"} />
                  <Row k="Hotel category" v={tiers.find((t) => t.id === tier)!.label} />
                  <Row k="Travellers" v={`${adults} adult(s)${children ? `, ${children} child(ren)` : ""}${infants ? `, ${infants} infant(s)` : ""}`} />
                  <Row k="Lead traveller" v={`${contact.customerName} · ${contact.phone}`} />
                  <Row k="Email" v={contact.email} />
                  <Row k="Add-ons" v={quote.addOns.map((a) => a.name).join(", ") || "None"} />
                </dl>
                <div className="rounded-2xl border border-aqua-400/30 bg-aqua-400/5 p-5 text-sm text-white/75">
                  <b className="text-aqua-300">How payment works:</b> Confirm now with no payment. Your trip expert verifies availability and sends a secure payment link (UPI · cards · net banking) for the 25% advance of <b className="text-white">{formatPrice(quote.advance)}</b>. Balance is due 21 days before departure.
                </div>
                <label className="flex cursor-pointer items-start gap-3 text-sm text-white/70">
                  <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#ff8a3d]" />
                  <span>
                    I agree to the booking terms & <Link href="/contact#faq" className="text-sun-300 underline" target="_blank">cancellation policy</Link>, and confirm the traveller details are correct.
                  </span>
                </label>
                {err("acceptTerms")}
                {message && <p className="rounded-2xl border border-coral-500/30 bg-coral-500/10 px-4 py-3 text-sm text-coral-400">{message}</p>}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-6">
              {step > 0 ? (
                <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-ghost">
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <Link href={`/packages/${pkg.slug}`} className="btn-ghost">
                  <ArrowLeft size={16} /> Package
                </Link>
              )}
              {step < 3 ? (
                <button type="button" onClick={next} className="btn-primary">
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button type="button" onClick={confirm} disabled={pending} className="btn-primary">
                  {pending ? <LoaderCircle size={16} className="animate-spin" /> : <BadgeCheck size={16} />} Confirm booking
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <aside>
        <div className="glass-strong sticky top-28 overflow-hidden rounded-[2rem]">
          <div className="relative h-40">
            <SmartImage src={pkg.coverImage} alt={pkg.title} label={pkg.destination} width={800} className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 to-transparent" />
            <div className="absolute bottom-3 left-5 right-5">
              <div className="text-xs text-white/60">
                {pkg.destination} · {pkg.durationDays}D/{pkg.durationNights}N
              </div>
              <div className="font-display text-lg leading-tight font-bold">{pkg.title}</div>
            </div>
          </div>
          <div className="space-y-2 p-5 text-sm">
            {travelDate && (
              <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/70">
                <CalendarDays size={14} className="text-sun-400" /> {formatDate(travelDate)} → {formatDate(addDays(travelDate, pkg.durationDays - 1))}
              </div>
            )}
            <Line k={`${adults} × adult (${tiers.find((t) => t.id === tier)!.label})`} v={formatPrice(quote.perAdult * adults)} />
            {children > 0 && <Line k={`${children} × child`} v={formatPrice(quote.perChild * children)} />}
            {infants > 0 && <Line k={`${infants} × infant`} v="Free" />}
            {quote.addOns.map((a) => (
              <Line key={a.id} k={a.name} v={formatPrice(a.amount)} />
            ))}
            <Line k="GST (5%)" v={formatPrice(quote.taxes)} />
            <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(quote.total)}</span>
            </div>
            <div className="flex justify-between rounded-xl bg-aqua-400/10 px-3 py-2 text-aqua-300">
              <span>Advance to confirm (25%)</span>
              <span className="font-bold">{formatPrice(quote.advance)}</span>
            </div>
            <p className="pt-2 text-center text-[11px] text-white/40">🔒 Secure booking · Free changes up to 30 days before travel</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-white/45">{k}</dt>
      <dd className="font-semibold text-white">{v}</dd>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 text-white/65">
      <span>{k}</span>
      <span className="text-white/85">{v}</span>
    </div>
  );
}

function Success({ result, pkg, formatPrice }: { result: Extract<BookingResult, { ok: true }>; pkg: Props["pkg"]; formatPrice: (n: number) => string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative mx-auto max-w-2xl">
      <Confetti />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", bounce: 0.35 }} className="glass-strong rounded-[2.5rem] p-8 text-center md:p-12">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-lagoon text-ink-950">
          <PartyPopper size={36} />
        </span>
        <h1 className="mt-6 font-display text-4xl font-extrabold md:text-5xl">You&apos;re going to {pkg.destination}!</h1>
        <p className="mt-3 text-white/65">Booking request received. A trip expert will confirm availability and share your payment link at {result.email} shortly.</p>
        <div className="mx-auto mt-8 max-w-sm rounded-3xl border border-dashed border-sun-400/50 bg-sun-400/5 p-5">
          <div className="text-xs tracking-widest text-white/50 uppercase">Booking reference</div>
          <div className="mt-1 flex items-center justify-center gap-3">
            <span className="font-mono text-3xl font-bold tracking-wider text-sun-300">{result.reference}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.reference);
                setCopied(true);
              }}
              className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              aria-label="Copy reference"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-white/5 p-2">
              <div className="text-[10px] text-white/45 uppercase">Total</div>
              <div className="font-bold">{formatPrice(result.total)}</div>
            </div>
            <div className="rounded-xl bg-white/5 p-2">
              <div className="text-[10px] text-white/45 uppercase">Advance (25%)</div>
              <div className="font-bold text-aqua-300">{formatPrice(result.advance)}</div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/my-booking?ref=${result.reference}`} className="btn-primary">
            Track my booking
          </Link>
          <a href={whatsappLink(site.whatsapp, `Hi! I just booked ${pkg.title}. My reference is ${result.reference}.`)} target="_blank" rel="noreferrer" className="btn-ghost">
            <WhatsAppIcon size={16} /> Share on WhatsApp
          </a>
          <Link href={`/itinerary/${pkg.slug}`} target="_blank" className="btn-ghost">
            <Download size={16} /> Itinerary PDF
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Confetti() {
  const [bits] = useState(() =>
    Array.from({ length: 28 }).map((_, i) => ({
      color: ["#ffcf85", "#ff8a3d", "#ff5e62", "#3fe6c9", "#5cc8ff"][i % 5],
      x: (Math.random() - 0.5) * 700,
      y: 200 + Math.random() * 300,
      r: Math.random() * 720,
      d: 1.8 + Math.random(),
    })),
  );
  return (
    <>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute top-0 left-1/2 h-3 w-2 rounded-sm"
          style={{ background: b.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: b.x, y: b.y, opacity: 0, rotate: b.r }}
          transition={{ duration: b.d, ease: "easeOut" }}
        />
      ))}
    </>
  );
}
