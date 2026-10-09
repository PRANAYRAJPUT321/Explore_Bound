"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections]);
  return (
    <nav className="no-print glass-strong no-scrollbar sticky top-[5.25rem] z-30 -mx-1 flex gap-1 overflow-x-auto rounded-full p-1.5" aria-label="Sections">
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition", active === s.id ? "bg-white text-ink-950" : "text-white/65 hover:text-white")}>
          {s.label}
        </a>
      ))}
    </nav>
  );
}
