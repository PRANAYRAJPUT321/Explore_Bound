"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

/** <select> that submits its parent form as soon as it changes. */
export function AutoSelect({ name, defaultValue, options, className, label }: { name: string; defaultValue: string; options: string[]; className?: string; label: string }) {
  return (
    <select name={name} defaultValue={defaultValue} aria-label={label} onChange={(e) => e.currentTarget.form?.requestSubmit()} className={cn("field !w-auto !rounded-xl !py-2 !text-xs capitalize", className)}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o.replace("-", " ")}
        </option>
      ))}
    </select>
  );
}

/** Submit button that asks for confirmation first. */
export function ConfirmButton({ children, message, className, name, value }: { children: React.ReactNode; message: string; className?: string; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className={className}
    >
      {children}
    </button>
  );
}

export function PendingButton({ children, className, name, value }: { children: React.ReactNode; className?: string; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} disabled={pending} className={cn(className, pending && "opacity-50")}>
      {children}
    </button>
  );
}
