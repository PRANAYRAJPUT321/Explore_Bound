"use client";

import { ArrowUp, Bot, Phone, Send, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Price } from "@/components/ui/Price";
import { SmartImage } from "@/components/ui/SmartImage";
import { site } from "@/lib/site";
import { whatsappLink } from "@/lib/utils";

type Msg = {
  from: "bot" | "me";
  text: string;
  packages?: { slug: string; title: string; price: number; days: number; image: string; destination: string }[];
  actions?: { label: string; href: string }[];
  quickReplies?: string[];
};

const greeting: Msg = {
  from: "bot",
  text: "Hi! I'm Bound ✨ your travel assistant. Tell me a destination, budget or vibe — like “honeymoon under 60k” or “family trip to Dubai”.",
  quickReplies: ["Honeymoon under ₹60k", "Group tours", "Today's deals", "Visa help", "Talk to an expert"],
};

export function FloatingActions() {
  const pathname = usePathname();
  const hasBookBar = /^\/packages\/[^/]+$/.test(pathname);
  const { scrollY } = useScroll();
  const [showTop, setShowTop] = useState(false);
  const [chat, setChat] = useState(false);
  const [nudge, setNudge] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setShowTop(y > 900));

  useEffect(() => {
    const t = setTimeout(() => setNudge(true), 9000);
    const h = setTimeout(() => setNudge(false), 17000);
    return () => {
      clearTimeout(t);
      clearTimeout(h);
    };
  }, []);

  useEffect(() => {
    const open = () => setChat(true);
    window.addEventListener("eb:open-assistant", open);
    return () => window.removeEventListener("eb:open-assistant", open);
  }, []);

  return (
    <div className="no-print">
      <div className={`fixed right-4 z-[70] flex flex-col items-end gap-3 md:right-6 ${hasBookBar ? "bottom-24 lg:bottom-6" : "bottom-4 md:bottom-6"}`}>
        <AnimatePresence>
          {showTop && !chat && (
            <motion.button
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="glass flex h-11 w-11 items-center justify-center rounded-full text-white/80 hover:text-white"
              aria-label="Back to top"
            >
              <ArrowUp size={18} />
            </motion.button>
          )}
        </AnimatePresence>
        {!chat && (
          <>
            <a
              href={whatsappLink(site.whatsapp, "Hi Explore Bound! I'd like help planning a trip ✈️")}
              target="_blank"
              rel="noreferrer"
              className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_-6px_rgb(37_211_102/0.6)] transition hover:scale-110"
              aria-label="Chat on WhatsApp"
            >
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-[#25d366]" />
              <WhatsAppIcon size={26} className="relative" />
              <span className="pointer-events-none absolute right-16 hidden rounded-full bg-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-ink-950 opacity-0 shadow-lg transition group-hover:opacity-100 md:block">
                Chat on WhatsApp
              </span>
            </a>
            <a
              href={site.phoneHref}
              className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-sunset text-ink-950 shadow-[0_10px_30px_-6px_rgb(255_138_61/0.6)] transition hover:scale-110 md:hidden"
              aria-label={`Call ${site.phone}`}
            >
              <Phone size={22} />
            </a>
          </>
        )}
        <div className="relative">
          <AnimatePresence>
            {nudge && !chat && (
              <motion.button
                initial={{ opacity: 0, x: 10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                onClick={() => setChat(true)}
                className="glass-strong absolute right-16 bottom-1 w-56 rounded-2xl rounded-br-sm px-4 py-3 text-left text-sm text-white/90 shadow-2xl"
              >
                👋 Need trip ideas? Ask <b className="text-sun-300">Bound</b>, our travel assistant!
              </motion.button>
            )}
          </AnimatePresence>
          <button
            onClick={() => {
              setChat((v) => !v);
              setNudge(false);
            }}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-lagoon text-ink-950 shadow-[0_10px_30px_-6px_rgb(63_230_201/0.6)] transition hover:scale-110"
            aria-label={chat ? "Close assistant" : "Open travel assistant"}
          >
            {chat ? <X size={24} /> : <Bot size={26} />}
            {!chat && <Sparkles size={14} className="absolute -top-0.5 -right-0.5 text-sun-300" />}
          </button>
        </div>
      </div>
      <AnimatePresence>{chat && <AssistantPanel onClose={() => setChat(false)} />}</AnimatePresence>
    </div>
  );
}

function AssistantPanel({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([greeting]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setMsgs((m) => [...m, { from: "me", text: t }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: t }) });
      const data = await res.json();
      await new Promise((r) => setTimeout(r, 350));
      setMsgs((m) => [...m, { from: "bot", text: data.reply, packages: data.packages, actions: data.actions, quickReplies: data.quickReplies }]);
    } catch {
      setMsgs((m) => [...m, { from: "bot", text: "I couldn't reach the server. Please try again, or call us!", actions: [{ label: "Call us", href: site.phoneHref }] }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
      className="glass-strong fixed right-3 bottom-24 z-[75] flex h-[min(620px,calc(100dvh-8rem))] w-[calc(100vw-1.5rem)] max-w-sm flex-col overflow-hidden rounded-[1.75rem] shadow-[0_40px_120px_-20px_rgb(0_0_0/0.9)] md:right-6"
      role="dialog"
      aria-label="Travel assistant"
    >
      <div className="relative flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgb(63_230_201/0.18),transparent_60%)]" />
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-lagoon text-ink-950">
          <Bot size={22} />
        </span>
        <div className="relative flex-1">
          <div className="font-display font-bold text-white">Bound · Trip Assistant</div>
          <div className="flex items-center gap-1.5 text-xs text-aqua-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aqua-400" /> Online · replies instantly
          </div>
        </div>
        <button onClick={onClose} className="relative rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div ref={list} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" data-lenis-prevent>
        {msgs.map((m, i) => (
          <div key={i} className={m.from === "me" ? "flex justify-end" : ""}>
            <div
              className={
                m.from === "me"
                  ? "max-w-[85%] rounded-2xl rounded-br-sm bg-sunset px-4 py-2.5 text-sm font-medium text-ink-950"
                  : "max-w-[92%] rounded-2xl rounded-bl-sm bg-white/[0.07] px-4 py-2.5 text-sm whitespace-pre-line text-white/90"
              }
            >
              {m.text}
            </div>
            {m.packages?.length ? (
              <div className="mt-2 space-y-2">
                {m.packages.map((p) => (
                  <Link key={p.slug} href={`/packages/${p.slug}`} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2 transition hover:border-sun-400/40">
                    <span className="h-14 w-16 shrink-0 overflow-hidden rounded-xl">
                      <SmartImage src={p.image} alt="" label="" width={160} className="h-full w-full transition group-hover:scale-110" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white">{p.title}</span>
                      <span className="text-xs text-white/50">
                        {p.days}D · {p.destination} · <Price inr={p.price} className="font-semibold text-sun-300" />
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}
            {m.actions?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {m.actions.map((a) => (
                  <a key={a.href + a.label} href={a.href} className="rounded-full border border-aqua-400/40 bg-aqua-400/10 px-3 py-1.5 text-xs font-semibold text-aqua-300 transition hover:bg-aqua-400/20">
                    {a.label}
                  </a>
                ))}
              </div>
            ) : null}
            {m.quickReplies?.length && i === msgs.length - 1 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {m.quickReplies.map((q) => (
                  <button key={q} onClick={() => send(q)} className="chip transition hover:border-sun-400/50 hover:text-white">
                    {q}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {busy && (
          <div className="flex w-16 items-center gap-1 rounded-2xl rounded-bl-sm bg-white/[0.07] px-4 py-3">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-white/60" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-white/10 p-3"
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about trips, visas, prices…" className="field !rounded-full !py-2.5" maxLength={300} />
        <button type="submit" disabled={busy || !input.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sunset text-ink-950 transition disabled:opacity-40" aria-label="Send">
          <Send size={16} />
        </button>
      </form>
    </motion.div>
  );
}
