"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { updateProfile } from "@/lib/prisma";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validators/profile";

import { uploadToSupabase } from "./upload";

export type ProfileUpdateResult =
  | { success: true }
  | {
      success: false;
      error: string;
    };

export async function updateProfileAction(input: ProfileUpdateInput): Promise<ProfileUpdateResult> {
  const parsed = profileUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    } as const;
  }

  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized",
    } as const;
  }

  const updateInput: ProfileUpdateInput = {
    name: parsed.data.name,
  };

  if (typeof parsed.data.image !== "undefined") {
    updateInput.image = parsed.data.image;
  }

  await updateProfile(session.user.id, updateInput);

  revalidatePath("/");

  return {
    success: true,
  } as const;
}

const avatarUploadSchema = z.object({
  file: z.instanceof(File, {
    message: "A file must be provided",
  }),
});

export type UploadProfileAvatarResult =
  | {
      success: true;
      path: string;
      signedUrl: string;
    }
  | {
      success: false;
      error: string;
    };

export async function uploadProfileAvatarAction(
  input: z.infer<typeof avatarUploadSchema>,
): Promise<UploadProfileAvatarResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized",
    } as const;
  }

  const parsed = avatarUploadSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid file",
    } as const;
  }

  const result = await uploadToSupabase(parsed.data.file, {
    folder: `avatars/${session.user.id}`,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    } as const;
  }

  return {
    success: true,
    path: result.path,
    signedUrl: result.signedUrl,
  } as const;
}
