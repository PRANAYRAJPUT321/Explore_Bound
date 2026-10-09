"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";
import { FormMessage, Honeypot, SubmitButton } from "@/components/ui/FormBits";
import { subscribe, type ActionState } from "@/lib/actions";

export function NewsletterForm() {
  const [state, action] = useActionState<ActionState, FormData>(subscribe, { ok: false, message: "" });
  return (
    <form action={action} className="relative space-y-3">
      <Honeypot />
      {state.ok ? (
        <FormMessage state={state} />
      ) : (
        <>
          <div className="glass flex items-center gap-2 rounded-full p-1.5 pl-5">
            <input type="email" name="email" required placeholder="you@email.com" aria-label="Email address" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40" />
            <SubmitButton className="!px-4 !py-2.5" pendingText="">
              <Send size={15} /> <span className="hidden sm:inline">Subscribe</span>
            </SubmitButton>
          </div>
          {!state.ok && state.message ? <FormMessage state={state} /> : null}
        </>
      )}
    </form>
  );
}
