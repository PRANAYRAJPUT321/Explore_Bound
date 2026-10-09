"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Card that tilts in 3D towards the pointer with a moving glare.
 * Children can use `[transform:translateZ(40px)]` to pop out of the surface.
 */
export function TiltCard({ children, className, max = 10, glare = true }: { children: React.ReactNode; className?: string; max?: number; glare?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);
      el.style.setProperty("--go", "1");
    });
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--go", "0");
  }

  return (
    <div className="[perspective:1200px]">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={cn("preserve-3d relative transition-transform duration-300 ease-out will-change-transform", className)}
        style={{ transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" }}
      >
        {children}
        {glare ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-300"
            style={{
              opacity: "var(--go, 0)",
              background: "radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgb(255 255 255 / 0.22), transparent 45%)",
              mixBlendMode: "soft-light",
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
