import { Headphones } from "lucide-react";
import { CallbackForm } from "@/components/forms/CallbackForm";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { faqs, site } from "@/lib/site";

export function FaqCallback() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 md:px-8">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <span className="eyebrow">✦ Good to know</span>
          <h2 className="mt-4 mb-10 text-4xl font-bold md:text-5xl">
            Questions? <span className="text-gradient">Answered.</span>
          </h2>
          <Accordion items={faqs.slice(0, 5)} />
        </Reveal>
        <Reveal delay={0.1} className="lg:pt-24">
          <div id="callback" className="grain relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(100%_80%_at_100%_0%,rgb(63_230_201/0.18),transparent_60%),#0d1427] p-7 md:p-9">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lagoon text-ink-950">
                <Headphones size={26} />
              </span>
              <div>
                <h3 className="font-display text-2xl font-bold">Talk to a trip expert</h3>
                <p className="text-sm text-white/55">Free consultation · {site.hours}</p>
              </div>
            </div>
            <div className="mt-7">
              <CallbackForm />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
