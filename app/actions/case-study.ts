"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import {
  createCaseStudyAsset,
  deleteCaseStudyForUser,
  saveCaseStudyForUser,
} from "@/lib/prisma";
import {
  caseStudyMutationSchema,
  type CaseStudyAsset,
  type CaseStudyDetail,
  type CaseStudyMutationInput,
} from "@/lib/validators/case-study";

import { uploadToSupabase } from "./upload";

function normalizeNullable(value: unknown): string | null | undefined {
  if (typeof value !== "string") {
    return value as string | null | undefined;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function normalizeMutationInput(input: CaseStudyMutationInput): CaseStudyMutationInput {
  return {
    ...input,
    audience: normalizeNullable(input.audience) ?? undefined,
    summary: normalizeNullable(input.summary) ?? null,
    headline: normalizeNullable(input.headline) ?? undefined,
    background: normalizeNullable(input.background) ?? undefined,
    results: normalizeNullable(input.results) ?? undefined,
    sections: input.sections.map((section, index) => ({
      ...section,
      position: typeof section.position === "number" ? section.position : index,
    })),
  };
}

async function revalidateCaseStudyPaths(caseStudyId?: string): Promise<void> {
  const paths = ["/case-studies"];
  if (caseStudyId) {
    paths.push(`/case-studies/${caseStudyId}`, `/case-studies/${caseStudyId}/edit`);
  }

  await Promise.all(
    paths.map(
      (path) =>
        new Promise<void>((resolve) => {
          revalidatePath(path);
          resolve();
        }),
    ),
  );
}

export type SaveCaseStudyActionResult =
  | {
      success: true;
      caseStudy: CaseStudyDetail;
    }
  | {
      success: false;
      error: string;
    };

export async function saveCaseStudyAction(
  rawInput: CaseStudyMutationInput,
): Promise<SaveCaseStudyActionResult> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" } as const;
  }

  const normalized = normalizeMutationInput(rawInput);
  const parsed = caseStudyMutationSchema.safeParse(normalized);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    } as const;
  }

  try {
    const caseStudy = await saveCaseStudyForUser(session.user.id, parsed.data);
    await revalidateCaseStudyPaths(caseStudy.id);
    return { success: true, caseStudy } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save case study";
    return { success: false, error: message } as const;
  }
}

export type DeleteCaseStudyActionResult =
  | { success: true }
  | {
      success: false;
      error: string;
    };

export async function deleteCaseStudyAction(id: string): Promise<DeleteCaseStudyActionResult> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" } as const;
  }

  if (!id || id.trim().length === 0) {
    return { success: false, error: "Missing case study identifier" } as const;
  }

  try {
    await deleteCaseStudyForUser(session.user.id, id);
    await revalidateCaseStudyPaths(id);
    return { success: true } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete case study";
    return { success: false, error: message } as const;
  }
}

const uploadSchema = z.object({
  caseStudyId: z.string().optional(),
  file: z.instanceof(File, {
    message: "A file must be provided",
  }),
});

export type UploadCaseStudyAssetResult =
  | {
      success: true;
      asset: CaseStudyAsset;
      signedUrl: string;
    }
  | {
      success: false;
      error: string;
    };

export async function uploadCaseStudyAssetAction(
  input: z.infer<typeof uploadSchema>,
): Promise<UploadCaseStudyAssetResult> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" } as const;
  }

  const parsed = uploadSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid upload payload",
    } as const;
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET;

  if (!bucket) {
    return { success: false, error: "Storage bucket is not configured" } as const;
  }

  const uploadResult = await uploadToSupabase(parsed.data.file, {
    folder: `case-studies/${session.user.id}`,
  });

  if (!uploadResult.success) {
    return { success: false, error: uploadResult.error } as const;
  }

  try {
    const asset = await createCaseStudyAsset(session.user.id, {
      caseStudyId: parsed.data.caseStudyId ?? null,
      bucket,
      path: uploadResult.path,
      name: parsed.data.file.name,
      mimeType: parsed.data.file.type,
      size: parsed.data.file.size,
    });

    if (parsed.data.caseStudyId) {
      await revalidateCaseStudyPaths(parsed.data.caseStudyId);
    }

    return {
      success: true,
      asset,
      signedUrl: uploadResult.signedUrl,
    } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to store asset metadata";
    return { success: false, error: message } as const;
  }
}
