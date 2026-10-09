import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { FacebookIcon, InstagramIcon, Logo, WhatsAppIcon, XIcon, YoutubeIcon } from "@/components/ui/Icons";
import { site } from "@/lib/site";
import { whatsappLink } from "@/lib/utils";
import type { NavDestination } from "./Navbar";

export function Footer({ destinations }: { destinations: NavDestination[] }) {
  const domestic = destinations.filter((d) => d.region === "domestic").slice(0, 7);
  const international = destinations.filter((d) => d.region === "international").slice(0, 7);
  const year = new Date().getFullYear();

  return (
    <footer className="no-print relative mt-24 overflow-hidden border-t border-white/10 bg-ink-900">
      <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-sun-500/10 blur-3xl" />

      {/* CTA band */}
      <div className="relative mx-auto max-w-7xl px-5 pt-20 md:px-8">
        <div className="grain relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(120%_140%_at_0%_0%,#ff8a3d33,transparent_50%),radial-gradient(120%_140%_at_100%_100%,#3fe6c933,transparent_50%),#0d1427] p-8 md:p-14">
          <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="text-4xl leading-tight font-bold md:text-6xl">
                Your next story <span className="text-gradient">starts here.</span>
              </h2>
              <p className="mt-4 max-w-xl text-white/60">Tell us where your heart wants to go. We&apos;ll handle flights, stays, visas and every little detail in between.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
              <Link href="/plan-my-trip" className="btn-primary flex-1">
                Plan my trip <ArrowUpRight size={16} />
              </Link>
              <a href={whatsappLink(site.whatsapp, "Hi! I want to plan a trip with Explore Bound.")} target="_blank" rel="noreferrer" className="btn-ghost flex-1">
                <WhatsAppIcon size={18} /> WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-11 w-11" />
            <span>
              <span className="block font-display text-xl font-bold">Explore Bound</span>
              <span className="block text-[10px] font-semibold tracking-[0.32em] text-sun-300/80 uppercase">Holidays</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">{site.description}</p>
          <div className="mt-6 max-w-sm">
            <div className="mb-2 text-sm font-semibold text-white">Get secret deals in your inbox</div>
            <NewsletterForm />
          </div>
          <div className="mt-6 flex gap-2">
            {[
              { href: site.socials.instagram, icon: <InstagramIcon />, label: "Instagram" },
              { href: site.socials.facebook, icon: <FacebookIcon />, label: "Facebook" },
              { href: site.socials.youtube, icon: <YoutubeIcon />, label: "YouTube" },
              { href: site.socials.x, icon: <XIcon />, label: "X" },
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="glass flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:-translate-y-0.5 hover:text-white">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <FooterCol title="India" links={domestic.map((d) => ({ href: `/destinations/${d.slug}`, label: d.name }))} />
        <FooterCol title="International" links={international.map((d) => ({ href: `/destinations/${d.slug}`, label: d.name }))} />
        <div>
          <FooterCol
            title="Company"
            links={[
              { href: "/about", label: "About us" },
              { href: "/packages", label: "All packages" },
              { href: "/group-tours", label: "Group departures" },
              { href: "/reviews", label: "Reviews & feedback" },
              { href: "/my-booking", label: "Manage booking" },
              { href: "/contact", label: "Contact & FAQs" },
            ]}
          />
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-4 border-t border-white/10 px-5 py-8 text-sm text-white/55 md:grid-cols-4 md:px-8">
        <a href={site.phoneHref} className="flex items-center gap-2 hover:text-white">
          <Phone size={16} className="text-sun-400" /> {site.phone}
        </a>
        <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-white">
          <Mail size={16} className="text-sun-400" /> {site.email}
        </a>
        <span className="flex items-center gap-2">
          <Clock size={16} className="text-sun-400" /> {site.hours}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={16} className="shrink-0 text-sun-400" /> {site.address}
        </span>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none mx-auto max-w-7xl px-5 text-center font-display text-[18vw] leading-[0.8] font-black tracking-tighter text-outline select-none md:px-8 lg:text-[12rem]">
          EXPLORE BOUND
        </div>
      </div>

      <div className="relative border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {year} {site.name}. All rights reserved. · Prices are per person on twin sharing unless stated. ·{" "}
        <Link href="/admin" className="hover:text-white/70">
          Admin
        </Link>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <div className="mb-4 text-xs font-bold tracking-[0.2em] text-white/40 uppercase">{title}</div>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="group inline-flex items-center gap-1 text-sm text-white/70 transition hover:text-white">
              {l.label}
              <ArrowUpRight size={12} className="opacity-0 transition group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
