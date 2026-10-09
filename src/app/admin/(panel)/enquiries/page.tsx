import { Trash2 } from "lucide-react";
import Link from "next/link";
import { AutoSelect, ConfirmButton } from "@/components/admin/FormControls";
import { StatusPill } from "@/components/admin/StatusPill";
import { adminListEnquiries } from "@/db/queries";
import { deleteEnquiry, updateEnquiry } from "@/lib/admin-actions";
import { themeLabel } from "@/lib/site";
import { cn, formatDate, timeAgo } from "@/lib/utils";

export const metadata = { title: "Enquiries" };

const typeLabel: Record<string, string> = { "custom-trip": "Trip planner", package: "Package enquiry", contact: "Contact form", callback: "Callback request" };

export default async function AdminEnquiries({ searchParams }: { searchParams: Promise<{ status?: string; type?: string }> }) {
  const { status = "all", type = "all" } = await searchParams;
  const all = await adminListEnquiries();
  const list = all.filter((e) => (status === "all" || e.status === status) && (type === "all" || e.type === type));
  const link = (patch: { status?: string; type?: string }) => `/admin/enquiries?status=${patch.status ?? status}&type=${patch.type ?? type}`;
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">Enquiries & leads</h1>
        <p className="text-sm text-white/50">Trip-planner requests, package questions, contact messages and callback requests.</p>
      </header>
      <div className="mb-3 flex flex-wrap gap-2">
        {["all", "new", "contacted", "converted", "closed"].map((s) => (
          <Link key={s} href={link({ status: s })} className={cn("rounded-full px-4 py-2 text-sm capitalize", status === s ? "bg-white text-ink-950" : "bg-white/5 text-white/65 hover:text-white")}>
            {s} <span className="opacity-60">{s === "all" ? all.length : all.filter((e) => e.status === s).length}</span>
          </Link>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        {["all", "custom-trip", "package", "callback", "contact"].map((t) => (
          <Link key={t} href={link({ type: t })} className={cn("rounded-full border px-3 py-1.5", type === t ? "border-sun-400 text-sun-200" : "border-white/10 text-white/55 hover:text-white")}>
            {t === "all" ? "All types" : typeLabel[t]}
          </Link>
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {list.map((e) => (
          <article key={e.id} className="card flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold tracking-widest text-sun-300 uppercase">{typeLabel[e.type]}</div>
                <h2 className="mt-1 font-semibold">{e.name}</h2>
                <div className="text-xs text-white/50">
                  {[e.phone, e.email].filter(Boolean).join(" · ")}
                </div>
              </div>
              <div className="text-right">
                <StatusPill status={e.status} />
                <div className="mt-1 text-[11px] text-white/35">{timeAgo(e.createdAt)}</div>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {e.package && <Field k="Package" v={e.package.title} />}
              {e.destination && <Field k="Destination" v={e.destination} />}
              {e.travelMonth && <Field k="When" v={e.travelMonth} />}
              {e.duration && <Field k="Duration" v={e.duration} />}
              {e.travellers && <Field k="Travellers" v={e.travellers} />}
              {e.budget && <Field k="Budget" v={e.budget} />}
              {e.preferredTime && <Field k="Call time" v={e.preferredTime} />}
              {e.interests.length > 0 && <Field k="Interests" v={e.interests.map(themeLabel).join(", ")} />}
            </dl>
            {e.message && <p className="mt-3 rounded-xl bg-white/[0.03] p-3 text-sm whitespace-pre-line text-white/70">{e.message}</p>}
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
              {e.phone && <a href={`tel:${e.phone.replace(/\s/g, "")}`} className="btn-ghost !px-3 !py-1.5 text-xs">Call</a>}
              {e.phone && <a href={`https://wa.me/${e.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="btn-ghost !px-3 !py-1.5 text-xs">WhatsApp</a>}
              {e.email && <a href={`mailto:${e.email}`} className="btn-ghost !px-3 !py-1.5 text-xs">Email</a>}
              <span className="flex-1" />
              <form action={updateEnquiry}>
                <input type="hidden" name="id" value={e.id} />
                <AutoSelect name="status" label="Lead status" defaultValue={e.status} options={["new", "contacted", "converted", "closed"]} />
              </form>
              <form action={deleteEnquiry}>
                <input type="hidden" name="id" value={e.id} />
                <ConfirmButton message="Delete this enquiry?" className="rounded-full p-2 text-white/40 hover:text-coral-400">
                  <Trash2 size={15} />
                </ConfirmButton>
              </form>
            </div>
            <div className="mt-2 text-[11px] text-white/30">Received {formatDate(e.createdAt, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</div>
          </article>
        ))}
        {list.length === 0 && <p className="card p-10 text-center text-white/50 xl:col-span-2">Nothing here.</p>}
      </div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-white/40">{k}</dt>
      <dd className="truncate text-white/85">{v}</dd>
    </div>
  );
}
