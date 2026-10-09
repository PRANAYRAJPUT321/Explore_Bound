"use client";

import { useEffect } from "react";
import { useApp } from "@/components/providers/AppProvider";

export function TrackView({ id }: { id: number }) {
  const { pushRecent } = useApp();
  useEffect(() => {
    pushRecent(id);
  }, [id, pushRecent]);
  return null;
}
