import { protectedProcedure, router } from "../trpc";
import { getProfileById } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validators/profile";

export const profileRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => getProfileById(ctx.session.user.id)),
  updateNamePreview: protectedProcedure
    .input(profileUpdateSchema.pick({ name: true }))
    .mutation(({ input }) => ({
      preview: input.name.trim(),
    })),
});
