import { SmartImage } from "./SmartImage";

export function PageHero({
  eyebrow,
  title,
  highlight,
  subtitle,
  image,
  children,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="grain relative isolate overflow-hidden pt-36 pb-16 md:pt-44 md:pb-20">
      {image ? (
        <>
          <SmartImage src={image} alt="" label={title} width={1800} priority className="absolute inset-0 -z-20 h-full w-full opacity-45" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/70 via-ink-950/60 to-ink-950" />
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/4 h-[30rem] w-[40rem] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgb(255_138_61/0.22),transparent)] blur-2xl" />
          <div className="absolute -top-20 right-0 h-[26rem] w-[34rem] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgb(63_230_201/0.16),transparent)] blur-2xl [animation-delay:-8s]" />
        </div>
      )}
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {eyebrow ? <span className="eyebrow">✦ {eyebrow}</span> : null}
        <h1 className="mt-5 max-w-4xl text-5xl leading-[1.02] font-extrabold md:text-7xl">
          {title} {highlight ? <span className="text-gradient">{highlight}</span> : null}
        </h1>
        {subtitle ? <p className="mt-5 max-w-2xl text-base text-white/65 md:text-lg">{subtitle}</p> : null}
        {children}
      </div>
    </section>
  );
}
