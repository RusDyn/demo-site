import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  deleteCaseStudyForUser,
  getCaseStudyForUser,
  listCaseStudiesForUser,
  saveCaseStudyForUser,
} from "@/lib/prisma";
import { caseStudyMutationSchema } from "@/lib/validators/case-study";

import { protectedProcedure, router } from "../trpc";

export const caseStudyRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return listCaseStudiesForUser(ctx.session.user.id);
  }),
  byId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const record = await getCaseStudyForUser(ctx.session.user.id, input.id);

      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Case study not found" });
      }

      return record;
    }),
  save: protectedProcedure.input(caseStudyMutationSchema).mutation(async ({ ctx, input }) => {
    return saveCaseStudyForUser(ctx.session.user.id, input);
  }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await deleteCaseStudyForUser(ctx.session.user.id, input.id);
      return { success: true } as const;
    }),
});

export type CaseStudyRouter = typeof caseStudyRouter;
