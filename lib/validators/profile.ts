import { z } from "zod";

export const profileSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  image: z.string().nullable(),
  role: z.string(),
});

export type ProfileSummary = z.infer<typeof profileSchema>;
