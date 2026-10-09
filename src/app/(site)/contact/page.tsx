import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { CallbackForm } from "@/components/forms/CallbackForm";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Accordion } from "@/components/ui/Accordion";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { PageHero } from "@/components/ui/PageHero";
import { faqs, site } from "@/lib/site";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Call, WhatsApp or write to Explore Bound Holidays. Request a free callback from a trip expert.",
};

export default function ContactPage() {
  const cards = [
    { icon: <Phone size={20} />, title: "Call us", value: site.phone, href: site.phoneHref, tint: "bg-sunset" },
    { icon: <WhatsAppIcon size={20} />, title: "WhatsApp", value: "Chat instantly", href: whatsappLink(site.whatsapp, "Hi Explore Bound!"), tint: "bg-[#25d366]" },
    { icon: <Mail size={20} />, title: "Email", value: site.email, href: `mailto:${site.email}`, tint: "bg-lagoon" },
    { icon: <Clock size={20} />, title: "Hours", value: site.hours, href: undefined, tint: "bg-white" },
  ];
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's plan something" highlight="unforgettable." subtitle="Real humans, real fast. Pick the way you like to talk — we usually reply within minutes." />
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            const inner = (
              <>
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-ink-950 ${c.tint}`}>{c.icon}</span>
                <div className="mt-4 text-xs font-bold tracking-widest text-white/45 uppercase">{c.title}</div>
                <div className="mt-1 font-semibold text-white">{c.value}</div>
              </>
            );
            return c.href ? (
              <a key={c.title} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="card block p-6 transition hover:-translate-y-1 hover:border-white/25">
                {inner}
              </a>
            ) : (
              <div key={c.title} className="card p-6">
                {inner}
              </div>
            );
          })}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="card p-6 md:p-8">
            <h2 className="font-display text-3xl font-bold">Send us a message</h2>
            <p className="mt-1 mb-6 text-white/55">Questions, group bookings, corporate offsites — we&apos;re all ears.</p>
            <EnquiryForm type="contact" />
          </div>
          <div id="callback" className="scroll-mt-28 space-y-8">
            <div className="grain relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(100%_80%_at_100%_0%,rgb(63_230_201/0.18),transparent_60%),#0d1427] p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold">Request a callback</h2>
              <p className="mt-1 mb-6 text-sm text-white/55">Pick a time — a trip expert will ring you.</p>
              <CallbackForm compact />
            </div>
            <div className="card overflow-hidden">
              <iframe title="Office location" src={site.mapEmbed} className="h-64 w-full border-0 grayscale invert-[0.9] hue-rotate-180" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              <div className="flex items-start gap-3 p-5 text-sm text-white/70">
                <MapPin size={18} className="mt-0.5 shrink-0 text-sun-400" /> {site.address}
              </div>
            </div>
          </div>
        </div>

        <div id="faq" className="mt-24 scroll-mt-28">
          <h2 className="mb-8 text-center font-display text-4xl font-bold md:text-5xl">
            Frequently asked <span className="text-gradient">questions</span>
          </h2>
          <Accordion items={faqs} className="mx-auto max-w-3xl" />
        </div>
      </section>
    </>
  );
}
