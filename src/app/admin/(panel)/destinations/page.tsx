import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { SmartImage } from "@/components/ui/SmartImage";
import { listDestinations } from "@/db/queries";

export const metadata = { title: "Destinations" };

export default async function AdminDestinations({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const [list, sp] = await Promise.all([listDestinations(), searchParams]);
  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Destinations</h1>
          <p className="text-sm text-white/50">Each destination appears as a pin on the 3D globe and in menus.</p>
        </div>
        <Link href="/admin/destinations/new" className="btn-primary">
          <Plus size={16} /> New destination
        </Link>
      </header>
      {sp.created && <p className="mb-4 rounded-2xl bg-aqua-400/10 px-4 py-3 text-sm text-aqua-300">Destination created — it&apos;s now on the globe.</p>}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => (
          <Link key={d.id} href={`/admin/destinations/${d.id}`} className="card group flex items-center gap-3 p-3 transition hover:border-white/25">
            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl">
              <SmartImage src={d.heroImage} alt="" label={d.name} width={200} className="h-full w-full" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{d.name}</div>
              <div className="truncate text-xs text-white/45">
                {d.region === "domestic" ? "India" : d.country} · {d.packageCount} packages
              </div>
            </div>
            <Pencil size={15} className="text-white/30 group-hover:text-white" />
          </Link>
        ))}
      </div>
    </div>
  );
}
