"use client";

import { History } from "lucide-react";
import { useEffect, useState } from "react";
import { PackageCard } from "@/components/packages/PackageCard";
import { useApp } from "@/components/providers/AppProvider";
import type { PackageCard as Card } from "@/db/queries";

export function RecentlyViewed({ exclude, title = "Pick up where you left off" }: { exclude?: number; title?: string }) {
  const { recent, hydrated } = useApp();
  const [items, setItems] = useState<Card[]>([]);
  const ids = recent.filter((id) => id !== exclude).slice(0, 4);
  const key = ids.join(",");

  useEffect(() => {
    if (!key) {
      setItems([]);
      return;
    }
    fetch(`/api/packages?ids=${key}`)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {});
  }, [key]);

  if (!hydrated || !items.length) return null;
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-16 md:px-8">
      <h2 className="mb-8 flex items-center gap-3 font-display text-2xl font-bold md:text-3xl">
        <History className="text-aqua-300" /> {title}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <PackageCard key={p.id} pkg={p} />
        ))}
      </div>
    </section>
  );
}
