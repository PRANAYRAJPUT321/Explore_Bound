"use client";

import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function PrintBar({ slug }: { slug: string }) {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-white/90 px-6 py-3 backdrop-blur">
      <Link href={`/packages/${slug}`} className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-black">
        <ArrowLeft size={16} /> Back to package
      </Link>
      <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white">
        <Printer size={16} /> Print / Save as PDF
      </button>
    </div>
  );
}
