"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { updateProfileName } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

export type ProfileUpdateInput = z.infer<typeof profileSchema>;
export type ProfileUpdateResult =
  | { success: true }
  | {
      success: false;
      error: string;
    };

export async function updateProfileAction(input: ProfileUpdateInput): Promise<ProfileUpdateResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid input",
    } as const;
  }

  const session = await auth();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized",
    } as const;
  }

  await updateProfileName(session.user.id, parsed.data.name);

  revalidatePath("/");

  return {
    success: true,
  } as const;
}
