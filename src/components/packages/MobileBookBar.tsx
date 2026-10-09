"use client";

import Link from "next/link";
import { Price } from "@/components/ui/Price";

export function MobileBookBar({ slug, price }: { slug: string; price: number }) {
  return (
    <div className="no-print glass-strong fixed inset-x-3 bottom-3 z-[60] flex items-center justify-between gap-3 rounded-full py-2 pr-2 pl-5 shadow-2xl lg:hidden">
      <div className="leading-tight">
        <div className="text-[10px] tracking-widest text-white/50 uppercase">From / person</div>
        <Price inr={price} className="font-display text-xl font-bold" />
      </div>
      <Link href={`/book/${slug}`} className="btn-primary !py-3">
        Book now
      </Link>
    </div>
  );
}
