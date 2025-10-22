"use client";

import { LazyMotion } from "framer-motion";
import type { LazyFeatureBundle } from "framer-motion";
import type { ComponentProps, ReactElement, ReactNode } from "react";

type LazyMotionFeatures = NonNullable<ComponentProps<typeof LazyMotion>["features"]>;

const loadAnimationFeatures: LazyMotionFeatures = async () => {
  const { domAnimation } = await import("framer-motion");

  const features: LazyFeatureBundle = domAnimation;

  return features;
};

interface AnimationProviderProps {
  children: ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps): ReactElement {
  return <LazyMotion features={loadAnimationFeatures}>{children}</LazyMotion>;
}
