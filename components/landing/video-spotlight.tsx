"use client";

import type { HTMLAttributes } from "react";
import clsx from "clsx";

export function VideoSpotlight({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("w-full", className)} {...props}>
      <div className="aspect-video w-full overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-2xl">
        <iframe
          src="https://www.youtube.com/embed/pqn9D6r9F7o"
          title="Supabase Auth Helpers for Next.js App Router by Supabase"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
