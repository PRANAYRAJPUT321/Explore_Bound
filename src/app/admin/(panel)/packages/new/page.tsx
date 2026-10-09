import Link from "next/link";
import { PackageForm } from "@/components/admin/PackageForm";
import { adminListDestinations } from "@/db/queries";

export const metadata = { title: "New package" };

export default async function NewPackage() {
  const destinations = await adminListDestinations();
  return (
    <div className="max-w-5xl">
      <Link href="/admin/packages" className="text-sm text-white/50 hover:text-white">
        ← All packages
      </Link>
      <h1 className="mt-2 mb-6 font-display text-3xl font-bold">New package</h1>
      {destinations.length === 0 ? (
        <p className="card p-6">
          Add a <Link href="/admin/destinations/new" className="text-sun-300 underline">destination</Link> first.
        </p>
      ) : (
        <PackageForm destinations={destinations.map((d) => ({ id: d.id, name: d.name, region: d.region }))} />
      )}
    </div>
  );
}
