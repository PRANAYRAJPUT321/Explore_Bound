"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CURRENCY_COOKIE, currencies, type CurrencyCode } from "@/lib/site";

type Toast = { id: number; message: string; tone: "success" | "info" | "error" };

type AppState = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (inr: number) => string;
  wishlist: number[];
  toggleWishlist: (id: number, title?: string) => void;
  compare: number[];
  toggleCompare: (id: number, title?: string) => void;
  clearCompare: () => void;
  recent: number[];
  pushRecent: (id: number) => void;
  toast: (message: string, tone?: Toast["tone"]) => void;
  hydrated: boolean;
};

const AppContext = createContext<AppState | null>(null);

function readList(key: string): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(v) ? v.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

function writeList(key: string, list: number[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* storage unavailable (private mode) — keep in memory */
  }
}

export const MAX_COMPARE = 3;

export function AppProvider({ children, initialCurrency }: { children: React.ReactNode; initialCurrency: CurrencyCode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [compare, setCompare] = useState<number[]>([]);
  const [recent, setRecent] = useState<number[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const toastId = useRef(0);

  useEffect(() => {
    setWishlist(readList("eb_wishlist"));
    setCompare(readList("eb_compare"));
    setRecent(readList("eb_recent"));
    setHydrated(true);
  }, []);

  const toast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    document.cookie = `${CURRENCY_COOKIE}=${c}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const formatPrice = useCallback(
    (inr: number) => {
      const c = currencies[currency];
      if (currency === "INR") return `₹${Math.round(inr).toLocaleString("en-IN")}`;
      const v = inr * c.rate;
      return `${c.symbol}${Math.round(v).toLocaleString(c.locale)}`;
    },
    [currency],
  );

  // Mirrors of the lists so toggles can read the latest value without side effects inside state updaters.
  const wishRef = useRef<number[]>([]);
  const compareRef = useRef<number[]>([]);
  useEffect(() => {
    wishRef.current = wishlist;
  }, [wishlist]);
  useEffect(() => {
    compareRef.current = compare;
  }, [compare]);

  const toggleWishlist = useCallback(
    (id: number, title?: string) => {
      const prev = wishRef.current;
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : [id, ...prev];
      wishRef.current = next;
      setWishlist(next);
      writeList("eb_wishlist", next);
      toast(has ? "Removed from wishlist" : `Saved ${title ? `“${title}” ` : ""}to your wishlist ♥`, has ? "info" : "success");
    },
    [toast],
  );

  const toggleCompare = useCallback(
    (id: number, title?: string) => {
      const prev = compareRef.current;
      if (!prev.includes(id) && prev.length >= MAX_COMPARE) {
        toast(`You can compare up to ${MAX_COMPARE} packages`, "error");
        return;
      }
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : [...prev, id];
      compareRef.current = next;
      setCompare(next);
      writeList("eb_compare", next);
      if (!has) toast(`Added ${title ? `“${title}” ` : ""}to compare`, "info");
    },
    [toast],
  );

  const clearCompare = useCallback(() => {
    compareRef.current = [];
    setCompare([]);
    writeList("eb_compare", []);
  }, []);

  const pushRecent = useCallback((id: number) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 8);
      writeList("eb_recent", next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ currency, setCurrency, formatPrice, wishlist, toggleWishlist, compare, toggleCompare, clearCompare, recent, pushRecent, toast, hydrated }),
    [currency, setCurrency, formatPrice, wishlist, toggleWishlist, compare, toggleCompare, clearCompare, recent, pushRecent, toast, hydrated],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[200] flex flex-col items-center gap-2 px-4" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`glass-strong pointer-events-auto rounded-full px-5 py-2.5 text-sm font-medium shadow-2xl ${
                t.tone === "error" ? "text-coral-400" : t.tone === "info" ? "text-aqua-300" : "text-sun-300"
              }`}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
