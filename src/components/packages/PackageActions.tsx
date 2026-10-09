"use client";

import { GitCompare, Heart, Share2 } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { cn } from "@/lib/utils";

export function WishlistButton({ id, title, className, withLabel }: { id: number; title?: string; className?: string; withLabel?: boolean }) {
  const { wishlist, toggleWishlist, hydrated } = useApp();
  const on = hydrated && wishlist.includes(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(id, title);
      }}
      aria-pressed={on}
      aria-label={on ? "Remove from wishlist" : "Save to wishlist"}
      className={cn(
        "flex items-center justify-center gap-2 rounded-full backdrop-blur-md transition active:scale-90",
        withLabel ? "btn-ghost" : "h-10 w-10 bg-ink-950/40 hover:bg-ink-950/70",
        on ? "text-coral-500" : "text-white",
        className,
      )}
    >
      <Heart size={18} fill={on ? "currentColor" : "none"} className={cn("transition", on && "scale-110")} />
      {withLabel ? (on ? "Saved" : "Save") : null}
    </button>
  );
}

export function CompareButton({ id, title, className, withLabel }: { id: number; title?: string; className?: string; withLabel?: boolean }) {
  const { compare, toggleCompare, hydrated } = useApp();
  const on = hydrated && compare.includes(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCompare(id, title);
      }}
      aria-pressed={on}
      title={on ? "Remove from compare" : "Add to compare"}
      className={cn(
        "flex items-center justify-center gap-2 rounded-full transition active:scale-90",
        withLabel ? "btn-ghost" : "h-9 w-9 border border-white/10",
        on ? "border-aqua-400/60 bg-aqua-400/15 text-aqua-300" : "text-white/70 hover:text-white",
        className,
      )}
    >
      <GitCompare size={16} />
      {withLabel ? (on ? "Comparing" : "Compare") : null}
    </button>
  );
}

export function ShareButton({ title, text, className }: { title: string; text: string; className?: string }) {
  const { toast } = useApp();
  return (
    <button
      type="button"
      className={cn("btn-ghost", className)}
      onClick={async () => {
        const url = window.location.href;
        if (navigator.share) {
          try {
            await navigator.share({ title, text, url });
          } catch {
            /* user cancelled */
          }
        } else {
          await navigator.clipboard.writeText(url);
          toast("Link copied — share it with your travel buddies!");
        }
      }}
    >
      <Share2 size={16} /> Share
    </button>
  );
}
