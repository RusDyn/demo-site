import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@/server/api/root";

export const trpc = createTRPCReact<AppRouter>();

export function useAnalyticsTopEventsQuery(
  input?: Parameters<typeof trpc.analytics.topEvents.useQuery>[0],
  options?: Parameters<typeof trpc.analytics.topEvents.useQuery>[1],
): ReturnType<typeof trpc.analytics.topEvents.useQuery> {
  return trpc.analytics.topEvents.useQuery(input, {
    retry: 1,
    ...options,
  });
}

export function useAnalyticsCohortsQuery(
  options?: Parameters<typeof trpc.analytics.cohorts.useQuery>[1],
): ReturnType<typeof trpc.analytics.cohorts.useQuery> {
  return trpc.analytics.cohorts.useQuery(undefined, {
    retry: 1,
    ...options,
  });
}

export function useAiGenerateMutation(
  options?: Parameters<typeof trpc.ai.generate.useMutation>[0],
): ReturnType<typeof trpc.ai.generate.useMutation> {
  return trpc.ai.generate.useMutation({
    retry: 0,
    ...options,
  });
}

export function useCaseStudyListQuery(
  options?: Parameters<typeof trpc.caseStudy.list.useQuery>[1],
): ReturnType<typeof trpc.caseStudy.list.useQuery> {
  return trpc.caseStudy.list.useQuery(undefined, {
    retry: 1,
    ...options,
  });
}

export function useCaseStudyByIdQuery(
  id: string,
  options?: Parameters<typeof trpc.caseStudy.byId.useQuery>[1],
): ReturnType<typeof trpc.caseStudy.byId.useQuery> {
  return trpc.caseStudy.byId.useQuery(
    { id },
    {
      retry: 1,
      ...options,
    },
  );
}

export function useCaseStudySaveMutation(
  options?: Parameters<typeof trpc.caseStudy.save.useMutation>[0],
): ReturnType<typeof trpc.caseStudy.save.useMutation> {
  return trpc.caseStudy.save.useMutation({
    retry: 0,
    ...options,
  });
}

export function useCaseStudyDeleteMutation(
  options?: Parameters<typeof trpc.caseStudy.delete.useMutation>[0],
): ReturnType<typeof trpc.caseStudy.delete.useMutation> {
  return trpc.caseStudy.delete.useMutation({
    retry: 0,
    ...options,
  });
}
