"use client";

import { MessageSquareHeart, PenLine, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useActionState, useState } from "react";
import { FieldError, FormMessage, Honeypot, SubmitButton } from "@/components/ui/FormBits";
import { submitFeedback, submitReview, type ActionState } from "@/lib/actions";
import { cn } from "@/lib/utils";

const initial: ActionState = { ok: false, message: "" };
const ratingWords = ["", "Poor", "Fair", "Good", "Great", "Unforgettable!"];

function StarInput({ name }: { name: string }) {
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={value || ""} />
      <div className="flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(i)}
            onClick={() => setValue(i)}
            className="transition hover:scale-125"
          >
            <Star size={32} className={i <= shown ? "text-sun-400" : "text-white/15"} fill="currentColor" strokeWidth={0} />
          </button>
        ))}
      </div>
      <span className="text-sm font-semibold text-sun-300">{ratingWords[shown]}</span>
    </div>
  );
}

function ReviewForm({ packages, defaultPackage }: { packages: { id: number; title: string }[]; defaultPackage?: number }) {
  const [state, action] = useActionState(submitReview, initial);
  const [len, setLen] = useState(0);
  if (state.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="relative space-y-5">
      <Honeypot />
      <div>
        <div className="label">Your rating</div>
        <StarInput name="rating" />
        <FieldError errors={state.errors} name="rating" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="rv-pkg">Which trip?</label>
          <select id="rv-pkg" name="packageId" defaultValue={defaultPackage ?? ""} className="field">
            <option value="">General experience</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="rv-type">Trip type</label>
          <select id="rv-type" name="tripType" className="field" defaultValue="">
            <option value="">Select…</option>
            {["Honeymoon", "Family", "Friends", "Solo", "Couple", "Group tour", "Pilgrimage", "Business"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="rv-name">Name</label>
          <input id="rv-name" name="name" required className="field" autoComplete="name" />
          <FieldError errors={state.errors} name="name" />
        </div>
        <div>
          <label className="label" htmlFor="rv-email">Email (not published)</label>
          <input id="rv-email" name="email" type="email" required className="field" autoComplete="email" />
          <FieldError errors={state.errors} name="email" />
        </div>
        <div>
          <label className="label" htmlFor="rv-loc">City</label>
          <input id="rv-loc" name="location" className="field" placeholder="Pune" />
        </div>
        <div>
          <label className="label" htmlFor="rv-month">When did you travel?</label>
          <input id="rv-month" name="travelMonth" className="field" placeholder="March 2026" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="rv-title">Headline</label>
        <input id="rv-title" name="title" required className="field" placeholder="Sum up your trip in a line" maxLength={100} />
        <FieldError errors={state.errors} name="title" />
      </div>
      <div>
        <label className="label flex justify-between" htmlFor="rv-comment">
          Your story <span className="normal-case">{len}/2000</span>
        </label>
        <textarea id="rv-comment" name="comment" required rows={5} maxLength={2000} onChange={(e) => setLen(e.target.value.length)} className="field resize-none" placeholder="What did you love? Any tips for fellow travellers?" />
        <FieldError errors={state.errors} name="comment" />
      </div>
      <div>
        <label className="label" htmlFor="rv-photo">Photo link (optional)</label>
        <input id="rv-photo" name="photoUrl" type="url" className="field" placeholder="https://… (Google Photos, Instagram, etc.)" />
        <FieldError errors={state.errors} name="photoUrl" />
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Publishing…">
        <PenLine size={16} /> Submit review
      </SubmitButton>
    </form>
  );
}

const faces = ["😡", "😠", "😟", "🙁", "😐", "😶", "🙂", "😊", "😄", "🤩", "🥰"];

function FeedbackForm() {
  const [state, action] = useActionState(submitFeedback, initial);
  const [score, setScore] = useState(8);
  if (state.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="relative space-y-5">
      <Honeypot />
      <div>
        <div className="label">How likely are you to recommend us to a friend?</div>
        <input type="hidden" name="score" value={score} />
        <div className="grid grid-cols-11 gap-1">
          {faces.map((f, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setScore(i)}
              className={cn("flex flex-col items-center rounded-xl py-2 text-xs transition", score === i ? "bg-sunset text-ink-950" : "bg-white/5 text-white/60 hover:bg-white/10")}
              aria-label={`Score ${i}`}
            >
              <span className="text-lg">{f}</span>
              {i}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="fb-name">Name</label>
          <input id="fb-name" name="name" required className="field" />
          <FieldError errors={state.errors} name="name" />
        </div>
        <div>
          <label className="label" htmlFor="fb-email">Email</label>
          <input id="fb-email" name="email" type="email" required className="field" />
          <FieldError errors={state.errors} name="email" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="fb-cat">Feedback about</label>
        <select id="fb-cat" name="category" className="field" defaultValue="website">
          <option value="website">This website</option>
          <option value="booking">Booking experience</option>
          <option value="trip">A trip I took</option>
          <option value="suggestion">Suggestion / idea</option>
          <option value="complaint">Complaint</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor="fb-msg">Tell us more</label>
        <textarea id="fb-msg" name="message" required rows={5} className="field resize-none" placeholder="What can we do better? What did we nail?" />
        <FieldError errors={state.errors} name="message" />
      </div>
      <FormMessage state={state} />
      <SubmitButton>
        <MessageSquareHeart size={16} /> Send feedback
      </SubmitButton>
    </form>
  );
}

export function ReviewForms(props: { packages: { id: number; title: string }[]; defaultPackage?: number }) {
  const [tab, setTab] = useState<"review" | "feedback">("review");
  return (
    <div className="glass-strong rounded-[2rem] p-6 md:p-8">
      <div className="mb-8 grid grid-cols-2 gap-1.5 rounded-full bg-white/5 p-1.5">
        {(
          [
            ["review", "Write a review"],
            ["feedback", "Share feedback"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={cn("relative rounded-full py-2.5 text-sm font-semibold transition", tab === id ? "text-ink-950" : "text-white/65")}>
            {tab === id && <motion.span layoutId="rf-pill" className="absolute inset-0 -z-0 rounded-full bg-sunset" />}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {tab === "review" ? <ReviewForm {...props} /> : <FeedbackForm />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
