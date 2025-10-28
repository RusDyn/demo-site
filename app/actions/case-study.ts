"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import {
  createCaseStudyAsset,
  deleteCaseStudyAssetForUser,
  deleteCaseStudyForUser,
  getCaseStudyAssetForUser,
  getCaseStudyForUser,
  saveCaseStudyForUser,
} from "@/lib/prisma";
import {
  caseStudyMutationSchema,
  type CaseStudyAsset,
  type CaseStudyDetail,
  type CaseStudyMutationInput,
} from "@/lib/validators/case-study";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

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

interface RevalidateCaseStudyOptions {
  caseStudyId?: string | null;
  publicSlug?: string | null;
  previousPublicSlug?: string | null;
}

async function revalidateCaseStudyPaths({
  caseStudyId,
  publicSlug,
  previousPublicSlug,
}: RevalidateCaseStudyOptions = {}): Promise<void> {
  const publicSlugs = new Set(
    [publicSlug, previousPublicSlug].filter(
      (value): value is string => typeof value === "string" && value.length > 0,
    ),
  );

  const paths = new Set<string>([
    "/case-studies",
    "/dashboard/case-studies",
    publicSlugs.size === 0 ? "/case-studies/[publicSlug]" : "",
  ]);

  for (const currentSlug of publicSlugs) {
    paths.add(`/case-studies/${currentSlug}`);
  }

  paths.delete("");

  if (caseStudyId) {
    paths.add(`/dashboard/case-studies/${caseStudyId}`);
    paths.add(`/dashboard/case-studies/${caseStudyId}/edit`);
  }

  await Promise.all(
    [...paths].map(
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
    let previousPublicSlug: string | null = null;

    if (parsed.data.id) {
      const existing = await getCaseStudyForUser(session.user.id, parsed.data.id);
      previousPublicSlug = existing?.publicSlug ?? null;
    }

    const caseStudy = await saveCaseStudyForUser(session.user.id, parsed.data);
    await revalidateCaseStudyPaths({
      caseStudyId: caseStudy.id,
      publicSlug: caseStudy.publicSlug,
      previousPublicSlug:
        previousPublicSlug && previousPublicSlug !== caseStudy.publicSlug
          ? previousPublicSlug
          : null,
    });
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
    await revalidateCaseStudyPaths({ caseStudyId: id });
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
      await revalidateCaseStudyPaths({ caseStudyId: parsed.data.caseStudyId });
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

const assetIdSchema = z.object({
  assetId: z.string().min(1, "Asset identifier is required"),
});

function hasValidSignedUrl(
  data: unknown,
): data is {
  signedURL: string;
} {
  if (typeof data !== "object" || data === null || !("signedURL" in data)) {
    return false;
  }

  const signedURL = (data as { signedURL?: unknown }).signedURL;

  return typeof signedURL === "string" && signedURL.length > 0;
}

export type DeleteCaseStudyAssetActionResult =
  | {
      success: true;
      assetId: string;
      caseStudyId: string | null;
      heroCleared: boolean;
    }
  | {
      success: false;
      error: string;
    };

export async function deleteCaseStudyAssetAction(
  input: z.infer<typeof assetIdSchema>,
): Promise<DeleteCaseStudyAssetActionResult> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" } as const;
  }

  const parsed = assetIdSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    } as const;
  }

  const owned = await getCaseStudyAssetForUser(session.user.id, parsed.data.assetId);

  if (!owned) {
    return { success: false, error: "Asset not found" } as const;
  }

  try {
    const client = getSupabaseServiceRoleClient();
    const { error: removeError } = await client.storage
      .from(owned.asset.bucket)
      .remove([owned.asset.path]);

    if (removeError) {
      return { success: false, error: removeError.message } as const;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete asset";
    return { success: false, error: message } as const;
  }

  try {
    const { caseStudyId, wasHero } = await deleteCaseStudyAssetForUser(
      session.user.id,
      parsed.data.assetId,
    );

    await revalidateCaseStudyPaths({ caseStudyId });

    return {
      success: true,
      assetId: parsed.data.assetId,
      caseStudyId,
      heroCleared: wasHero,
    } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete asset";
    return { success: false, error: message } as const;
  }
}

export type FetchCaseStudyAssetUrlResult =
  | {
      success: true;
      signedUrl: string;
    }
  | {
      success: false;
      error: string;
    };

export async function fetchCaseStudyAssetUrlAction(
  input: z.infer<typeof assetIdSchema>,
): Promise<FetchCaseStudyAssetUrlResult> {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" } as const;
  }

  const parsed = assetIdSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    } as const;
  }

  const owned = await getCaseStudyAssetForUser(session.user.id, parsed.data.assetId);

  if (!owned) {
    return { success: false, error: "Asset not found" } as const;
  }

  try {
    const client = getSupabaseServiceRoleClient();
    const { data, error } = await client.storage
      .from(owned.asset.bucket)
      .createSignedUrl(owned.asset.path, 120);

    if (error) {
      return { success: false, error: error.message } as const;
    }

    if (!hasValidSignedUrl(data)) {
      return { success: false, error: "Failed to generate a signed URL" } as const;
    }

    return { success: true, signedUrl: data.signedURL } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate a signed URL";
    return { success: false, error: message } as const;
  }
}
