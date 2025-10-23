"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactElement, ReactNode } from "react";

interface AnimationProviderProps {
  children: ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps): ReactElement {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
