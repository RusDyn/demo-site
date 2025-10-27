"use client";

import type { ReactElement, ReactNode } from "react";
import { m } from "framer-motion";
import type { Variants } from "framer-motion";

import { AnimationProvider } from "@/components/providers/animation-provider";
import { cn } from "@/lib/utils";

const heroContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.14,
    },
  },
};

const heroItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

interface HeroAnimatedShellProps {
  children: ReactNode;
  className?: string;
}

export function HeroAnimatedShell({ children, className }: HeroAnimatedShellProps): ReactElement {
  return (
    <AnimationProvider>
      <m.section
        initial="hidden"
        animate="visible"
        variants={heroContainerVariants}
        className={className}
      >
        {children}
      </m.section>
    </AnimationProvider>
  );
}

interface MotionElementProps {
  as?: "div" | "h1" | "p";
  children: ReactNode;
  className?: string;
}

export function HeroMotionItem({ as = "div", children, className }: MotionElementProps): ReactElement {
  if (as === "h1") {
    return (
      <m.h1 variants={heroItemVariants} className={cn(className)}>
        {children}
      </m.h1>
    );
  }

  if (as === "p") {
    return (
      <m.p variants={heroItemVariants} className={cn(className)}>
        {children}
      </m.p>
    );
  }

  return (
    <m.div variants={heroItemVariants} className={cn(className)}>
      {children}
    </m.div>
  );
}
