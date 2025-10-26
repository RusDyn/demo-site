import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@/server/api/root";

export const trpc = createTRPCReact<AppRouter>();

export function useAiGenerateMutation(
  options?: Parameters<typeof trpc.ai.generate.useMutation>[0],
): ReturnType<typeof trpc.ai.generate.useMutation> {
  return trpc.ai.generate.useMutation({
    retry: 0,
    ...options,
  });
}
