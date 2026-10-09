import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = "left",
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Reveal className={cn("mb-10 md:mb-14", align === "center" && "mx-auto max-w-3xl text-center", className)}>
      <div className={cn("flex flex-col gap-4", align === "center" ? "items-center" : "md:flex-row md:items-end md:justify-between")}>
        <div className={cn(align === "left" && "max-w-2xl")}>
          {eyebrow ? <span className="eyebrow">✦ {eyebrow}</span> : null}
          <h2 className="mt-4 text-4xl leading-[1.05] font-bold text-white md:text-5xl lg:text-6xl">
            {title} {highlight ? <span className="text-gradient">{highlight}</span> : null}
          </h2>
          {subtitle ? <p className="mt-4 text-base leading-relaxed text-white/60 md:text-lg">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </Reveal>
  );
}
