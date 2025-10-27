import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { getPublicCaseStudyBySlug, listPublicCaseStudies } from "@/lib/prisma";

import { publicProcedure, router } from "../trpc";

export const publicCaseStudyRouter = router({
  list: publicProcedure.query(async () => {
    return listPublicCaseStudies();
  }),
  bySlug: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const record = await getPublicCaseStudyBySlug(input.slug);

      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Case study not found" });
      }

      return record;
    }),
});

export type PublicCaseStudyRouter = typeof publicCaseStudyRouter;
