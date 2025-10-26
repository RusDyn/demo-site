"use client";

import type { AiPromptType } from "@/lib/validators/ai";

import { posthogClient } from "./posthog-client";

type CaptureProperties = Record<string, unknown> | undefined;

function capture(eventName: string, properties?: CaptureProperties): void {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof posthogClient.capture !== "function") {
    return;
  }

  posthogClient.capture(eventName, properties);
}

export function trackCaseStudyViewed(args: {
  id: string;
  title?: string;
  audience?: string | null;
}): void {
  capture("case_study_viewed", {
    caseStudyId: args.id,
    title: args.title,
    audience: args.audience ?? undefined,
    viewedAt: new Date().toISOString(),
  });
}

export function trackAiGenerationRequested(type: AiPromptType): void {
  capture("ai_generation_requested", {
    promptType: type,
    requestedAt: new Date().toISOString(),
  });
}

export function trackAiGenerationCompleted(
  type: AiPromptType,
  metadata?: Record<string, unknown>,
): void {
  capture("ai_generation_completed", {
    promptType: type,
    completedAt: new Date().toISOString(),
    ...metadata,
  });
}

export function trackAiGenerationErrored(type: AiPromptType, reason?: string): void {
  capture("ai_generation_failed", {
    promptType: type,
    failedAt: new Date().toISOString(),
    reason,
  });
}
