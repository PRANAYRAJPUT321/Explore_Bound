"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { FieldError, FormMessage, SubmitButton } from "@/components/ui/FormBits";
import { SmartImage } from "@/components/ui/SmartImage";
import type { ItineraryDay, Package } from "@/db/schema";
import { savePackage, type AdminState } from "@/lib/admin-actions";
import { themes } from "@/lib/site";

type Dest = { id: number; name: string; region: string };

function toLocalInput(d: Date | null) {
  if (!d) return "";
  const x = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

export function PackageForm({ pkg, destinations, created }: { pkg?: Package | null; destinations: Dest[]; created?: boolean }) {
  const [state, action] = useActionState<AdminState, FormData>(savePackage, created ? { ok: true, message: "Package created — it's live on the site (status: active)." } : { ok: false, message: "" });
  const [cover, setCover] = useState(pkg?.coverImage ?? "");
  const [days, setDays] = useState<ItineraryDay[]>(pkg?.itinerary.length ? pkg.itinerary : [{ day: 1, title: "", description: "" }]);
  const e = state.errors;

  const update = (i: number, patch: Partial<ItineraryDay>) => setDays((d) => d.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, dir: number) =>
    setDays((d) => {
      const n = [...d];
      const j = i + dir;
      if (j < 0 || j >= n.length) return d;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <form action={action} className="space-y-6">
      {pkg && <input type="hidden" name="id" value={pkg.id} />}
      <input type="hidden" name="itinerary" value={JSON.stringify(days.map((d, i) => ({ ...d, day: i + 1 })))} />

      <section className="card grid gap-4 p-6 md:grid-cols-2">
        <h2 className="font-semibold md:col-span-2">Basics</h2>
        <div className="md:col-span-2">
          <label className="label" htmlFor="pf-title">Title</label>
          <input id="pf-title" name="title" defaultValue={pkg?.title} required className="field" />
          <FieldError errors={e} name="title" />
        </div>
        <div>
          <label className="label" htmlFor="pf-slug">URL slug (auto if empty)</label>
          <input id="pf-slug" name="slug" defaultValue={pkg?.slug} className="field font-mono" placeholder="kashmir-paradise" />
          <FieldError errors={e} name="slug" />
        </div>
        <div>
          <label className="label" htmlFor="pf-dest">Destination</label>
          <select id="pf-dest" name="destinationId" defaultValue={pkg?.destinationId ?? ""} required className="field">
            <option value="">Select…</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.region === "domestic" ? "India" : "International"})
              </option>
            ))}
          </select>
          <FieldError errors={e} name="destinationId" />
        </div>
        <div>
          <label className="label" htmlFor="pf-route">Route (comma separated)</label>
          <input id="pf-route" name="route" defaultValue={pkg?.route.join(", ")} className="field" placeholder="Srinagar, Gulmarg, Pahalgam" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="pf-days">Days</label>
            <input id="pf-days" name="durationDays" type="number" min={1} max={60} defaultValue={pkg?.durationDays ?? 5} required className="field" />
          </div>
          <div>
            <label className="label" htmlFor="pf-group">Max group size</label>
            <input id="pf-group" name="groupSizeMax" type="number" min={1} defaultValue={pkg?.groupSizeMax ?? 12} className="field" />
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="label">Themes</div>
          <div className="flex flex-wrap gap-2">
            {themes.map((t) => (
              <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs has-[:checked]:border-sun-400 has-[:checked]:bg-sun-400/15">
                <input type="checkbox" name="themes" value={t.id} defaultChecked={pkg?.themes.includes(t.id)} className="accent-[#ff8a3d]" />
                {t.emoji} {t.label}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="card grid gap-4 p-6 md:grid-cols-3">
        <h2 className="font-semibold md:col-span-3">Pricing & visibility</h2>
        <div>
          <label className="label" htmlFor="pf-price">Price per person (₹)</label>
          <input id="pf-price" name="price" type="number" min={1} defaultValue={pkg?.price} required className="field" />
          <FieldError errors={e} name="price" />
        </div>
        <div>
          <label className="label" htmlFor="pf-orig">Original price (shows strike-through)</label>
          <input id="pf-orig" name="originalPrice" type="number" min={0} defaultValue={pkg?.originalPrice ?? ""} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="pf-offer">Deal countdown ends</label>
          <input id="pf-offer" name="offerEndsAt" type="datetime-local" defaultValue={toLocalInput(pkg?.offerEndsAt ?? null)} className="field [color-scheme:dark]" />
        </div>
        <div>
          <label className="label" htmlFor="pf-status">Status</label>
          <select id="pf-status" name="status" defaultValue={pkg?.status ?? "active"} className="field">
            <option value="active">Active (visible)</option>
            <option value="draft">Draft (hidden)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="pf-diff">Difficulty</label>
          <select id="pf-diff" name="difficulty" defaultValue={pkg?.difficulty ?? "easy"} className="field">
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="challenging">Challenging</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="pf-pop">Popularity (sort weight)</label>
          <input id="pf-pop" name="popularity" type="number" min={0} defaultValue={pkg?.popularity ?? 50} className="field" />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="featured" defaultChecked={pkg?.featured} className="h-5 w-5 accent-[#ff8a3d]" /> Featured on home page
        </label>
        <label className="flex items-center gap-3 text-sm md:col-span-2">
          <input type="checkbox" name="isGroupTour" defaultChecked={pkg?.isGroupTour} className="h-5 w-5 accent-[#3fe6c9]" /> Group tour (fixed departures — add dates below after saving)
        </label>
      </section>

      <section className="card grid gap-4 p-6 md:grid-cols-[1fr_220px]">
        <h2 className="font-semibold md:col-span-2">Images</h2>
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="pf-cover">Cover image URL</label>
            <input id="pf-cover" name="coverImage" type="url" value={cover} onChange={(ev) => setCover(ev.target.value)} required className="field" placeholder="https://images.unsplash.com/photo-…" />
            <FieldError errors={e} name="coverImage" />
          </div>
          <div>
            <label className="label" htmlFor="pf-gallery">Gallery URLs (one per line)</label>
            <textarea id="pf-gallery" name="gallery" rows={4} defaultValue={pkg?.gallery.join("\n")} className="field font-mono !text-xs" />
          </div>
        </div>
        <div className="h-40 overflow-hidden rounded-2xl border border-white/10 md:h-full">
          {cover ? <SmartImage src={cover} alt="Cover preview" label="Preview" width={500} className="h-full w-full" /> : <div className="flex h-full items-center justify-center text-xs text-white/40">Cover preview</div>}
        </div>
      </section>

      <section className="card grid gap-4 p-6">
        <h2 className="font-semibold">Description</h2>
        <div>
          <label className="label" htmlFor="pf-sum">One-line summary (cards & SEO)</label>
          <input id="pf-sum" name="summary" defaultValue={pkg?.summary} required maxLength={300} className="field" />
          <FieldError errors={e} name="summary" />
        </div>
        <div>
          <label className="label" htmlFor="pf-ov">Overview</label>
          <textarea id="pf-ov" name="overview" rows={5} defaultValue={pkg?.overview} required className="field" />
          <FieldError errors={e} name="overview" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              ["highlights", "Highlights", pkg?.highlights],
              ["inclusions", "Inclusions", pkg?.inclusions],
              ["exclusions", "Exclusions", pkg?.exclusions],
            ] as const
          ).map(([name, label, val]) => (
            <div key={name}>
              <label className="label" htmlFor={`pf-${name}`}>
                {label} (one per line)
              </label>
              <textarea id={`pf-${name}`} name={name} rows={7} defaultValue={val?.join("\n")} className="field !text-xs" />
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Day-by-day itinerary</h2>
          <button type="button" onClick={() => setDays((d) => [...d, { day: d.length + 1, title: "", description: "" }])} className="btn-ghost !px-4 !py-2 text-xs">
            <Plus size={14} /> Add day
          </button>
        </div>
        <FieldError errors={e} name="itinerary" />
        <div className="space-y-3">
          {days.map((d, i) => (
            <div key={i} className="rounded-2xl border border-white/10 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-sunset px-3 py-1 text-xs font-bold text-ink-950">Day {i + 1}</span>
                <span className="flex-1" />
                <button type="button" onClick={() => move(i, -1)} className="rounded-full p-1.5 text-white/50 hover:bg-white/10" aria-label="Move up">
                  <ArrowUp size={14} />
                </button>
                <button type="button" onClick={() => move(i, 1)} className="rounded-full p-1.5 text-white/50 hover:bg-white/10" aria-label="Move down">
                  <ArrowDown size={14} />
                </button>
                <button type="button" onClick={() => setDays((x) => x.filter((_, j) => j !== i))} disabled={days.length === 1} className="rounded-full p-1.5 text-white/50 hover:text-coral-400 disabled:opacity-30" aria-label="Remove day">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input value={d.title} onChange={(ev) => update(i, { title: ev.target.value })} placeholder="Title — e.g. Arrive Srinagar · Houseboat" className="field md:col-span-2" aria-label={`Day ${i + 1} title`} />
                <textarea value={d.description} onChange={(ev) => update(i, { description: ev.target.value })} rows={3} placeholder="What happens today" className="field md:col-span-2" aria-label={`Day ${i + 1} description`} />
                <input value={d.meals ?? ""} onChange={(ev) => update(i, { meals: ev.target.value || undefined })} placeholder="Meals — Breakfast, Dinner" className="field" aria-label={`Day ${i + 1} meals`} />
                <input value={d.stay ?? ""} onChange={(ev) => update(i, { stay: ev.target.value || undefined })} placeholder="Stay — Hotel in Gulmarg" className="field" aria-label={`Day ${i + 1} stay`} />
                <input
                  value={d.activities?.join(", ") ?? ""}
                  onChange={(ev) => update(i, { activities: ev.target.value ? ev.target.value.split(",").map((s) => s.trim()) : undefined })}
                  placeholder="Activities (comma separated, optional)"
                  className="field md:col-span-2"
                  aria-label={`Day ${i + 1} activities`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="glass-strong sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-full p-2 pl-5">
        <div className="min-w-0 flex-1">
          <FormMessage state={state} />
        </div>
        <SubmitButton pendingText="Saving…">{pkg ? "Save changes" : "Create package"}</SubmitButton>
      </div>
    </form>
  );
}
