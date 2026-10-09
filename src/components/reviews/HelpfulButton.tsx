"use client";

import { ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { markReviewHelpful } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function HelpfulButton({ id, count }: { id: number; count: number }) {
  const [voted, setVoted] = useState(false);
  const [n, setN] = useState(count);
  useEffect(() => {
    try {
      setVoted((JSON.parse(localStorage.getItem("eb_helpful") ?? "[]") as number[]).includes(id));
    } catch {
      /* ignore */
    }
  }, [id]);
  return (
    <button
      disabled={voted}
      onClick={async () => {
        setVoted(true);
        setN((x) => x + 1);
        try {
          const list = JSON.parse(localStorage.getItem("eb_helpful") ?? "[]") as number[];
          localStorage.setItem("eb_helpful", JSON.stringify([...list, id]));
        } catch {
          /* ignore */
        }
        await markReviewHelpful(id);
      }}
      className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition", voted ? "border-aqua-400/40 text-aqua-300" : "border-white/10 text-white/55 hover:border-white/30 hover:text-white")}
    >
      <ThumbsUp size={13} fill={voted ? "currentColor" : "none"} /> Helpful{n ? ` · ${n}` : ""}
    </button>
  );
}
