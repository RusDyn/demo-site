import assert from "node:assert/strict";
import test from "node:test";

import type { StorageClient } from "@/app/actions/upload";

const expectedSignedUrl = "https://example.com/signed";

test("returns a signed URL when Supabase succeeds", async () => {
  const mockClient: StorageClient = {
    storage: {
      getBucket() {
        return Promise.resolve(
          { data: {} } as Awaited<ReturnType<StorageClient["storage"]["getBucket"]>>,
        );
      },
      createBucket() {
        return Promise.resolve(
          {} as Awaited<ReturnType<StorageClient["storage"]["createBucket"]>>,
        );
      },
      from() {
        return {
          upload() {
            return Promise.resolve(
              { data: {}, error: null } as Awaited<ReturnType<ReturnType<StorageClient["storage"]["from"]>["upload"]>>,
            );
          },
          createSignedUrl() {
            return Promise.resolve(
              {
                data: { signedUrl: expectedSignedUrl, signedURL: expectedSignedUrl },
                error: null,
              } as Awaited<ReturnType<ReturnType<StorageClient["storage"]["from"]>["createSignedUrl"]>>,
            );
          },
        } satisfies ReturnType<StorageClient["storage"]["from"]>;
      },
    },
  };

  const { uploadToSupabase } = await import("../app/actions/upload");

  const originalBucket = process.env.SUPABASE_STORAGE_BUCKET;
  process.env.SUPABASE_STORAGE_BUCKET = "test-bucket";

  try {
    const file = new File(["test"], "example.txt", { type: "text/plain" });
    const result = await uploadToSupabase(file, undefined, mockClient);

    assert.equal(result.success, true);
    assert.equal(result.signedUrl, expectedSignedUrl);
    assert.match(result.path, /example.txt$/);
  } finally {
    process.env.SUPABASE_STORAGE_BUCKET = originalBucket;
  }
});
