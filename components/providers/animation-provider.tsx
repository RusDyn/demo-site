"use client";

import { LazyMotion } from "framer-motion";
import type { LazyFeatureBundle } from "framer-motion";
import type { ComponentProps, ReactElement, ReactNode } from "react";

type LazyMotionFeatures = NonNullable<ComponentProps<typeof LazyMotion>["features"]>;

interface FramerMotionModule {
  domAnimation: LazyFeatureBundle;
}

function isFramerMotionModule(value: unknown): value is FramerMotionModule {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { domAnimation?: unknown };

  return typeof candidate.domAnimation === "object" || typeof candidate.domAnimation === "function";
}

const loadAnimationFeatures: LazyMotionFeatures = async () => {
  const motionModule: unknown = await import("framer-motion");

  if (!isFramerMotionModule(motionModule)) {
    throw new Error("Failed to load framer-motion animation features");
  }

  return motionModule.domAnimation;
};

interface AnimationProviderProps {
  children: ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps): ReactElement {
  return <LazyMotion features={loadAnimationFeatures}>{children}</LazyMotion>;
}
