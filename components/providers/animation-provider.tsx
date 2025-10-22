"use client";

import { LazyMotion } from "framer-motion";
import type { ReactElement, ReactNode } from "react";

interface AnimationProviderProps {
  children: ReactNode;
}

type LazyMotionFeatures = NonNullable<React.ComponentProps<typeof LazyMotion>["features"]>;
type FeatureBundle = LazyMotionFeatures extends () => Promise<infer Bundle> ? Bundle : never;
type LazyFeatureLoader = Extract<LazyMotionFeatures, () => Promise<FeatureBundle>>;

const loadAnimationFeatures: LazyFeatureLoader = async () => {
  const motion = (await import("framer-motion")) as unknown as { domAnimation: FeatureBundle };
  return motion.domAnimation;
};

export function AnimationProvider({ children }: AnimationProviderProps): ReactElement {
  return <LazyMotion features={loadAnimationFeatures}>{children}</LazyMotion>;
}
