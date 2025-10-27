import { z } from "zod";

export const profileSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  image: z.string().nullable(),
  role: z.string(),
});

const avatarUpdateSchema = z
  .union([
    z
      .string()
      .trim()
      .max(2048, "Avatar is too long")
      .transform((value) => (value.length === 0 ? null : value)),
    z.null(),
  ])
  .optional();

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  image: avatarUpdateSchema,
});

export type ProfileSummary = z.infer<typeof profileSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
