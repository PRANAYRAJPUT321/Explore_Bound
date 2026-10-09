"use client";

import { LockKeyhole } from "lucide-react";
import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/ui/FormBits";
import { login, type AdminState } from "@/lib/admin-actions";

export function LoginForm({ hint }: { hint?: string }) {
  const [state, action] = useActionState<AdminState, FormData>(login, { ok: false, message: "" });
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="ad-email">Email</label>
        <input id="ad-email" name="email" type="email" required autoComplete="username" className="field" />
      </div>
      <div>
        <label className="label" htmlFor="ad-pass">Password</label>
        <input id="ad-pass" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="w-full" pendingText="Signing in…">
        <LockKeyhole size={16} /> Sign in
      </SubmitButton>
      {hint ? <p className="rounded-2xl bg-white/5 p-3 text-xs text-white/50">{hint}</p> : null}
    </form>
  );
}
