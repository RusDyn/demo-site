"use client";

import { LazyMotion } from "framer-motion";
import type { ComponentProps, ReactElement, ReactNode } from "react";

type AnimationFeatureBundle = Record<string, unknown>;
type LazyAnimationFeatureBundle = () => Promise<AnimationFeatureBundle>;
type LazyMotionFeatures = AnimationFeatureBundle | LazyAnimationFeatureBundle;
type LazyMotionFeaturesProp = () => Promise<LazyMotionFeatures>;

interface FramerMotionModule {
  domAnimation: LazyMotionFeatures;
}

function isFramerMotionModule(value: unknown): value is FramerMotionModule {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { domAnimation?: unknown };

  if (typeof candidate.domAnimation === "function") {
    return true;
  }

  return typeof candidate.domAnimation === "object" && candidate.domAnimation !== null;
}

const loadAnimationFeatures: ComponentProps<typeof LazyMotion>["features"] = async () => {
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
  return (
    <LazyMotion features={loadAnimationFeatures as LazyMotionFeaturesProp}>{children}</LazyMotion>
  );
}
