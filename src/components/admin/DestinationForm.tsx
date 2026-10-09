"use client";

import { useActionState, useState } from "react";
import { FieldError, FormMessage, SubmitButton } from "@/components/ui/FormBits";
import { SmartImage } from "@/components/ui/SmartImage";
import type { Destination } from "@/db/schema";
import { saveDestination, type AdminState } from "@/lib/admin-actions";

export function DestinationForm({ dest }: { dest?: Destination | null }) {
  const [state, action] = useActionState<AdminState, FormData>(saveDestination, { ok: false, message: "" });
  const [img, setImg] = useState(dest?.heroImage ?? "");
  const e = state.errors;
  const input = (name: keyof Destination, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label" htmlFor={`df-${name}`}>
        {label}
      </label>
      <input id={`df-${name}`} name={name} defaultValue={dest ? String(dest[name] ?? "") : ""} className="field" {...props} />
      <FieldError errors={e} name={name} />
    </div>
  );
  return (
    <form action={action} className="space-y-6">
      {dest && <input type="hidden" name="id" value={dest.id} />}
      <section className="card grid gap-4 p-6 md:grid-cols-2">
        {input("name", "Name", { required: true })}
        {input("slug", "URL slug (auto if empty)", { className: "field font-mono" })}
        {input("country", "Country / region", { required: true })}
        <div>
          <label className="label" htmlFor="df-region">Type</label>
          <select id="df-region" name="region" defaultValue={dest?.region ?? "domestic"} className="field">
            <option value="domestic">India (domestic)</option>
            <option value="international">International</option>
          </select>
        </div>
        <div className="md:col-span-2">{input("tagline", "Tagline", { required: true })}</div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="df-desc">Description</label>
          <textarea id="df-desc" name="description" rows={4} defaultValue={dest?.description} required className="field" />
          <FieldError errors={e} name="description" />
        </div>
      </section>
      <section className="card grid gap-4 p-6 md:grid-cols-[1fr_220px]">
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="df-hero">Hero image URL</label>
            <input id="df-hero" name="heroImage" type="url" value={img} onChange={(ev) => setImg(ev.target.value)} required className="field" />
            <FieldError errors={e} name="heroImage" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {input("lat", "Latitude (globe pin)", { type: "number", step: "any", required: true })}
            {input("lng", "Longitude (globe pin)", { type: "number", step: "any", required: true })}
          </div>
          <p className="text-xs text-white/40">Tip: right-click a spot in Google Maps to copy its coordinates.</p>
        </div>
        <div className="h-40 overflow-hidden rounded-2xl border border-white/10 md:h-full">{img ? <SmartImage src={img} alt="Preview" label="Preview" width={500} className="h-full w-full" /> : null}</div>
      </section>
      <section className="card grid gap-4 p-6 md:grid-cols-2">
        {input("bestTime", "Best time to visit", { required: true })}
        {input("climate", "Weather / climate")}
        <div className="md:col-span-2">{input("visaInfo", "Visa / permit info")}</div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="df-hl">Highlights (one per line)</label>
          <textarea id="df-hl" name="highlights" rows={4} defaultValue={dest?.highlights.join("\n")} className="field" />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="featured" defaultChecked={dest?.featured} className="h-5 w-5 accent-[#ff8a3d]" /> Featured (shown first, suggested in trip planner)
        </label>
      </section>
      <div className="glass-strong sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-full p-2 pl-5">
        <div className="min-w-0 flex-1">
          <FormMessage state={state} />
        </div>
        <SubmitButton pendingText="Saving…">{dest ? "Save destination" : "Create destination"}</SubmitButton>
      </div>
    </form>
  );
}
