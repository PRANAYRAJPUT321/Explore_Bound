"use client";

import { GitCompare, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/components/providers/AppProvider";

/** Keeps the URL (?ids=) in sync with the visitor's saved compare list. */
export function CompareSync({ ids }: { ids: number[] }) {
  const { compare, hydrated } = useApp();
  const router = useRouter();
  useEffect(() => {
    if (!hydrated) return;
    if (compare.join(",") !== ids.join(",")) router.replace(compare.length ? `/compare?ids=${compare.join(",")}` : "/compare", { scroll: false });
  }, [compare, hydrated, ids, router]);
  return null;
}

export function RemoveFromCompare({ id }: { id: number }) {
  const { toggleCompare } = useApp();
  return (
    <button onClick={() => toggleCompare(id)} className="absolute top-3 right-3 z-10 rounded-full bg-ink-950/60 p-1.5 text-white/80 backdrop-blur hover:text-white" aria-label="Remove from comparison">
      <X size={14} />
    </button>
  );
}

export function EmptyCompare() {
  return (
    <div className="card mx-auto flex max-w-xl flex-col items-center p-12 text-center">
      <GitCompare size={44} className="text-aqua-300" />
      <h2 className="mt-5 font-display text-3xl font-bold">Nothing to compare yet</h2>
      <p className="mt-2 text-white/60">Tap the compare icon on up to 3 packages and see them side by side — price, inclusions, duration and more.</p>
      <Link href="/packages" className="btn-primary mt-6">
        Browse packages
      </Link>
    </div>
  );
}
