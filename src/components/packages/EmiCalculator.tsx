"use client";

import { Calculator } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { emi } from "@/lib/pricing";

export function EmiCalculator({ price }: { price: number }) {
  const { formatPrice } = useApp();
  const [people, setPeople] = useState(2);
  const [months, setMonths] = useState(6);
  const rate = 14;
  const principal = price * people;
  const monthly = emi(principal, rate, months);
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-aqua-400/15 text-aqua-300">
          <Calculator size={20} />
        </span>
        <div>
          <h3 className="font-display text-xl font-bold">Travel now, pay later</h3>
          <p className="text-xs text-white/50">Estimate easy monthly instalments*</p>
        </div>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="label">Travellers: {people}</span>
          <input type="range" min={1} max={10} value={people} onChange={(e) => setPeople(+e.target.value)} className="w-full accent-[#3fe6c9]" />
        </label>
        <label className="block">
          <span className="label">Tenure: {months} months</span>
          <input type="range" min={3} max={24} step={3} value={months} onChange={(e) => setMonths(+e.target.value)} className="w-full accent-[#3fe6c9]" />
        </label>
      </div>
      <div className="mt-6 flex items-end justify-between rounded-2xl bg-white/[0.04] p-4">
        <div>
          <div className="text-xs text-white/50">Trip value</div>
          <div className="font-semibold">{formatPrice(principal)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/50">EMI from</div>
          <div className="font-display text-3xl font-bold text-aqua-300">
            {formatPrice(monthly)}
            <span className="text-sm text-white/50">/mo</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-white/35">*Indicative at {rate}% p.a. via partner lenders; subject to approval. Base package price, before taxes.</p>
    </div>
  );
}
