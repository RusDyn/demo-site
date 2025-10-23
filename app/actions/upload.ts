"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";

import { getSupabaseServiceRoleClient } from "@/lib/supabase";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const fileSchema = z.instanceof(File, {
  message: "A valid file must be provided.",
});

const metadataSchema = z.object({
  size: z
    .number()
    .min(1, "The file is empty.")
    .max(MAX_FILE_SIZE, `The file exceeds the ${Math.floor(MAX_FILE_SIZE / (1024 * 1024))}MB limit.`),
  type: z.string().min(1, "Unknown file type."),
  name: z.string().min(1, "The file name is required."),
});

const uploadOptionsSchema = z.object({
  folder: z.string().optional(),
  bucket: z.string().optional(),
  expiresIn: z.number().optional(),
});

function hasValidSignedUrl(
  data: unknown,
): data is {
  signedURL: string;
} {
  return (
    typeof data === "object" &&
    data !== null &&
    "signedURL" in data &&
    typeof (data as { signedURL?: unknown }).signedURL === "string"
  );
}

export type UploadOptions = z.infer<typeof uploadOptionsSchema>;

type StorageClient = Pick<ReturnType<typeof getSupabaseServiceRoleClient>, "storage">;

async function ensureBucketExists(
  client: StorageClient,
  bucket: string,
): Promise<void> {
  const existing = await client.storage.getBucket(bucket);
  if (!existing.data) {
    await client.storage.createBucket(bucket, {
      public: false,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: ["image/*", "application/pdf"],
    });
  }
}

export type UploadResult =
  | {
      success: true;
      path: string;
      signedUrl: string;
    }
  | {
      success: false;
      error: string;
    };

export async function uploadToSupabase(
  file: File,
  options?: UploadOptions,
  clientOverride?: StorageClient,
): Promise<UploadResult> {
  const fileCheck = fileSchema.safeParse(file);
  if (!fileCheck.success) {
    return { success: false, error: fileCheck.error.errors[0]?.message ?? "Invalid file" } as const;
  }

  const metadataCheck = metadataSchema.safeParse({
    size: file.size,
    type: file.type,
    name: file.name,
  });

  if (!metadataCheck.success) {
    return { success: false, error: metadataCheck.error.errors[0]?.message ?? "Invalid metadata" } as const;
  }

  const parsedOptions = uploadOptionsSchema.safeParse(options ?? {});

  if (!parsedOptions.success) {
    return { success: false, error: parsedOptions.error.errors[0]?.message ?? "Invalid options" } as const;
  }

  const bucket = parsedOptions.data.bucket ?? process.env.SUPABASE_STORAGE_BUCKET;

  if (!bucket) {
    return { success: false, error: "Storage bucket is not configured." } as const;
  }

  const client = clientOverride ?? getSupabaseServiceRoleClient();

  await ensureBucketExists(client, bucket);

  const sanitizedFolder = parsedOptions.data.folder?.replace(/(^\/+)|(\/+$)/g, "");
  const objectPath = [sanitizedFolder, `${randomUUID()}-${metadataCheck.data.name}`]
    .filter(Boolean)
    .join("/");

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error } = await client.storage.from(bucket).upload(objectPath, fileBuffer, {
    contentType: metadataCheck.data.type,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    return { success: false, error: error.message } as const;
  }

  const { data: signedUrlData, error: signedUrlError } = await client.storage
    .from(bucket)
    .createSignedUrl(objectPath, parsedOptions.data.expiresIn ?? 60 * 60);

  if (signedUrlError) {
    return { success: false, error: signedUrlError.message } as const;
  }

  if (!hasValidSignedUrl(signedUrlData) || signedUrlData.signedURL.length === 0) {
    return { success: false, error: "Failed to generate a signed URL." } as const;
  }

  return {
    success: true,
    path: objectPath,
    signedUrl: signedUrlData.signedURL,
  } as const;
}
