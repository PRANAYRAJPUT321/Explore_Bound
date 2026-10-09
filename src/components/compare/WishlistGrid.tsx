"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PackageCard } from "@/components/packages/PackageCard";
import { useApp } from "@/components/providers/AppProvider";
import type { PackageCard as Card } from "@/db/queries";
import { site } from "@/lib/site";
import { whatsappLink } from "@/lib/utils";

export function WishlistGrid() {
  const { wishlist, hydrated } = useApp();
  const [items, setItems] = useState<Card[] | null>(null);
  const key = wishlist.join(",");

  useEffect(() => {
    if (!hydrated) return;
    if (!key) {
      setItems([]);
      return;
    }
    fetch(`/api/packages?ids=${key}`)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, [key, hydrated]);

  if (items === null)
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[460px] animate-pulse rounded-[1.75rem] bg-white/5" />
        ))}
      </div>
    );

  if (!items.length)
    return (
      <div className="card mx-auto flex max-w-xl flex-col items-center p-12 text-center">
        <Heart size={44} className="text-coral-500" />
        <h2 className="mt-5 font-display text-3xl font-bold">Your wishlist is empty</h2>
        <p className="mt-2 text-white/60">Tap the ♥ on any package to save it here. Your wishlist stays on this device.</p>
        <Link href="/packages" className="btn-primary mt-6">
          Find something you love
        </Link>
      </div>
    );

  const share = whatsappLink(site.whatsapp, `Hi! I'm interested in these trips:\n${items.map((p) => `• ${p.title}`).join("\n")}\nCan you share the best deal?`);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-white/60">
          {items.length} saved {items.length === 1 ? "trip" : "trips"}
        </p>
        <a href={share} target="_blank" rel="noreferrer" className="btn-primary">
          Get a combined quote on WhatsApp
        </a>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <PackageCard key={p.id} pkg={p} />
        ))}
      </div>
    </>
  );
}
