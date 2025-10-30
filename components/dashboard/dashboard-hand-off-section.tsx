"use client";

import { m, useReducedMotion } from "framer-motion";
import { Info } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
            ease: "easeOut" as const,
            delay,
          },
        };

  return (
    <m.section {...createMotionProps()} className="space-y-6">
      <m.div {...createMotionProps(0.05)}>
        <Alert variant="info" className="border-dashed border-primary/40 bg-primary/10">
          <Info className="h-5 w-5" aria-hidden="true" />
          <div>
            <AlertTitle>Draft hand-off guidance</AlertTitle>
            <AlertDescription className="text-sm">
              Capture your in-progress profile updates and case study drafts here, then use the dashboard to hand off polished
              work and monitor how each story performs with teammates.
            </AlertDescription>
          </div>
        </Alert>
      </m.div>
      <m.div {...createMotionProps(0.1)} className="space-y-6">
        {children}
      </m.div>
    </m.section>
  );
}
