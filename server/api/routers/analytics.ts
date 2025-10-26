import { z } from "zod";

import {
  fetchPosthogCohorts,
  fetchPosthogTopEvents,
  type FetchTopEventsOptions,
} from "@/lib/analytics/posthog-server";

import { protectedProcedure, router } from "../trpc";

const topEventsInputSchema = z
  .object({
    limit: z.number().int().min(1).max(50).optional(),
    dateFrom: z.union([z.string(), z.date()]).optional(),
    dateTo: z.union([z.string(), z.date()]).optional(),
  })
  .optional();

export const analyticsRouter = router({
  topEvents: protectedProcedure.input(topEventsInputSchema).query(async ({ input }) => {
    const options: FetchTopEventsOptions = {
      limit: input?.limit,
      dateFrom: input?.dateFrom,
      dateTo: input?.dateTo,
    };

    return fetchPosthogTopEvents(options);
  }),
  cohorts: protectedProcedure.query(async () => {
    return fetchPosthogCohorts();
  }),
});

export type AnalyticsRouter = typeof analyticsRouter;
