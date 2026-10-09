"use client";

import { useEffect, useRef, useState } from "react";
import { cn, sized } from "@/lib/utils";

const palettes = [
  ["#ff8a3d", "#e94b9a", "#2a1a4a"],
  ["#3fe6c9", "#5cc8ff", "#0d1f3d"],
  ["#ffcf85", "#ff5e62", "#3a1530"],
  ["#8af7e6", "#7c6cff", "#141436"],
];

/**
 * <img> with sensible defaults and a graceful, on-brand fallback if a remote photo fails to load.
 */
export function SmartImage({
  src,
  alt,
  className,
  width = 1200,
  priority = false,
  label,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  priority?: boolean;
  label?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const ref = useRef<HTMLImageElement>(null);
  const failed = !src || failedSrc === src;

  // Images that fail before hydration never fire React's onError — check once mounted.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailedSrc(src);
  }, [src]);

  if (failed) {
    const seed = [...(label ?? alt)].reduce((s, c) => s + c.charCodeAt(0), 0);
    const [a, b, c] = palettes[seed % palettes.length];
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("relative overflow-hidden", className)}
        style={{ background: `radial-gradient(120% 90% at 20% 10%, ${a}cc, transparent 55%), radial-gradient(100% 80% at 90% 90%, ${b}aa, transparent 60%), ${c}` }}
      >
        <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden>
          <path d="M0 230 L80 150 L130 190 L210 90 L290 180 L340 140 L400 200 L400 300 L0 300Z" fill="#000" opacity=".35" />
          <path d="M0 260 L70 210 L150 250 L240 180 L320 240 L400 220 L400 300 L0 300Z" fill="#000" opacity=".45" />
          <circle cx="310" cy="70" r="26" fill="#fff" opacity=".5" />
        </svg>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sized(src, width)}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      ref={ref}
      onError={() => setFailedSrc(src)}
      className={cn("object-cover", className)}
    />
  );
}
