"use client";

import { PhoneCall } from "lucide-react";
import { useActionState } from "react";
import { FieldError, FormMessage, Honeypot, SubmitButton } from "@/components/ui/FormBits";
import { requestCallback, type ActionState } from "@/lib/actions";

export function CallbackForm({ compact }: { compact?: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(requestCallback, { ok: false, message: "" });
  if (state.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="relative space-y-4">
      <Honeypot />
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label className="label" htmlFor="cb-name">Your name</label>
          <input id="cb-name" name="name" required className="field" placeholder="Priya Sharma" autoComplete="name" />
          <FieldError errors={state.errors} name="name" />
        </div>
        <div>
          <label className="label" htmlFor="cb-phone">Phone / WhatsApp</label>
          <input id="cb-phone" name="phone" required type="tel" className="field" placeholder="+91 98xxx xxxxx" autoComplete="tel" />
          <FieldError errors={state.errors} name="phone" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="cb-time">Best time to call</label>
        <select id="cb-time" name="preferredTime" className="field" defaultValue="Any time">
          <option>Any time</option>
          <option>Morning (9 AM – 12 PM)</option>
          <option>Afternoon (12 – 5 PM)</option>
          <option>Evening (5 – 8 PM)</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor="cb-msg">What are you planning? (optional)</label>
        <input id="cb-msg" name="message" className="field" placeholder="e.g. Honeymoon in Bali in December" maxLength={500} />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="w-full" pendingText="Scheduling…">
        <PhoneCall size={16} /> Request a free callback
      </SubmitButton>
      <p className="text-center text-xs text-white/40">We usually call back within 30 minutes during working hours.</p>
    </form>
  );
}
