import { protectedProcedure, router } from "../trpc";
import { getProfileById } from "@/lib/prisma";
import { z } from "zod";

export const profileRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => getProfileById(ctx.session.user.id)),
  updateNamePreview: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100, "Name is too long"),
      }),
    )
    .mutation(async ({ input }) => ({
      preview: input.name.trim(),
    })),
});
