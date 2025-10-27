"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ReactElement } from "react";

const containerMotion = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

const screenshotMotion = {
  initial: { opacity: 0.6, scale: 0.96, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
};

export function DemoHighlight(): ReactElement {
  return (
    <motion.figure
      className="mx-auto flex w-full max-w-5xl flex-col gap-8"
      initial={containerMotion.initial}
      whileInView={containerMotion.animate}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-background/90 via-card/80 to-card/40 p-1 shadow-md backdrop-blur"
        initial={screenshotMotion.initial}
        whileInView={screenshotMotion.animate}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute -left-20 -top-24 h-40 w-40 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-28 -right-16 h-48 w-48 rounded-full bg-muted/40 blur-3xl" aria-hidden="true" />
        <div className="relative rounded-[18px] border border-border/60 bg-background/90 shadow-sm">
          <Image
            src="/screenshots/case-study-editor.svg"
            alt="AI assisted prompt flowing into a customizable dashboard editor"
            width={1600}
            height={1024}
            priority={false}
            className="h-auto w-full rounded-[18px] border border-border/50 object-cover"
            sizes="(min-width: 1280px) 960px, (min-width: 768px) 75vw, 92vw"
          />
        </div>
      </motion.div>

      <figcaption className="space-y-3 text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
          AI to dashboard workflow
        </p>
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          From natural language prompts to live KPIs in seconds
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          Feed a prompt into the case study editor, iterate on layout with instant previews, and publish to the analytics dashboard
          without leaving the page. Supabase, Prisma, and tRPC keep generated metrics aligned so every stakeholder sees the latest
          production data.
        </p>
      </figcaption>
    </motion.figure>
  );
}
