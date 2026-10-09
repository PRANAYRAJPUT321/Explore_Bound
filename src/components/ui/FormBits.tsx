"use client";

import { CheckCircle2, LoaderCircle, TriangleAlert } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function SubmitButton({ children, className, pendingText = "Sending…" }: { children: React.ReactNode; className?: string; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn("btn-primary", className)}>
      {pending ? (
        <>
          <LoaderCircle className="animate-spin" size={16} /> {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormMessage({ state }: { state: { ok: boolean; message: string } | null | undefined }) {
  if (!state?.message) return null;
  return (
    <p
      role="status"
      className={cn(
        "flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm",
        state.ok ? "border-aqua-400/30 bg-aqua-400/10 text-aqua-300" : "border-coral-500/30 bg-coral-500/10 text-coral-400",
      )}
    >
      {state.ok ? <CheckCircle2 size={18} className="mt-px shrink-0" /> : <TriangleAlert size={18} className="mt-px shrink-0" />}
      {state.message}
    </p>
  );
}

export function FieldError({ errors, name }: { errors?: Record<string, string[]>; name: string }) {
  const msg = errors?.[name]?.[0];
  return msg ? <p className="field-error">{msg}</p> : null;
}

/** Invisible field that only bots fill in. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Company
        <input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
