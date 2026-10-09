"use client";

import { ArrowUpRight, Clock, MapPin, Search, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Price } from "@/components/ui/Price";
import { SmartImage } from "@/components/ui/SmartImage";

const EVENT = "eb:open-search";
export const openSearch = () => window.dispatchEvent(new Event(EVENT));

type Results = {
  packages: { slug: string; title: string; price: number; days: number; image: string }[];
  destinations: { slug: string; name: string; country: string; image: string }[];
};

const popular = ["Bali", "Kashmir", "Dubai", "Ladakh", "Maldives", "Europe", "Kerala", "Thailand"];

export function SearchOverlay() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Results>({ packages: [], destinations: [] });
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const show = () => setOpen(true);
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener(EVENT, show);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener(EVENT, show);
      window.removeEventListener("keydown", key);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 50);
    else setQ("");
  }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults({ packages: [], destinations: [] });
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        setResults(await res.json());
        setActive(0);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const items = useMemo(
    () => [
      ...results.destinations.map((d) => ({ href: `/destinations/${d.slug}`, key: `d-${d.slug}` })),
      ...results.packages.map((p) => ({ href: `/packages/${p.slug}`, key: `p-${p.slug}` })),
      ...(q.trim().length >= 2 ? [{ href: `/packages?q=${encodeURIComponent(q.trim())}`, key: "all" }] : []),
    ],
    [results, q],
  );

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && items[active]) {
      e.preventDefault();
      go(items[active].href);
    }
  }

  let idx = -1;
  const rowClass = (i: number) => `flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition ${i === active ? "bg-white/10" : "hover:bg-white/5"}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-md" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ y: 30, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            className="glass-strong relative w-full max-w-2xl overflow-hidden rounded-[2rem] shadow-[0_40px_120px_-20px_rgb(0_0_0/0.9)]"
            role="dialog"
            aria-label="Search"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5">
              <Search size={20} className={loading ? "animate-pulse text-sun-400" : "text-white/50"} />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Search destinations, packages, cities…"
                className="h-16 flex-1 bg-transparent text-lg text-white outline-none placeholder:text-white/35"
              />
              <button onClick={() => setOpen(false)} className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Close search">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3" data-lenis-prevent>
              {q.trim().length < 2 ? (
                <div className="p-3">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-white/40 uppercase">
                    <Sparkles size={14} /> Popular right now
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popular.map((p) => (
                      <button key={p} onClick={() => setQ(p)} className="chip transition hover:border-sun-400/50 hover:text-white">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : items.length <= 1 && !loading ? (
                <div className="p-6 text-center text-white/60">
                  No matches for “{q}”.{" "}
                  <button onClick={() => go("/plan-my-trip")} className="font-semibold text-sun-300">
                    Let us plan a custom trip →
                  </button>
                </div>
              ) : (
                <>
                  {results.destinations.length > 0 && <div className="px-2.5 pt-1 pb-2 text-xs font-semibold tracking-widest text-white/40 uppercase">Destinations</div>}
                  {results.destinations.map((d) => {
                    idx++;
                    const i = idx;
                    return (
                      <button key={d.slug} onMouseEnter={() => setActive(i)} onClick={() => go(`/destinations/${d.slug}`)} className={rowClass(i)}>
                        <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                          <SmartImage src={d.image} alt="" label="" width={120} className="h-full w-full" />
                        </span>
                        <span className="flex-1">
                          <span className="block font-semibold text-white">{d.name}</span>
                          <span className="flex items-center gap-1 text-xs text-white/50">
                            <MapPin size={12} /> {d.country}
                          </span>
                        </span>
                        <ArrowUpRight size={16} className="text-white/40" />
                      </button>
                    );
                  })}
                  {results.packages.length > 0 && <div className="px-2.5 pt-3 pb-2 text-xs font-semibold tracking-widest text-white/40 uppercase">Packages</div>}
                  {results.packages.map((p) => {
                    idx++;
                    const i = idx;
                    return (
                      <button key={p.slug} onMouseEnter={() => setActive(i)} onClick={() => go(`/packages/${p.slug}`)} className={rowClass(i)}>
                        <span className="h-12 w-16 shrink-0 overflow-hidden rounded-xl">
                          <SmartImage src={p.image} alt="" label="" width={160} className="h-full w-full" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-white">{p.title}</span>
                          <span className="flex items-center gap-1 text-xs text-white/50">
                            <Clock size={12} /> {p.days} days · from <Price inr={p.price} className="text-sun-300" />
                          </span>
                        </span>
                        <ArrowUpRight size={16} className="text-white/40" />
                      </button>
                    );
                  })}
                  {(() => {
                    idx++;
                    const i = idx;
                    return (
                      <button onMouseEnter={() => setActive(i)} onClick={() => go(`/packages?q=${encodeURIComponent(q.trim())}`)} className={`${rowClass(i)} mt-2 justify-center text-sm font-semibold text-sun-300`}>
                        See all results for “{q.trim()}” →
                      </button>
                    );
                  })()}
                </>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-[11px] text-white/40">
              <span>↑↓ to navigate · ↵ to open · esc to close</span>
              <span>Explore Bound search</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
