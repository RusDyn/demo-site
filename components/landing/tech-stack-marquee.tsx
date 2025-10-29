"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState, type ReactElement } from "react";

import { cn } from "@/lib/utils";

const techStackItems = [
  { label: "Next.js", icon: "/icons/nextjs.svg" },
  { label: "React", icon: "/icons/react.svg" },
  { label: "TypeScript", icon: "/icons/typescript.svg" },
  { label: "Tailwind CSS", icon: "/icons/tailwindcss.svg" },
  { label: "Prisma", icon: "/icons/prisma.svg" },
  { label: "tRPC", icon: "/icons/trpc.svg" },
  { label: "Supabase", icon: "/icons/supabase.svg" },
  { label: "NextAuth.js", icon: "/icons/nextauth.svg" },
  { label: "TanStack Query", icon: "/icons/tanstack-query.svg" },
  { label: "PostHog", icon: "/icons/posthog.svg" },
] as const;

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
    <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-background/75 via-card/70 to-secondary/20 p-6 shadow-md backdrop-blur">
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
            key={`${item.label}-${index}`}
            aria-hidden={index >= techStackItems.length}
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-1 text-sm font-medium text-secondary-foreground",
              "shadow-sm ring-1 ring-inset ring-secondary/40 backdrop-blur",
            )}
          >
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-background/70 ring-1 ring-inset ring-secondary/50"
            >
              <Image
                src={item.icon}
                alt=""
                width={20}
                height={20}
                className="h-4 w-4"
              />
            </span>
            <span>{item.label}</span>
          </li>
        ))}
      </motion.ul>
    </section>
  );
}
