"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ReactElement } from "react";

const revealMotion = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
};

export function DemoHighlight(): ReactElement {
  return (
    <motion.figure
      className="mx-auto flex max-w-4xl flex-col gap-6"
      initial={revealMotion.initial}
      whileInView={revealMotion.animate}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/80 p-1 shadow-md backdrop-blur">
        <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -right-10 h-28 w-28 rounded-full bg-muted/40 blur-3xl" aria-hidden="true" />
        <div className="relative rounded-[18px] border border-border/60 bg-background/80">
          <Image
            src="/screenshots/case-study-editor.svg"
            alt="AI assisted prompt flowing into a customizable dashboard editor"
            width={1400}
            height={900}
            priority={false}
            className="h-auto w-full rounded-[18px] border border-border/50 object-cover"
            sizes="(min-width: 1280px) 800px, (min-width: 768px) 75vw, 100vw"
          />
        </div>
      </div>
      <figcaption className="space-y-3 text-center sm:text-left">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">AI to dashboard workflow</p>
        <h2 className="text-2xl font-semibold text-foreground">From natural language prompts to live KPIs in seconds</h2>
        <p className="text-base text-muted-foreground">
          Start with an AI-generated prompt, fine-tune the case study layout, and publish directly to the analytics dashboard without
          leaving the editor. Generated metrics stay synced across Supabase, Prisma, and tRPC so the insights you present are always
          production-ready.
        </p>
      </figcaption>
    </motion.figure>
  );
}
