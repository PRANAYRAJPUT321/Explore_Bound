/** Shared pricing rules — used by the booking UI and re-checked on the server. */

export const tiers = [
  { id: "standard", label: "Standard", stars: 3, multiplier: 1, blurb: "Comfortable 3★ hotels & houseboats" },
  { id: "deluxe", label: "Deluxe", stars: 4, multiplier: 1.22, blurb: "Upgraded 4★ stays with better views" },
  { id: "luxury", label: "Luxury", stars: 5, multiplier: 1.6, blurb: "5★ resorts, villas & signature experiences" },
] as const;

export type TierId = (typeof tiers)[number]["id"];

export const addOns = [
  { id: "insurance", name: "Travel insurance", price: 899, per: "person" as const, icon: "ShieldCheck" },
  { id: "airport", name: "Private airport transfers", price: 2500, per: "booking" as const, icon: "Car" },
  { id: "photo", name: "Pro photoshoot (2 hrs)", price: 6500, per: "booking" as const, icon: "Camera" },
  { id: "dinner", name: "Candle-light dinner", price: 4500, per: "booking" as const, icon: "Utensils" },
  { id: "adventure", name: "Adventure activity pack", price: 3500, per: "person" as const, icon: "Mountain" },
  { id: "cake", name: "Celebration cake & décor", price: 2200, per: "booking" as const, icon: "Gift" },
];

export type AddOnId = (typeof addOns)[number]["id"];

export const CHILD_RATE = 0.6; // children 5–11 years
export const INFANT_RATE = 0; // under 5 travel free (no extra bed)
export const GST_RATE = 0.05;
export const ADVANCE_RATE = 0.25;

export type PriceInput = {
  basePrice: number;
  tier: TierId;
  adults: number;
  children: number;
  infants: number;
  addOnIds: string[];
};

export function calculatePrice({ basePrice, tier, adults, children, infants, addOnIds }: PriceInput) {
  const t = tiers.find((x) => x.id === tier) ?? tiers[0];
  const perAdult = Math.round(basePrice * t.multiplier);
  const perChild = Math.round(perAdult * CHILD_RATE);
  const travellersPaying = adults + children;
  const selected = addOns
    .filter((a) => addOnIds.includes(a.id))
    .map((a) => ({ id: a.id, name: a.name, amount: a.per === "person" ? a.price * travellersPaying : a.price }));
  const base = perAdult * adults + perChild * children + Math.round(perAdult * INFANT_RATE) * infants;
  const addOnTotal = selected.reduce((s, a) => s + a.amount, 0);
  const subtotal = base + addOnTotal;
  const taxes = Math.round(subtotal * GST_RATE);
  const total = subtotal + taxes;
  const advance = Math.round(total * ADVANCE_RATE);
  return { perAdult, perChild, base, addOns: selected, addOnTotal, subtotal, taxes, total, advance };
}

/** Simple EMI: P·r·(1+r)^n / ((1+r)^n − 1) */
export function emi(principal: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return Math.round(principal / months);
  const f = Math.pow(1 + r, months);
  return Math.round((principal * r * f) / (f - 1));
}
