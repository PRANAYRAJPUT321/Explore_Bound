export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <section id="discover" className="relative overflow-hidden border-y border-white/5 bg-ink-900/60 py-6">
      <div className="mask-fade-x flex flex-col gap-3">
        <div className="flex w-max animate-marquee gap-10 [--marquee-duration:60s]">
          {row.map((t, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-4xl font-extrabold whitespace-nowrap md:text-6xl">
              <span className={i % 2 ? "text-outline" : "text-white/90"}>{t}</span>
              <span className="text-2xl text-sun-400">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
