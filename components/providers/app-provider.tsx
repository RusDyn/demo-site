"use client";

import { type ReactElement, type ReactNode } from "react";
import type { DehydratedState } from "@tanstack/react-query";

import { AnimationProvider } from "@/components/providers/animation-provider";

import { TrpcProvider } from "./trpc-provider";

export function AppProvider({ children, state }: { children: ReactNode; state?: DehydratedState }): ReactElement {
  return (
    <TrpcProvider state={state}>
      <AnimationProvider>{children}</AnimationProvider>
    </TrpcProvider>
  );
}
