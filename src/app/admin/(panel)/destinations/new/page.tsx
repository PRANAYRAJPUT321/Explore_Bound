import Link from "next/link";
import { DestinationForm } from "@/components/admin/DestinationForm";

export const metadata = { title: "New destination" };

export default function NewDestination() {
  return (
    <div className="max-w-4xl">
      <Link href="/admin/destinations" className="text-sm text-white/50 hover:text-white">
        ← All destinations
      </Link>
      <h1 className="mt-2 mb-6 font-display text-3xl font-bold">New destination</h1>
      <DestinationForm />
    </div>
  );
}
