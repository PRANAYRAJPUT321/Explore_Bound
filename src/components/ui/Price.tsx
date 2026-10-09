"use client";

import { useApp } from "@/components/providers/AppProvider";

/** Displays an INR amount in the visitor's chosen currency. */
export function Price({ inr, className }: { inr: number; className?: string }) {
  const { formatPrice } = useApp();
  return (
    <span className={className} suppressHydrationWarning>
      {formatPrice(inr)}
    </span>
  );
}
