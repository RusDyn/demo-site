"use client";

import { m, useReducedMotion } from "framer-motion";
import type { ReactElement, ReactNode } from "react";

interface DashboardHandOffSectionProps {
  children: ReactNode;
}

export function DashboardHandOffSection({
  children,
}: DashboardHandOffSectionProps): ReactElement {
  const shouldReduceMotion = useReducedMotion();

  const createMotionProps = (delay = 0) =>
    shouldReduceMotion
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.45,
            ease: "easeOut",
            delay,
          },
        };

  return (
    <m.section {...createMotionProps()} className="space-y-6">
      <m.div
        {...createMotionProps(0.05)}
        className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground"
      >
        <p className="font-medium text-foreground">Draft hand-off guidance</p>
        <p className="mt-1">
          Capture your in-progress profile updates and case study drafts here, then use the dashboard to hand off polished work
          and monitor how each story performs with teammates.
        </p>
      </m.div>
      <m.div {...createMotionProps(0.1)} className="space-y-6">
        {children}
      </m.div>
    </m.section>
  );
}
