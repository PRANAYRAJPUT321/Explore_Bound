import { Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DestinationForm } from "@/components/admin/DestinationForm";
import { ConfirmButton } from "@/components/admin/FormControls";
import { adminGetDestination } from "@/db/queries";
import { deleteDestination } from "@/lib/admin-actions";

export const metadata = { title: "Edit destination" };

export default async function EditDestination({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const dest = await adminGetDestination(Number(id));
  if (!dest) notFound();
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Link href="/admin/destinations" className="text-sm text-white/50 hover:text-white">
          ← All destinations
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold">{dest.name}</h1>
      </div>
      {sp.error === "has-packages" && <p className="rounded-2xl bg-coral-500/10 px-4 py-3 text-sm text-coral-400">This destination still has packages. Move or delete them first.</p>}
      <DestinationForm dest={dest} />
      <form action={deleteDestination} className="card border-coral-500/20 p-6">
        <input type="hidden" name="id" value={dest.id} />
        <p className="mb-3 text-sm text-white/50">Only destinations without packages can be deleted.</p>
        <ConfirmButton message={`Delete ${dest.name}?`} className="btn-ghost !border-coral-500/40 !text-coral-400">
          <Trash2 size={15} /> Delete destination
        </ConfirmButton>
      </form>
    </div>
  );
}
