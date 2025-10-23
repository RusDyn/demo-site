// tRPC's inferred caller types are unavailable without the generated client.
import { dehydrate, QueryClient, type DehydratedState } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/context";
import { trpc } from "./react";

export async function createHydrationState(): Promise<DehydratedState> {
  const queryClient = new QueryClient();
  const context = await createTRPCContext();
  type AppCaller = ReturnType<typeof appRouter.createCaller>;
  const caller: AppCaller = appRouter.createCaller(context);

  const health = await caller.health.ping();
  queryClient.setQueryData(getQueryKey(trpc.health.ping, undefined, "query"), health);

  return dehydrate(queryClient);
}
