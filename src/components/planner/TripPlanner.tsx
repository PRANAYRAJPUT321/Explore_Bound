"use client";

import { ArrowLeft, ArrowRight, Check, LoaderCircle, Plane, Shuffle, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Stepper } from "@/components/packages/BookingWidget";
import { Logo } from "@/components/ui/Icons";
import { submitTripPlan } from "@/lib/actions";
import { themes } from "@/lib/site";
import { cn } from "@/lib/utils";

const budgets = ["Under ₹25k", "₹25k – 50k", "₹50k – 1L", "₹1L – 2L", "₹2L+"];
const durations = ["2-3 days", "4-5 days", "6-8 days", "9-12 days", "2 weeks+"];
const stays = ["Homestays & boutique", "3★ comfort", "4★ premium", "5★ luxury"];

function nextMonths() {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < 12; i++) {
    out.push(d.toLocaleString("en-IN", { month: "short", year: "numeric" }));
    d.setMonth(d.getMonth() + 1);
  }
  return out;
}

const stepsMeta = ["Destination", "Dates", "Travellers", "Style", "Contact"];

export function TripPlanner({ suggestions }: { suggestions: string[] }) {
  const months = nextMonths();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    destination: "",
    travelMonth: "",
    duration: "",
    adults: 2,
    children: 0,
    budget: "",
    interests: [] as string[],
    stay: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState<string | null>(null);
  const [failure, setFailure] = useState("");
  const [pending, start] = useTransition();
  const set = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) => setData((d) => ({ ...d, [k]: v }));

  const canNext = [data.destination.trim().length >= 2, Boolean(data.travelMonth && data.duration), data.adults >= 1, Boolean(data.budget), true][step];

  function submit() {
    setFailure("");
    start(async () => {
      const res = await submitTripPlan(data);
      if (res.ok) setDone(res.message);
      else {
        setErrors(res.errors ?? {});
        setFailure(res.message);
      }
    });
  }

  const chip = (on: boolean) => cn("rounded-2xl border px-4 py-3 text-sm font-semibold transition", on ? "border-sun-400 bg-sun-400/15 text-sun-100" : "border-white/10 text-white/70 hover:border-white/30 hover:text-white");

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
      <div className="card p-6 md:p-10">
        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-lagoon text-ink-950">
              <Check size={38} />
            </span>
            <h2 className="mt-6 font-display text-4xl font-bold">Request received!</h2>
            <p className="mx-auto mt-3 max-w-md text-white/65">{done}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={`/packages?q=${encodeURIComponent(data.destination)}`} className="btn-primary">
                Browse {data.destination} trips
              </Link>
              <Link href="/" className="btn-ghost">
                Back home
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex justify-between text-xs font-semibold text-white/50">
                <span>
                  Step {step + 1} of {stepsMeta.length} · {stepsMeta[step]}
                </span>
                <span>{Math.round(((step + 1) / stepsMeta.length) * 100)}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-sunset" animate={{ width: `${((step + 1) / stepsMeta.length) * 100}%` }} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="min-h-[300px]">
                {step === 0 && (
                  <div>
                    <h2 className="font-display text-3xl font-bold">Where is your heart taking you?</h2>
                    <input value={data.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Type a place, region or vibe… e.g. Swiss Alps" className="field mt-6 !py-4 !text-lg" autoFocus />
                    <div className="mt-5 flex flex-wrap gap-2">
                      {suggestions.map((s) => (
                        <button key={s} type="button" onClick={() => set("destination", s)} className={chip(data.destination === s)}>
                          {s}
                        </button>
                      ))}
                      <button type="button" onClick={() => set("destination", "Surprise me!")} className={cn(chip(data.destination === "Surprise me!"), "flex items-center gap-2")}>
                        <Shuffle size={14} /> Surprise me
                      </button>
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <div>
                    <h2 className="font-display text-3xl font-bold">When & for how long?</h2>
                    <div className="label mt-6">Month</div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {months.map((m) => (
                        <button key={m} type="button" onClick={() => set("travelMonth", m)} className={chip(data.travelMonth === m)}>
                          {m}
                        </button>
                      ))}
                    </div>
                    <div className="label mt-6">Duration</div>
                    <div className="flex flex-wrap gap-2">
                      {durations.map((d) => (
                        <button key={d} type="button" onClick={() => set("duration", d)} className={chip(data.duration === d)}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <h2 className="font-display text-3xl font-bold">Who&apos;s coming along?</h2>
                    <div className="mt-6 max-w-md divide-y divide-white/5 rounded-2xl border border-white/10 px-4">
                      <Stepper label="Adults" hint="12+ years" value={data.adults} min={1} max={50} onChange={(v) => set("adults", v)} />
                      <Stepper label="Children" hint="Under 12" value={data.children} min={0} max={20} onChange={(v) => set("children", v)} />
                    </div>
                    <p className="mt-4 text-sm text-white/50">Travelling with 10+ people? Ask about our private group & corporate offsite deals.</p>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <h2 className="font-display text-3xl font-bold">Your style & budget</h2>
                    <div className="label mt-6">Budget per person</div>
                    <div className="flex flex-wrap gap-2">
                      {budgets.map((b) => (
                        <button key={b} type="button" onClick={() => set("budget", b)} className={chip(data.budget === b)}>
                          {b}
                        </button>
                      ))}
                    </div>
                    <div className="label mt-6">Stay preference</div>
                    <div className="flex flex-wrap gap-2">
                      {stays.map((b) => (
                        <button key={b} type="button" onClick={() => set("stay", data.stay === b ? "" : b)} className={chip(data.stay === b)}>
                          {b}
                        </button>
                      ))}
                    </div>
                    <div className="label mt-6">Interests (pick any)</div>
                    <div className="flex flex-wrap gap-2">
                      {themes.map((t) => {
                        const on = data.interests.includes(t.id);
                        return (
                          <button key={t.id} type="button" onClick={() => set("interests", on ? data.interests.filter((x) => x !== t.id) : [...data.interests, t.id])} className={cn("rounded-full border px-3.5 py-2 text-xs font-semibold transition", on ? "border-aqua-400 bg-aqua-400/15 text-aqua-300" : "border-white/10 text-white/65 hover:border-white/30")}>
                            {t.emoji} {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div>
                    <h2 className="font-display text-3xl font-bold">Where should we send your itinerary?</h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {(
                        [
                          ["name", "Your name", "text", "name"],
                          ["phone", "Phone / WhatsApp", "tel", "tel"],
                          ["email", "Email", "email", "email"],
                        ] as const
                      ).map(([k, l, t, ac]) => (
                        <div key={k} className={k === "email" ? "sm:col-span-2" : ""}>
                          <label className="label" htmlFor={`tp-${k}`}>
                            {l}
                          </label>
                          <input id={`tp-${k}`} type={t} autoComplete={ac} value={data[k]} onChange={(e) => set(k, e.target.value)} className="field" />
                          {errors[k]?.[0] && <p className="field-error">{errors[k][0]}</p>}
                        </div>
                      ))}
                      <div className="sm:col-span-2">
                        <label className="label" htmlFor="tp-msg">
                          Anything else? (optional)
                        </label>
                        <textarea id="tp-msg" rows={3} value={data.message} onChange={(e) => set("message", e.target.value)} className="field resize-none" placeholder="Celebrating something? Must-see places? Dietary needs?" />
                      </div>
                    </div>
                    {failure && <p className="mt-4 rounded-2xl border border-coral-500/30 bg-coral-500/10 px-4 py-3 text-sm text-coral-400">{failure}</p>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
              <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn-ghost disabled:opacity-0">
                <ArrowLeft size={16} /> Back
              </button>
              {step < 4 ? (
                <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="btn-primary">
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={pending} className="btn-primary">
                  {pending ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />} Get my free itinerary
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <BoardingPass data={data} flipped={Boolean(done)} />
    </div>
  );
}

function BoardingPass({ data, flipped }: { data: { destination: string; travelMonth: string; duration: string; adults: number; children: number; budget: string; stay: string; name: string }; flipped: boolean }) {
  const code = (data.destination || "???").replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase().padEnd(3, "·");
  return (
    <div className="sticky top-28 hidden [perspective:1600px] lg:block">
      <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} className="relative preserve-3d">
        <motion.div animate={{ rotateX: [6, -4, 6], rotateZ: [-2, 1, -2] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="preserve-3d">
          <div className="backface-hidden overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#ffcf85,#ff8a3d_45%,#ff5e62)] text-ink-950 shadow-[0_50px_100px_-30px_rgb(255_94_98/0.5)]">
            <div className="flex items-center justify-between px-7 pt-6">
              <div className="flex items-center gap-2">
                <Logo className="h-8 w-8" />
                <span className="font-display font-extrabold">EXPLORE BOUND</span>
              </div>
              <span className="text-xs font-bold tracking-[0.3em]">BOARDING PASS</span>
            </div>
            <div className="flex items-center justify-between px-7 py-8">
              <div>
                <div className="text-xs font-bold opacity-60">FROM</div>
                <div className="font-display text-5xl font-extrabold">IND</div>
                <div className="text-xs font-semibold">Home</div>
              </div>
              <Plane size={34} className="rotate-90" />
              <div className="text-right">
                <div className="text-xs font-bold opacity-60">TO</div>
                <div className="font-display text-5xl font-extrabold">{code}</div>
                <div className="max-w-40 truncate text-xs font-semibold">{data.destination || "Your dream place"}</div>
              </div>
            </div>
            <div className="relative border-t-2 border-dashed border-ink-950/25">
              <span className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-ink-950" />
              <span className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-ink-950" />
            </div>
            <div className="grid grid-cols-3 gap-4 px-7 py-6 text-sm">
              <PassField k="Passenger" v={data.name || "You"} />
              <PassField k="Month" v={data.travelMonth || "—"} />
              <PassField k="Duration" v={data.duration || "—"} />
              <PassField k="Travellers" v={`${data.adults}A ${data.children ? `${data.children}C` : ""}`} />
              <PassField k="Budget" v={data.budget || "—"} />
              <PassField k="Class" v={data.stay || "Any"} />
            </div>
            <div className="flex h-14 items-end gap-[3px] bg-ink-950/10 px-7 pb-3">
              {Array.from({ length: 48 }).map((_, i) => (
                <span key={i} className="bg-ink-950/80" style={{ width: (i * 7) % 3 === 0 ? 3 : 1.5, height: 18 + ((i * 13) % 20) }} />
              ))}
            </div>
          </div>
          <div className="backface-hidden absolute inset-0 flex [transform:rotateY(180deg)] flex-col items-center justify-center rounded-[2rem] bg-lagoon p-10 text-center text-ink-950">
            <Sparkles size={48} />
            <div className="mt-4 font-display text-3xl font-extrabold">Cleared for take-off!</div>
            <p className="mt-2 font-medium">Your trip designer is already on it.</p>
          </div>
        </motion.div>
      </motion.div>
      <p className="mt-6 text-center text-sm text-white/45">Your boarding pass updates as you plan ✈️</p>
    </div>
  );
}

function PassField({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-bold tracking-widest opacity-60">{k.toUpperCase()}</div>
      <div className="truncate font-bold">{v}</div>
    </div>
  );
}
