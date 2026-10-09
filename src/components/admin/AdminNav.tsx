"use client";

import { CalendarCheck, ExternalLink, Inbox, LayoutDashboard, Mail, MapPinned, MessageSquareHeart, Package, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavCounts = { bookings: number; enquiries: number; reviews: number; feedback: number };

export function AdminNav({ counts }: { counts: NavCounts }) {
  const pathname = usePathname();
  const items = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, badge: counts.bookings },
    { href: "/admin/enquiries", label: "Enquiries & leads", icon: Inbox, badge: counts.enquiries },
    { href: "/admin/reviews", label: "Reviews", icon: Star, badge: counts.reviews },
    { href: "/admin/feedback", label: "Feedback", icon: MessageSquareHeart, badge: counts.feedback },
    { href: "/admin/packages", label: "Packages", icon: Package },
    { href: "/admin/destinations", label: "Destinations", icon: MapPinned },
    { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
  ];
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map((it) => {
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
              active ? "bg-white text-ink-950" : "text-white/65 hover:bg-white/5 hover:text-white",
            )}
          >
            <it.icon size={17} />
            <span className="flex-1">{it.label}</span>
            {it.badge ? <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", active ? "bg-ink-950 text-white" : "bg-coral-500 text-white")}>{it.badge}</span> : null}
          </Link>
        );
      })}
      <a href="/" target="_blank" className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-white/45 hover:text-white lg:mt-4">
        <ExternalLink size={17} /> View website
      </a>
    </nav>
  );
}
