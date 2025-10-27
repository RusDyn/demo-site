"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState, type ReactElement } from "react";

import { cn } from "@/lib/utils";

const techStackItems = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Prisma",
  "tRPC",
  "Supabase",
  "NextAuth.js",
  "TanStack Query",
  "PostHog",
];

const marqueeDuration = 28;

export function TechStackMarquee(): ReactElement {
  const shouldReduceMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);

  const marqueeItems = useMemo(
    () => [...techStackItems, ...techStackItems],
    [],
  );

  const animate = shouldReduceMotion || isPaused ? { x: 0 } : { x: ["0%", "-50%"] };
  const transition =
    shouldReduceMotion || isPaused
      ? undefined
      : {
          x: {
            repeat: Infinity,
            repeatType: "loop" as const,
            duration: marqueeDuration,
            ease: "linear" as const,
          },
        };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card/60 p-6 shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" aria-hidden="true" />
      <motion.ul
        tabIndex={0}
        aria-label="Key frameworks and tooling used in this starter"
        className="flex min-w-max items-center gap-4"
        animate={animate}
        transition={transition}
        onFocus={() => {
          setIsPaused(true);
        }}
        onBlur={() => {
          setIsPaused(false);
        }}
        onMouseEnter={() => {
          setIsPaused(true);
        }}
        onMouseLeave={() => {
          setIsPaused(false);
        }}
      >
        {marqueeItems.map((item, index) => (
          <li
            key={`${item}-${index}`}
            aria-hidden={index >= techStackItems.length}
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-1 text-sm font-medium text-secondary-foreground",
              "shadow-sm ring-1 ring-inset ring-secondary/40 backdrop-blur",
            )}
          >
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </motion.ul>
    </section>
  );
}
