"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { GlobeProps } from "./GlobeScene";

const GlobeScene = dynamic(() => import("./GlobeScene"), {
  ssr: false,
  loading: () => <GlobeFallback />,
});

function GlobeFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative aspect-square w-[62%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#1b3a7a,#0b1736_55%,#060a16)] shadow-[0_0_120px_20px_rgb(79_180_255/0.25)]">
        <div className="absolute inset-0 animate-pulse rounded-full bg-[radial-gradient(circle_at_60%_55%,rgb(63_230_201/0.15),transparent_60%)]" />
      </div>
    </div>
  );
}

export function Globe({
  className,
  navigate = true,
  ...props
}: Omit<GlobeProps, "onSelect"> & { className?: string; navigate?: boolean; onSelect?: (slug: string) => void }) {
  const router = useRouter();
  const onSelect = useCallback(
    (slug: string) => {
      if (props.onSelect) props.onSelect(slug);
      else if (navigate) router.push(`/destinations/${slug}`);
    },
    [navigate, props, router],
  );
  return <GlobeScene {...props} onSelect={onSelect} className={className} />;
}
