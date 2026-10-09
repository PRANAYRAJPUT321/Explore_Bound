"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";
import { FieldError, FormMessage, Honeypot, SubmitButton } from "@/components/ui/FormBits";
import { submitEnquiry, type ActionState } from "@/lib/actions";

export function EnquiryForm({ type, packageId, packageTitle }: { type: "package" | "contact"; packageId?: number; packageTitle?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(submitEnquiry, { ok: false, message: "" });
  if (state.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="relative space-y-4">
      <Honeypot />
      <input type="hidden" name="type" value={type} />
      {packageId ? <input type="hidden" name="packageId" value={packageId} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={`${type}-name`}>Full name</label>
          <input id={`${type}-name`} name="name" required className="field" autoComplete="name" />
          <FieldError errors={state.errors} name="name" />
        </div>
        <div>
          <label className="label" htmlFor={`${type}-phone`}>Phone</label>
          <input id={`${type}-phone`} name="phone" type="tel" required className="field" autoComplete="tel" />
          <FieldError errors={state.errors} name="phone" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor={`${type}-email`}>Email</label>
          <input id={`${type}-email`} name="email" type="email" required className="field" autoComplete="email" />
          <FieldError errors={state.errors} name="email" />
        </div>
        {type === "package" && (
          <>
            <div>
              <label className="label" htmlFor="enq-month">Travel month</label>
              <input id="enq-month" name="travelMonth" className="field" placeholder="e.g. December 2026" />
            </div>
            <div>
              <label className="label" htmlFor="enq-trav">Travellers</label>
              <input id="enq-trav" name="travellers" className="field" placeholder="2 adults, 1 child" />
            </div>
          </>
        )}
        <div className="sm:col-span-2">
          <label className="label" htmlFor={`${type}-msg`}>Message</label>
          <textarea
            id={`${type}-msg`}
            name="message"
            rows={4}
            className="field resize-none"
            placeholder={packageTitle ? `Questions about ${packageTitle}? Want to customise it?` : "How can we help?"}
            maxLength={2000}
          />
        </div>
      </div>
      <FormMessage state={state} />
      <SubmitButton className="w-full sm:w-auto">
        <Send size={16} /> Send enquiry
      </SubmitButton>
    </form>
  );
}
