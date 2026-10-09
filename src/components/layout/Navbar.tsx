"use client";

import { ChevronDown, Heart, Menu, Phone, Search, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Logo, WhatsAppIcon } from "@/components/ui/Icons";
import { SmartImage } from "@/components/ui/SmartImage";
import { currencies, site, type CurrencyCode } from "@/lib/site";
import { cn, whatsappLink } from "@/lib/utils";
import { openSearch } from "./SearchOverlay";

export type NavDestination = { slug: string; name: string; region: string; heroImage: string; tagline: string };

const links = [
  { href: "/packages", label: "Packages" },
  { href: "/group-tours", label: "Group Tours" },
  { href: "/plan-my-trip", label: "Plan My Trip" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ destinations }: { destinations: NavDestination[] }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const { wishlist, hydrated } = useApp();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 400 && y > prev && !mega && !mobile);
  });

  useEffect(() => {
    setMega(false);
    setMobile(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  const domestic = destinations.filter((d) => d.region === "domestic");
  const international = destinations.filter((d) => d.region === "international");

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -110 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="no-print fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4"
        onMouseLeave={() => setMega(false)}
      >
        <nav
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full px-3 py-2 transition-all duration-500 md:px-4",
            scrolled || mega ? "glass-strong shadow-[0_20px_60px_-20px_rgb(0_0_0/0.8)]" : "bg-transparent",
          )}
        >
          <Link href="/" className="group flex items-center gap-2.5 pl-1" aria-label={`${site.name} home`}>
            <Logo className="h-9 w-9 transition-transform duration-700 group-hover:rotate-[360deg]" />
            <span className="leading-none">
              <span className="block font-display text-base font-bold tracking-tight whitespace-nowrap text-white sm:text-lg">Explore Bound</span>
              <span className="block text-[10px] font-semibold tracking-[0.32em] text-sun-300/80 uppercase">Holidays</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <button
              onMouseEnter={() => setMega(true)}
              onClick={() => setMega((v) => !v)}
              className={cn(
                "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition",
                mega || pathname.startsWith("/destinations") ? "bg-white/10 text-white" : "text-white/75 hover:text-white",
              )}
              aria-expanded={mega}
            >
              Destinations <ChevronDown size={14} className={cn("transition", mega && "rotate-180")} />
            </button>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onMouseEnter={() => setMega(false)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition",
                  pathname.startsWith(l.href) ? "text-white" : "text-white/75 hover:text-white",
                )}
              >
                {pathname.startsWith(l.href) && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/10" transition={{ type: "spring", bounce: 0.25, duration: 0.6 }} />
                )}
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={openSearch} className="flex h-10 items-center gap-2 rounded-full px-3 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="Search trips">
              <Search size={18} />
              <kbd className="hidden rounded-md border border-white/15 px-1.5 py-0.5 font-sans text-[10px] text-white/50 xl:inline">⌘K</kbd>
            </button>
            <div className="hidden sm:block">
              <CurrencySwitcher />
            </div>
            <Link href="/wishlist" className="relative flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="Wishlist">
              <Heart size={18} />
              {hydrated && wishlist.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <a href={site.phoneHref} className="btn-primary hidden !px-4 !py-2.5 md:inline-flex">
              <Phone size={15} /> <span className="hidden xl:inline">{site.phone}</span>
              <span className="xl:hidden">Call us</span>
            </a>
            <button onClick={() => setMobile(true)} className="flex h-10 w-10 items-center justify-center rounded-full text-white lg:hidden" aria-label="Open menu">
              <Menu size={22} />
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mega && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="glass-strong mx-auto mt-3 hidden max-w-7xl overflow-hidden rounded-[2rem] p-6 shadow-2xl lg:block"
              onMouseEnter={() => setMega(true)}
            >
              <div className="grid grid-cols-12 gap-6">
                <MegaColumn title="Incredible India" accent="text-sun-300" items={domestic} />
                <MegaColumn title="International" accent="text-aqua-300" items={international} />
                <div className="col-span-4 grid grid-rows-2 gap-3">
                  {destinations
                    .filter((d) => d.region === "international")
                    .slice(0, 1)
                    .concat(destinations.filter((d) => d.region === "domestic").slice(0, 1))
                    .map((d) => (
                      <Link key={d.slug} href={`/destinations/${d.slug}`} className="group shine relative overflow-hidden rounded-2xl">
                        <SmartImage src={d.heroImage} alt={d.name} label={d.name} width={600} className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
                        <div className="absolute bottom-3 left-4">
                          <div className="font-display text-xl font-bold text-white">{d.name}</div>
                          <div className="text-xs text-white/70">{d.tagline}</div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                <span className="text-white/50">Can&apos;t decide? Let our 3D globe inspire you.</span>
                <Link href="/destinations" className="font-semibold text-sun-300 hover:text-sun-200">
                  Explore all destinations →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] overflow-y-auto bg-ink-950/98 backdrop-blur-xl lg:hidden"
            data-lenis-prevent
          >
            <div className="pointer-events-none absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-sun-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-aqua-500/15 blur-3xl" />
            <div className="relative flex items-center justify-between px-5 pt-5">
              <Link href="/" className="flex items-center gap-2.5">
                <Logo className="h-9 w-9" />
                <span className="font-display text-lg font-bold">Explore Bound</span>
              </Link>
              <button onClick={() => setMobile(false)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10" aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            <nav className="relative mt-8 flex flex-col px-6">
              {[{ href: "/destinations", label: "Destinations" }, ...links, { href: "/wishlist", label: "Wishlist" }, { href: "/my-booking", label: "Manage Booking" }].map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                  <Link href={l.href} className="flex items-center justify-between border-b border-white/5 py-4 font-display text-3xl font-bold text-white/90">
                    {l.label}
                    <span className="text-base text-white/30">0{i + 1}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="relative mt-6 flex items-center justify-between px-6">
              <span className="text-sm text-white/50">Currency</span>
              <MobileCurrency />
            </div>
            <div className="relative mt-6 grid grid-cols-2 gap-3 px-6 pb-10">
              <a href={site.phoneHref} className="btn-primary">
                <Phone size={16} /> Call now
              </a>
              <a href={whatsappLink(site.whatsapp, "Hi Explore Bound! I'd like help planning a trip.")} target="_blank" rel="noreferrer" className="btn-ghost">
                <WhatsAppIcon size={18} /> WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MegaColumn({ title, accent, items }: { title: string; accent: string; items: NavDestination[] }) {
  return (
    <div className="col-span-4">
      <div className={cn("mb-3 text-xs font-bold tracking-[0.2em] uppercase", accent)}>{title}</div>
      <div className="grid grid-cols-2 gap-1">
        {items.map((d) => (
          <Link key={d.slug} href={`/destinations/${d.slug}`} className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
              <SmartImage src={d.heroImage} alt="" label="" width={120} className="h-full w-full transition duration-500 group-hover:scale-125" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white/90 group-hover:text-white">{d.name}</span>
              <span className="block truncate text-[11px] text-white/45">{d.tagline}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CurrencySwitcher() {
  const { currency, setCurrency } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-1 rounded-full px-3 text-xs font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
        aria-label="Change currency"
        aria-expanded={open}
      >
        {currency} <ChevronDown size={12} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="glass-strong absolute right-0 mt-1 w-36 overflow-hidden rounded-2xl p-1.5 shadow-2xl"
          >
            {(Object.keys(currencies) as CurrencyCode[]).map((c) => (
              <li key={c}>
                <button
                  onClick={() => {
                    setCurrency(c);
                    setOpen(false);
                  }}
                  className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-white/10", c === currency && "text-sun-300")}
                >
                  {c} <span className="text-white/40">{currencies[c].symbol.trim()}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileCurrency() {
  const { currency, setCurrency } = useApp();
  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(currencies) as CurrencyCode[]).map((c) => (
        <button key={c} onClick={() => setCurrency(c)} className={cn("rounded-full px-3 py-1.5 text-xs font-bold", c === currency ? "bg-sunset text-ink-950" : "bg-white/10 text-white/70")}>
          {c}
        </button>
      ))}
    </div>
  );
}
