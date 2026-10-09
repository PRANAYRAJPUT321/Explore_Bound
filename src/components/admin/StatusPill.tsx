import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  pending: "bg-sun-400/15 text-sun-300",
  new: "bg-sun-400/15 text-sun-300",
  confirmed: "bg-aqua-400/15 text-aqua-300",
  approved: "bg-aqua-400/15 text-aqua-300",
  contacted: "bg-sky-glow/15 text-sky-glow",
  read: "bg-sky-glow/15 text-sky-glow",
  completed: "bg-white/10 text-white/70",
  converted: "bg-aqua-400/15 text-aqua-300",
  resolved: "bg-white/10 text-white/70",
  closed: "bg-white/10 text-white/50",
  cancelled: "bg-coral-500/15 text-coral-400",
  rejected: "bg-coral-500/15 text-coral-400",
  active: "bg-aqua-400/15 text-aqua-300",
  draft: "bg-white/10 text-white/55",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", styles[status] ?? "bg-white/10 text-white/60", className)}>{status.replace("-", " ")}</span>;
}
