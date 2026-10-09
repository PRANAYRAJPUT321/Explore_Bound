"use client";

import { useState } from "react";

type Point = { month: string; label: string; n: number; value: number };

const BAR = "#10a890"; // validated on the dark card surface (#0d1427): lightness band, chroma & 3:1 contrast pass
const BAR_HOVER = "#14c6aa";

function niceMax(v: number) {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s * 4 >= v) ?? pow * 10;
  return step * 4;
}

/** Single-series column chart: bookings created per month. */
export function BookingsChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 560;
  const H = 220;
  const pad = { t: 24, r: 8, b: 28, l: 36 };
  const max = niceMax(Math.max(...data.map((d) => d.n), 1));
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const band = (W - pad.l - pad.r) / data.length;
  const bw = Math.min(24, band * 0.5);
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const last = data.length - 1;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Bookings created per month, last six months">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="rgb(255 255 255 / 0.08)" strokeWidth={1} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="rgb(255 255 255 / 0.45)" style={{ fontVariantNumeric: "tabular-nums" }}>
              {Number.isInteger(t) ? t : t.toFixed(1)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = pad.l + band * i + band / 2;
          const top = y(d.n);
          const h = Math.max(0, y(0) - top);
          const r = Math.min(4, h);
          const x = cx - bw / 2;
          const path = h > 0 ? `M${x},${y(0)} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${y(0)} Z` : "";
          return (
            <g key={d.month}>
              {path && <path d={path} fill={hover === i ? BAR_HOVER : BAR} />}
              {i === last && d.n > 0 && (
                <text x={cx} y={top - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="rgb(255 255 255 / 0.85)">
                  {d.n}
                </text>
              )}
              <text x={cx} y={H - 8} textAnchor="middle" fontSize={11} fill="rgb(255 255 255 / 0.5)">
                {d.label}
              </text>
              <rect
                x={pad.l + band * i}
                y={pad.t}
                width={band}
                height={H - pad.t - pad.b}
                fill="transparent"
                tabIndex={0}
                aria-label={`${d.label}: ${d.n} bookings`}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="cursor-default outline-none"
              />
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 rounded-xl border border-white/10 bg-ink-800 px-3 py-2 text-xs shadow-xl"
          style={{ left: `${((pad.l + band * hover + band / 2) / W) * 100}%`, transform: "translateX(-50%)" }}
        >
          <div className="text-sm font-semibold text-white">{data[hover].n} bookings</div>
          <div className="text-white/55">
            {data[hover].label} · ₹{data[hover].value.toLocaleString("en-IN")} booked
          </div>
        </div>
      )}
      <details className="mt-3 text-xs text-white/55">
        <summary className="cursor-pointer select-none hover:text-white">View as table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-white/40">
              <th className="py-1 font-medium">Month</th>
              <th className="py-1 text-right font-medium">Bookings</th>
              <th className="py-1 text-right font-medium">Value</th>
            </tr>
          </thead>
          <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
            {data.map((d) => (
              <tr key={d.month} className="border-t border-white/5">
                <td className="py-1">{d.label}</td>
                <td className="py-1 text-right">{d.n}</td>
                <td className="py-1 text-right">₹{d.value.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
